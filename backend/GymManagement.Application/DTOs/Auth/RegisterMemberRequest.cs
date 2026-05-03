using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Auth;

public class RegisterMemberRequest
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

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = null!;

    [Required]
    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; } = null!;

    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public double? TargetWeight { get; set; }
    public string? Goal { get; set; }
}
