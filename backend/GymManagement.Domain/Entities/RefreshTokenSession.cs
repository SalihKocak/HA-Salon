namespace GymManagement.Domain.Entities;

public class RefreshTokenSession
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public string? DeviceInfo { get; set; }
    public string? IpAddress { get; set; }

    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}
