namespace GymManagement.Domain.Entities;

public class WhatsAppSettings
{
    public string Id { get; set; } = null!;

    public string? PhoneNumber { get; set; }
    public string? ApiBaseUrl { get; set; }
    public string? AccessToken { get; set; }
    public bool IsEnabled { get; set; } = false;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
}
