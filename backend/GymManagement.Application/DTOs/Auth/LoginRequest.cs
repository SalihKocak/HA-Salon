using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Auth;

public class LoginRequest
{
    [Required]
    public string Identifier { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}
