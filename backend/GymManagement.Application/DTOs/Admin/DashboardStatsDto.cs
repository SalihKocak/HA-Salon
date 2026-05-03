namespace GymManagement.Application.DTOs.Admin;

public class DashboardStatsDto
{
    public int TotalMembers { get; set; }
    public int PendingApprovals { get; set; }
    public int ActiveMemberships { get; set; }
    public int ExpiredMemberships { get; set; }
    public int TotalProducts { get; set; }
    public decimal TotalPaymentsThisMonth { get; set; }
    public decimal TotalExpensesThisMonth { get; set; }
    public int PaymentsDueCount { get; set; }
}
