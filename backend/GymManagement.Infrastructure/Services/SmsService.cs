using System.Net.Http.Json;
using System.Text.Json;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GymManagement.Infrastructure.Services;

public class SmsService : ISmsService
{
    private const string ApiUrl = "https://api.iletimerkezi.com/v1/send-sms";
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _db;
    private readonly ILogger<SmsService> _logger;

    public SmsService(
        HttpClient httpClient,
        IConfiguration configuration,
        AppDbContext db,
        ILogger<SmsService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _db = db;
        _logger = logger;
    }

    public async Task<bool> SendSmsAsync(string phoneNumber, string message)
    {
        var username = _configuration["Sms:Username"];
        var password = _configuration["Sms:Password"];
        var sender = _configuration["Sms:Sender"];
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);

        if (string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(sender))
        {
            const string err = "SMS configuration is missing. Check Sms:Username, Sms:Password, Sms:Sender.";
            _logger.LogWarning(err);
            await SaveLogAsync(normalizedPhone, message, "Failed", err);
            return false;
        }

        var payload = new
        {
            request = new
            {
                authentication = new
                {
                    username,
                    password
                },
                order = new
                {
                    sender,
                    sendDateTime = "",
                    message = new
                    {
                        text = message,
                        receipents = new
                        {
                            number = new[] { normalizedPhone }
                        }
                    }
                }
            }
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync(ApiUrl, payload);
            var content = await response.Content.ReadAsStringAsync();
            var success = response.IsSuccessStatusCode && IsSuccessfulResponse(content);

            if (success)
            {
                _logger.LogInformation("SMS sent successfully to {PhoneNumber}", normalizedPhone);
                await SaveLogAsync(normalizedPhone, message, "Sent", null);
                return true;
            }

            var error = string.IsNullOrWhiteSpace(content)
                ? $"SMS API returned HTTP {(int)response.StatusCode}."
                : content;

            _logger.LogWarning("SMS send failed. Phone: {PhoneNumber}, Error: {Error}", normalizedPhone, error);
            await SaveLogAsync(normalizedPhone, message, "Failed", error);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMS send failed with exception. Phone: {PhoneNumber}", normalizedPhone);
            await SaveLogAsync(normalizedPhone, message, "Failed", ex.Message);
            return false;
        }
    }

    private async Task SaveLogAsync(string phoneNumber, string message, string status, string? errorMessage)
    {
        _db.SmsLogs.Add(new SmsLog
        {
            Id = EntityId.New(),
            PhoneNumber = phoneNumber,
            Message = message,
            Status = status,
            CreatedAt = DateTime.UtcNow,
            ErrorMessage = errorMessage
        });

        await _db.SaveChangesAsync();
    }

    private static string NormalizePhoneNumber(string phoneNumber)
    {
        var normalized = phoneNumber.Trim();
        if (normalized.StartsWith("+", StringComparison.Ordinal))
            normalized = normalized[1..];
        return normalized;
    }

    private static bool IsSuccessfulResponse(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return false;

        try
        {
            using var doc = JsonDocument.Parse(content);
            if (!doc.RootElement.TryGetProperty("response", out var responseElement))
                return false;
            if (!responseElement.TryGetProperty("status", out var statusElement))
                return false;
            if (!statusElement.TryGetProperty("code", out var codeElement))
                return false;

            var code = codeElement.ValueKind == JsonValueKind.String
                ? codeElement.GetString()
                : codeElement.GetInt32().ToString();

            return code == "200";
        }
        catch
        {
            return false;
        }
    }
}
