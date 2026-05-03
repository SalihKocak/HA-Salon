using GymManagement.Application.DTOs.WhatsApp;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace GymManagement.Infrastructure.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(AppDbContext db, IConfiguration configuration, ILogger<WhatsAppService> logger)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<WhatsAppSettingsDto?> GetSettingsAsync()
    {
        var settings = await _db.WhatsAppSettings.AsNoTracking().OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null) return null;

        return new WhatsAppSettingsDto
        {
            PhoneNumber = settings.PhoneNumber,
            ApiBaseUrl = settings.ApiBaseUrl,
            IsEnabled = settings.IsEnabled,
            LastUpdatedAt = settings.LastUpdatedAt
        };
    }

    public async Task UpdateSettingsAsync(UpdateWhatsAppSettingsRequest request)
    {
        var existing = await _db.WhatsAppSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();

        if (existing == null)
        {
            _db.WhatsAppSettings.Add(new WhatsAppSettings
            {
                Id = EntityId.New(),
                PhoneNumber = request.PhoneNumber,
                ApiBaseUrl = request.ApiBaseUrl,
                AccessToken = request.AccessToken,
                IsEnabled = request.IsEnabled ?? false,
                LastUpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.LastUpdatedAt = DateTime.UtcNow;
            if (request.PhoneNumber != null)
                existing.PhoneNumber = request.PhoneNumber;
            if (request.ApiBaseUrl != null)
                existing.ApiBaseUrl = request.ApiBaseUrl;
            if (request.AccessToken != null)
                existing.AccessToken = request.AccessToken;
            if (request.IsEnabled.HasValue)
                existing.IsEnabled = request.IsEnabled.Value;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<List<MessageTemplateDto>> GetTemplatesAsync()
    {
        var templates = await _db.MessageTemplates.AsNoTracking()
            .OrderBy(t => t.Name)
            .ToListAsync();

        return templates.Select(MapTemplateToDto).ToList();
    }

    public async Task<MessageTemplateDto> CreateTemplateAsync(CreateMessageTemplateRequest request)
    {
        var template = new MessageTemplate
        {
            Id = EntityId.New(),
            Name = request.Name,
            Type = request.Type,
            Content = request.Content,
            IsActive = request.IsActive
        };

        _db.MessageTemplates.Add(template);
        await _db.SaveChangesAsync();

        return MapTemplateToDto(template);
    }

    public async Task<MessageTemplateDto> UpdateTemplateAsync(string id, CreateMessageTemplateRequest request)
    {
        var template = await _db.MessageTemplates.FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException("Template not found.");

        template.Name = request.Name;
        template.Type = request.Type;
        template.Content = request.Content;
        template.IsActive = request.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapTemplateToDto(template);
    }

    public async Task DeleteTemplateAsync(string id)
    {
        var n = await _db.MessageTemplates.Where(t => t.Id == id).ExecuteDeleteAsync();
        if (n == 0)
            throw new KeyNotFoundException("Template not found.");
    }

    public async Task<List<MessageLogDto>> GetLogsAsync(int page, int pageSize)
    {
        var logs = await _db.MessageLogs.AsNoTracking()
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return logs.Select(MapLogToDto).ToList();
    }

    public async Task<bool> SendMessageAsync(string phoneNumber, string content, string? templateName = null)
    {
        if (string.IsNullOrWhiteSpace(templateName))
            return await SendTextMessageAsync(phoneNumber, content);

        _db.MessageLogs.Add(new MessageLog
        {
            Id = EntityId.New(),
            PhoneNumber = phoneNumber,
            Content = content,
            TemplateName = templateName,
            Status = "NotSent",
            ErrorMessage = "WhatsApp integration not yet configured."
        });

        await _db.SaveChangesAsync();
        return false;
    }

    public async Task<bool> SendTextMessageAsync(string phoneNumber, string message)
    {
        var accountSid = _configuration["TWILIO_ACCOUNT_SID"] ?? _configuration["Twilio:AccountSid"];
        var authToken = _configuration["TWILIO_AUTH_TOKEN"] ?? _configuration["Twilio:AuthToken"];
        var fromNumber = _configuration["TWILIO_WHATSAPP_FROM"] ?? _configuration["Twilio:WhatsAppFrom"];

        if (string.IsNullOrWhiteSpace(accountSid) ||
            string.IsNullOrWhiteSpace(authToken) ||
            string.IsNullOrWhiteSpace(fromNumber))
        {
            const string configError = "Twilio configuration is missing. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.";
            _logger.LogWarning(configError);
            await SaveMessageLogAsync(phoneNumber, message, "Failed", configError, null);
            return false;
        }

        try
        {
            TwilioClient.Init(accountSid, authToken);
            var response = await MessageResource.CreateAsync(
                from: new PhoneNumber(fromNumber),
                to: new PhoneNumber(NormalizeWhatsAppNumber(phoneNumber)),
                body: message);

            _logger.LogInformation("Twilio WhatsApp message sent. Sid: {Sid}, To: {To}", response.Sid, phoneNumber);
            await SaveMessageLogAsync(phoneNumber, message, "Sent", null, DateTime.UtcNow);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Twilio WhatsApp send failed. To: {To}", phoneNumber);
            await SaveMessageLogAsync(phoneNumber, message, "Failed", ex.Message, null);
            return false;
        }
    }

    private static MessageTemplateDto MapTemplateToDto(MessageTemplate t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Type = t.Type,
        Content = t.Content,
        IsActive = t.IsActive,
        CreatedAt = t.CreatedAt
    };

    private static MessageLogDto MapLogToDto(MessageLog l) => new()
    {
        Id = l.Id,
        MemberId = l.MemberId,
        PhoneNumber = l.PhoneNumber,
        Channel = l.Channel,
        TemplateName = l.TemplateName,
        Content = l.Content,
        Status = l.Status,
        SentAt = l.SentAt,
        ErrorMessage = l.ErrorMessage,
        CreatedAt = l.CreatedAt
    };

    private async Task SaveMessageLogAsync(string phoneNumber, string content, string status, string? error, DateTime? sentAt)
    {
        _db.MessageLogs.Add(new MessageLog
        {
            Id = EntityId.New(),
            PhoneNumber = phoneNumber,
            Content = content,
            Status = status,
            ErrorMessage = error,
            SentAt = sentAt
        });

        await _db.SaveChangesAsync();
    }

    private static string NormalizeWhatsAppNumber(string phoneNumber)
    {
        var normalized = phoneNumber.Trim();
        return normalized.StartsWith("whatsapp:", StringComparison.OrdinalIgnoreCase)
            ? normalized
            : $"whatsapp:{normalized}";
    }
}
