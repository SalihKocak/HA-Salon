using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Sms;

public class TestSendSmsRequest
{
    [Required]
    [Phone]
    [MaxLength(40)]
    public string PhoneNumber { get; set; } = null!;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = null!;
}
