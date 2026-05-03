using GymManagement.Application.DTOs.Admin;

namespace GymManagement.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
