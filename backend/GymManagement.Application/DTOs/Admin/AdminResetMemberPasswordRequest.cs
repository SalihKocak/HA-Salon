using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Admin;

public class AdminResetMemberPasswordRequest
{
    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string NewPassword { get; set; } = null!;
}
