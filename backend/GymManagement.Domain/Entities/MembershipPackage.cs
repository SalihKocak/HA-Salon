namespace GymManagement.Domain.Entities;

public class MembershipPackage
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int DurationInDays { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
