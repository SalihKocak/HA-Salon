using GymManagement.Domain.Enums;

namespace GymManagement.Domain.Entities;

public class Payment
{
    public string Id { get; set; } = null!;

    /// <summary>Normal üye ödemeleri için dolu; günlük / deneme ziyaretçisi ödemelerinde null.</summary>
    public string? MemberId { get; set; }

    public string? PackageId { get; set; }

    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public DateTime? PaidAt { get; set; }
    public DateTime DueDate { get; set; }
    public string? Note { get; set; }

    /// <summary>Salona günlük gelen, sistem üyesi olmayan ziyaretçi ödemesi.</summary>
    public bool IsDailyPass { get; set; }

    public string? DailyVisitorFirstName { get; set; }
    public string? DailyVisitorLastName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
