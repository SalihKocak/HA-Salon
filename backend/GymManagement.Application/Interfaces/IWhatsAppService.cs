using GymManagement.Application.DTOs.WhatsApp;

namespace GymManagement.Application.Interfaces;

public interface IWhatsAppService
{
    Task<WhatsAppSettingsDto?> GetSettingsAsync();
    Task UpdateSettingsAsync(UpdateWhatsAppSettingsRequest request);
    Task<List<MessageTemplateDto>> GetTemplatesAsync();
    Task<MessageTemplateDto> CreateTemplateAsync(CreateMessageTemplateRequest request);
    Task<MessageTemplateDto> UpdateTemplateAsync(string id, CreateMessageTemplateRequest request);
    Task DeleteTemplateAsync(string id);
    Task<List<MessageLogDto>> GetLogsAsync(int page, int pageSize);
    Task<bool> SendTextMessageAsync(string phoneNumber, string message);

    // Future integration hook - returns false until a real provider is plugged in
    Task<bool> SendMessageAsync(string phoneNumber, string content, string? templateName = null);
}
