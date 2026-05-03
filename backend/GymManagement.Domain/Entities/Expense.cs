namespace GymManagement.Domain.Entities;

public class Expense
{
    public string Id { get; set; } = null!;

    public string Title { get; set; } = null!;
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
