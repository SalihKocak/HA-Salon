namespace GymManagement.Domain.Entities;

public class MemberProfile
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public double? TargetWeight { get; set; }
    public string? Goal { get; set; }
    public string? Notes { get; set; }

    public double? RecommendedDailyCalories { get; set; }

    public double? MeasurementBodyFat { get; set; }
    public double? MeasurementMuscleMass { get; set; }
    public double? MeasurementChestCm { get; set; }
    public double? MeasurementWaistCm { get; set; }
    public double? MeasurementHipCm { get; set; }

    public string? ActivePackageId { get; set; }

    public DateTime? MembershipStartDate { get; set; }
    public DateTime? MembershipEndDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
