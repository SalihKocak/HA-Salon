namespace GymManagement.Domain.Entities;

public class GymSettings
{
    public string Id { get; set; } = null!;

    public string GymName { get; set; } = "My Gym";
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
    public string? WhatsAppContactNumber { get; set; }
    public string? MapEmbedUrl { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
