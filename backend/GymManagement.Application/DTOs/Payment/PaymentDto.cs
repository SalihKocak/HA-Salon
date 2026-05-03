using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Payment;

public class PaymentDto
{
    public string Id { get; set; } = null!;
    public string? MemberId { get; set; }
    public string MemberName { get; set; } = null!;
    public bool IsDailyPass { get; set; }
    public string? PackageId { get; set; }
    public string? PackageName { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? PaidAt { get; set; }
    public DateTime DueDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePaymentRequest
{
    /// <summary>true ise MemberId yok; DailyVisitorFirstName / LastName zorunlu.</summary>
    public bool IsDailyPass { get; set; }

    [MaxLength(64)]
    public string? MemberId { get; set; }

    [MaxLength(200)]
    public string? DailyVisitorFirstName { get; set; }

    [MaxLength(200)]
    public string? DailyVisitorLastName { get; set; }

    [MaxLength(64)]
    public string? PackageId { get; set; }

    [Required]
    [Range(0.01, 1000000)]
    public decimal Amount { get; set; }

    [MaxLength(64)]
    public string PaymentMethod { get; set; } = "Cash";

    [Required]
    public DateTime DueDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdatePaymentRequest
{
    [MaxLength(64)]
    public string? PaymentMethod { get; set; }

    [RegularExpression("^(Pending|Paid|Overdue|Cancelled)$",
        ErrorMessage = "Status must be one of: Pending, Paid, Overdue, Cancelled.")]
    public string? Status { get; set; }

    public DateTime? PaidAt { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
