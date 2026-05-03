using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Expense;

public class ExpenseDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = null!;

    public string? Category { get; set; }

    [Required]
    [Range(0.01, 1000000)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime ExpenseDate { get; set; }

    public string? Note { get; set; }
}

public class UpdateExpenseRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Category { get; set; }

    [Range(0.01, 1000000)]
    public decimal? Amount { get; set; }

    public DateTime? ExpenseDate { get; set; }
    public string? Note { get; set; }
}
