using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Payment;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = "Admin")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<PaymentDto>>>> GetAll(
        [FromQuery] string? memberId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _paymentService.GetAllAsync(memberId, status, page, pageSize);
        return Ok(ApiResponse<PagedResult<PaymentDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetById(string id)
    {
        var payment = await _paymentService.GetByIdAsync(id);
        if (payment == null) return NotFound(ApiResponse<PaymentDto>.Fail("Payment not found."));
        return Ok(ApiResponse<PaymentDto>.Ok(payment));
    }

    [HttpGet("member/{memberId}")]
    public async Task<ActionResult<ApiResponse<List<PaymentDto>>>> GetByMember(string memberId)
    {
        var payments = await _paymentService.GetByMemberIdAsync(memberId);
        return Ok(ApiResponse<List<PaymentDto>>.Ok(payments));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> Create([FromBody] CreatePaymentRequest request)
    {
        var payment = await _paymentService.CreateAsync(request);
        return Created($"/api/payments/{payment.Id}", ApiResponse<PaymentDto>.Ok(payment));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> Update(string id, [FromBody] UpdatePaymentRequest request)
    {
        var payment = await _paymentService.UpdateAsync(id, request);
        return Ok(ApiResponse<PaymentDto>.Ok(payment));
    }
}
