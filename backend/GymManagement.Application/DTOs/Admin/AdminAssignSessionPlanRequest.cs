using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Admin;

public class AdminAssignSessionPlanRequest
{
    public List<WeeklySessionPlanRequest> WeeklySessions { get; set; } = new();
}
