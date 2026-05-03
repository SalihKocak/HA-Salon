using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Member;

public class UpdateProfileRequest
{
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [Phone]
    [MaxLength(50)]
    public string? PhoneNumber { get; set; }

    [MaxLength(32)]
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }

    [Range(50, 260)]
    public double? Height { get; set; }

    [Range(20, 400)]
    public double? Weight { get; set; }

    [Range(20, 400)]
    public double? TargetWeight { get; set; }

    [MaxLength(120)]
    public string? Goal { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Range(0, 10000)]
    public double? RecommendedDailyCalories { get; set; }
}
