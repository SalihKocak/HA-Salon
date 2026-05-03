namespace GymManagement.Domain.Entities;

public class ErrorLog
{
    public string Id { get; set; } = null!;
    public string? UserId { get; set; }
    public string? UserRole { get; set; }
    public string Message { get; set; } = null!;
    public string? ExceptionType { get; set; }
    public string? StackTrace { get; set; }
    public string? RequestPath { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
