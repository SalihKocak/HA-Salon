namespace GymManagement.Application.DTOs.Member;

public class MemberDetailDto
{
    public string Id { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Status { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

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
    public string? ActivePackageName { get; set; }
    public DateTime? MembershipStartDate { get; set; }
    public DateTime? MembershipEndDate { get; set; }
}
