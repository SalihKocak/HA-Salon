using GymManagement.Application.DTOs.Admin;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalMembers = await _db.Users.CountAsync(u => u.Role == UserRole.Member);
        var pendingApprovals = await _db.Users.CountAsync(u => u.Role == UserRole.Member && u.Status == MemberStatus.Pending);
        var activeMemberships = await _db.MemberProfiles.CountAsync(p => p.MembershipEndDate != null && p.MembershipEndDate >= now);
        var expiredMemberships = await _db.MemberProfiles.CountAsync(p => p.MembershipEndDate != null && p.MembershipEndDate < now);
        var totalProducts = await _db.Products.CountAsync(p => p.IsActive);
        var paymentsDueCount = await _db.Payments.CountAsync(p => p.Status == PaymentStatus.Pending && p.DueDate < now);

        var paymentsThisMonth = await _db.Payments
            .Where(p => p.Status == PaymentStatus.Paid && p.PaidAt >= startOfMonth)
            .Select(p => p.Amount)
            .ToListAsync();

        var productSalesThisMonth = await _db.ProductSales
            .Where(s => s.IsPaid && s.PaidAt >= startOfMonth)
            .Select(s => s.PaidAmount)
            .ToListAsync();

        var expensesThisMonth = await _db.Expenses
            .Where(e => e.ExpenseDate >= startOfMonth)
            .Select(e => e.Amount)
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalMembers = totalMembers,
            PendingApprovals = pendingApprovals,
            ActiveMemberships = activeMemberships,
            ExpiredMemberships = expiredMemberships,
            TotalProducts = totalProducts,
            PaymentsDueCount = paymentsDueCount,
            TotalPaymentsThisMonth = paymentsThisMonth.Sum() + productSalesThisMonth.Sum(),
            TotalExpensesThisMonth = expensesThisMonth.Sum()
        };
    }
}
