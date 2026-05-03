namespace GymManagement.Domain.Entities;

public class ActivityLog
{
    public string Id { get; set; } = null!;
    public string? ActorUserId { get; set; }
    public string? ActorRole { get; set; }
    public string ActionType { get; set; } = null!;
    public string? TargetType { get; set; }
    public string? TargetId { get; set; }
    public string? Detail { get; set; }
    public string? RequestPath { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
