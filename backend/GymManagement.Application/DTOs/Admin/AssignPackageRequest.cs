using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Admin;

public class AssignPackageRequest
{
    [Required]
    public string PackageId { get; set; } = null!;

    [Required]
    public DateTime StartDate { get; set; }
}
