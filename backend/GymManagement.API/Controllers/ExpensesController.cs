using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Expense;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize(Roles = "Admin")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ExpenseDto>>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _expenseService.GetAllAsync(category, from, to, page, pageSize);
        return Ok(ApiResponse<PagedResult<ExpenseDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseDto>>> GetById(string id)
    {
        var expense = await _expenseService.GetByIdAsync(id);
        if (expense == null) return NotFound(ApiResponse<ExpenseDto>.Fail("Expense not found."));
        return Ok(ApiResponse<ExpenseDto>.Ok(expense));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExpenseDto>>> Create([FromBody] CreateExpenseRequest request)
    {
        var expense = await _expenseService.CreateAsync(request);
        return Created($"/api/expenses/{expense.Id}", ApiResponse<ExpenseDto>.Ok(expense));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseDto>>> Update(string id, [FromBody] UpdateExpenseRequest request)
    {
        var expense = await _expenseService.UpdateAsync(id, request);
        return Ok(ApiResponse<ExpenseDto>.Ok(expense));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(string id)
    {
        await _expenseService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Expense deleted."));
    }
}
