using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Package;

public class PackageDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int DurationInDays { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePackageRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    [Required]
    [Range(1, 3650)]
    public int DurationInDays { get; set; }

    [Required]
    [Range(0.01, 100000)]
    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdatePackageRequest
{
    [MaxLength(150)]
    public string? Name { get; set; }

    public string? Description { get; set; }

    [Range(1, 3650)]
    public int? DurationInDays { get; set; }

    [Range(0.01, 100000)]
    public decimal? Price { get; set; }

    public bool? IsActive { get; set; }
}
