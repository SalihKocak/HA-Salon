namespace GymManagement.Domain.Entities;

public class SmsLog
{
    public string Id { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ErrorMessage { get; set; }
}
