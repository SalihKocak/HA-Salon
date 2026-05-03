namespace GymManagement.Domain.Entities;

public class MessageLog
{
    public string Id { get; set; } = null!;

    public string? MemberId { get; set; }

    public string PhoneNumber { get; set; } = null!;
    public string Channel { get; set; } = "WhatsApp";
    public string? TemplateName { get; set; }
    public string Content { get; set; } = null!;
    public string Status { get; set; } = "Pending";
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
