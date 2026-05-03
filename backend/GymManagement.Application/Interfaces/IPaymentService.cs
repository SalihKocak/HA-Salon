using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Payment;

namespace GymManagement.Application.Interfaces;

public interface IPaymentService
{
    Task<PagedResult<PaymentDto>> GetAllAsync(string? memberId, string? status, int page, int pageSize);
    Task<List<PaymentDto>> GetByMemberIdAsync(string memberId);
    Task<PaymentDto?> GetByIdAsync(string id);
    Task<PaymentDto> CreateAsync(CreatePaymentRequest request);
    Task<PaymentDto> UpdateAsync(string id, UpdatePaymentRequest request);
}
