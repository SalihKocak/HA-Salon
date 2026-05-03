using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Product;

public class ProductDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Category { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    public string? Category { get; set; }

    [Required]
    [Range(0, 1000000)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdateProductRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    public string? Category { get; set; }

    [Range(0, 1000000)]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue)]
    public int? StockQuantity { get; set; }

    public bool? IsActive { get; set; }
}

public class ProductSaleDto
{
    public string Id { get; set; } = null!;
    public string ProductId { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public string MemberId { get; set; } = null!;
    public string MemberName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductSaleRequest
{
    [Required]
    [MaxLength(64)]
    public string MemberId { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string ProductId { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0.01, 1000000)]
    public decimal UnitPrice { get; set; }

    [Required]
    [MaxLength(64)]
    public string PaymentMethod { get; set; } = "Cash";

    public bool IsPaid { get; set; }

    [Range(0, 1000000)]
    public decimal? PaidAmount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdateProductSaleRequest
{
    [Required]
    [MaxLength(64)]
    public string MemberId { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string ProductId { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0.01, 1000000)]
    public decimal UnitPrice { get; set; }

    [Required]
    [MaxLength(64)]
    public string PaymentMethod { get; set; } = "Cash";

    public bool IsPaid { get; set; }

    [Range(0, 1000000)]
    public decimal? PaidAmount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
