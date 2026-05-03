using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Member;

public class UpdateAccountSettingsRequest
{
    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = null!;

    [EmailAddress]
    public string? Email { get; set; }

    public string? CurrentPassword { get; set; }

    [MinLength(6)]
    [MaxLength(100)]
    public string? NewPassword { get; set; }
}
