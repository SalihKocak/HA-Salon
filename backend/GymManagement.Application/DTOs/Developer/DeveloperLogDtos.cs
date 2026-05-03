namespace GymManagement.Application.DTOs.Developer;

public class ActivityLogDto
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
    public DateTime CreatedAt { get; set; }
}

public class ErrorLogDto
{
    public string Id { get; set; } = null!;
    public string? UserId { get; set; }
    public string? UserRole { get; set; }
    public string Message { get; set; } = null!;
    public string? ExceptionType { get; set; }
    public string? RequestPath { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
