using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Admin;

public class AdminCreateMemberRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = null!;

    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = null!;

    [MinLength(8)]
    public string? Password { get; set; }

    [MaxLength(64)]
    public string? PackageId { get; set; }

    public DateTime? PackageStartDate { get; set; }

    public List<WeeklySessionPlanRequest> WeeklySessions { get; set; } = new();
}

public class WeeklySessionPlanRequest
{
    [Range(0, 6)]
    public int DayOfWeek { get; set; }

    [Required]
    [RegularExpression(@"^(([01]\d|2[0-3]):[0-5]\d|([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d)$", ErrorMessage = "SessionTime must be in HH:mm or HH:mm-HH:mm format.")]
    public string SessionTime { get; set; } = null!;
}
