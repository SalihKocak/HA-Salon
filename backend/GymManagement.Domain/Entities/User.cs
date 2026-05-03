using GymManagement.Domain.Enums;

namespace GymManagement.Domain.Entities;

public class User
{
    public string Id { get; set; } = null!;

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Email { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;

    public UserRole Role { get; set; } = UserRole.Member;
    public MemberStatus Status { get; set; } = MemberStatus.Pending;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
