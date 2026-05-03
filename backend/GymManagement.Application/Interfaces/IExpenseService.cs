using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Expense;

namespace GymManagement.Application.Interfaces;

public interface IExpenseService
{
    Task<PagedResult<ExpenseDto>> GetAllAsync(string? category, DateTime? from, DateTime? to, int page, int pageSize);
    Task<ExpenseDto?> GetByIdAsync(string id);
    Task<ExpenseDto> CreateAsync(CreateExpenseRequest request);
    Task<ExpenseDto> UpdateAsync(string id, UpdateExpenseRequest request);
    Task DeleteAsync(string id);
}
