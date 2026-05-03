using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Expense;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class ExpenseService : IExpenseService
{
    private readonly AppDbContext _db;

    public ExpenseService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ExpenseDto>> GetAllAsync(string? category, DateTime? from, DateTime? to, int page, int pageSize)
    {
        var query = _db.Expenses.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
        {
            var pattern = $"%{category}%";
            query = query.Where(e => e.Category != null && EF.Functions.ILike(e.Category, pattern));
        }

        if (from.HasValue)
            query = query.Where(e => e.ExpenseDate >= from.Value);

        if (to.HasValue)
            query = query.Where(e => e.ExpenseDate <= to.Value);

        var total = await query.CountAsync();
        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ExpenseDto>
        {
            Items = expenses.Select(MapToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ExpenseDto?> GetByIdAsync(string id)
    {
        var expense = await _db.Expenses.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return expense == null ? null : MapToDto(expense);
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseRequest request)
    {
        var expense = new Expense
        {
            Id = EntityId.New(),
            Title = request.Title,
            Category = request.Category,
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate,
            Note = request.Note
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();

        return MapToDto(expense);
    }

    public async Task<ExpenseDto> UpdateAsync(string id, UpdateExpenseRequest request)
    {
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new KeyNotFoundException("Expense not found.");
        expense.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Title))
            expense.Title = request.Title;
        if (request.Category != null)
            expense.Category = request.Category;
        if (request.Amount.HasValue)
            expense.Amount = request.Amount.Value;
        if (request.ExpenseDate.HasValue)
            expense.ExpenseDate = request.ExpenseDate.Value;
        if (request.Note != null)
            expense.Note = request.Note;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(string id)
    {
        var n = await _db.Expenses.Where(e => e.Id == id).ExecuteDeleteAsync();
        if (n == 0)
            throw new KeyNotFoundException("Expense not found.");
    }

    private static ExpenseDto MapToDto(Expense e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        Category = e.Category,
        Amount = e.Amount,
        ExpenseDate = e.ExpenseDate,
        Note = e.Note,
        CreatedAt = e.CreatedAt
    };
}
