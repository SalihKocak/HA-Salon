namespace GymManagement.Domain.Entities;

public class ProductSale
{
    public string Id { get; set; } = null!;
    public string ProductId { get; set; } = null!;
    public string MemberId { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal PaidAmount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
