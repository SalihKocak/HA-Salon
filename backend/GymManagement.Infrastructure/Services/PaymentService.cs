using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Payment;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<PaymentDto>> GetAllAsync(string? memberId, string? status, int page, int pageSize)
    {
        var query = _db.Payments.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(memberId))
            query = query.Where(p => p.MemberId == memberId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<PaymentStatus>(status, true, out var paymentStatus))
            query = query.Where(p => p.Status == paymentStatus);

        var total = await query.CountAsync();
        var payments = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var memberIds = payments
            .Where(p => !string.IsNullOrWhiteSpace(p.MemberId))
            .Select(p => p.MemberId!)
            .Distinct()
            .ToList();
        var packageIds = payments.Where(p => p.PackageId != null).Select(p => p.PackageId!).Distinct().ToList();

        var members = memberIds.Count > 0
            ? await _db.Users.AsNoTracking().Where(u => memberIds.Contains(u.Id)).ToListAsync()
            : [];
        var packages = packageIds.Count > 0
            ? await _db.MembershipPackages.AsNoTracking().Where(p => packageIds.Contains(p.Id)).ToListAsync()
            : [];

        var items = payments.Select(p =>
        {
            var package = p.PackageId != null ? packages.FirstOrDefault(pk => pk.Id == p.PackageId) : null;
            var memberName = ResolveMemberDisplayName(p, members);
            return MapToDto(p, memberName, package?.Name);
        }).ToList();

        return new PagedResult<PaymentDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<PaymentDto>> GetByMemberIdAsync(string memberId)
    {
        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.MemberId == memberId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var member = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == memberId);
        var memberName = member != null ? $"{member.FirstName} {member.LastName}" : "Unknown";

        return payments.Select(p => MapToDto(p, memberName, null)).ToList();
    }

    public async Task<PaymentDto?> GetByIdAsync(string id)
    {
        var payment = await _db.Payments.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (payment == null) return null;

        var memberName = await ResolveMemberDisplayNameAsync(payment);
        return MapToDto(payment, memberName, null);
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentRequest request)
    {
        if (request.IsDailyPass)
        {
            var fn = request.DailyVisitorFirstName?.Trim() ?? "";
            var ln = request.DailyVisitorLastName?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(fn) || string.IsNullOrWhiteSpace(ln))
                throw new ArgumentException("Günlük ziyaretçi için ad ve soyad zorunludur.");

            var due = NormalizeUtc(request.DueDate);
            var payment = new Payment
            {
                Id = EntityId.New(),
                MemberId = null,
                PackageId = null,
                IsDailyPass = true,
                DailyVisitorFirstName = fn,
                DailyVisitorLastName = ln,
                Amount = request.Amount,
                PaymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "Cash" : request.PaymentMethod,
                Status = PaymentStatus.Paid,
                PaidAt = DateTime.UtcNow,
                DueDate = due,
                Note = request.Note
            };

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();
            return (await GetByIdAsync(payment.Id))!;
        }

        if (string.IsNullOrWhiteSpace(request.MemberId))
            throw new ArgumentException("Üye ödemesi için MemberId zorunludur.");

        var standardPayment = new Payment
        {
            Id = EntityId.New(),
            MemberId = request.MemberId,
            PackageId = request.PackageId,
            IsDailyPass = false,
            DailyVisitorFirstName = null,
            DailyVisitorLastName = null,
            Amount = request.Amount,
            PaymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "Cash" : request.PaymentMethod,
            Status = PaymentStatus.Pending,
            DueDate = NormalizeUtc(request.DueDate),
            Note = request.Note
        };

        _db.Payments.Add(standardPayment);
        await _db.SaveChangesAsync();

        return (await GetByIdAsync(standardPayment.Id))!;
    }

    public async Task<PaymentDto> UpdateAsync(string id, UpdatePaymentRequest request)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Payment not found.");

        payment.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.PaymentMethod))
            payment.PaymentMethod = request.PaymentMethod;

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<PaymentStatus>(request.Status, true, out var newStatus))
        {
            payment.Status = newStatus;
            if (newStatus == PaymentStatus.Paid && !payment.PaidAt.HasValue)
                payment.PaidAt = request.PaidAt ?? DateTime.UtcNow;
        }

        if (request.Note != null)
            payment.Note = request.Note;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    private static DateTime NormalizeUtc(DateTime dueDate)
    {
        if (dueDate.Kind == DateTimeKind.Unspecified)
            return DateTime.SpecifyKind(dueDate, DateTimeKind.Utc);
        return dueDate.ToUniversalTime();
    }

    private static string ResolveMemberDisplayName(Payment p, List<User> members)
    {
        if (p.IsDailyPass)
            return $"{p.DailyVisitorFirstName} {p.DailyVisitorLastName}".Trim();
        if (string.IsNullOrWhiteSpace(p.MemberId))
            return "Unknown";
        var member = members.FirstOrDefault(m => m.Id == p.MemberId);
        return member != null ? $"{member.FirstName} {member.LastName}" : "Unknown";
    }

    private async Task<string> ResolveMemberDisplayNameAsync(Payment p)
    {
        if (p.IsDailyPass)
            return $"{p.DailyVisitorFirstName} {p.DailyVisitorLastName}".Trim();
        if (string.IsNullOrWhiteSpace(p.MemberId))
            return "Unknown";
        var member = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == p.MemberId);
        return member != null ? $"{member.FirstName} {member.LastName}" : "Unknown";
    }

    private static PaymentDto MapToDto(Payment p, string memberName, string? packageName) => new()
    {
        Id = p.Id,
        MemberId = p.MemberId,
        MemberName = memberName,
        IsDailyPass = p.IsDailyPass,
        PackageId = p.PackageId,
        PackageName = packageName,
        Amount = p.Amount,
        PaymentMethod = p.PaymentMethod,
        Status = p.Status.ToString(),
        PaidAt = p.PaidAt,
        DueDate = p.DueDate,
        Note = p.Note,
        CreatedAt = p.CreatedAt
    };
}
