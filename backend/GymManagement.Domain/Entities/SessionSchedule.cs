using GymManagement.Domain.Enums;

namespace GymManagement.Domain.Entities;

public class SessionSchedule
{
    public string Id { get; set; } = null!;

    public string MemberId { get; set; } = null!;

    public string? TrainerName { get; set; }
    public DateTime SessionDate { get; set; }
    public string SessionTime { get; set; } = null!;

    public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

    public string? Note { get; set; }

    public bool IsAttendanceCheckIn { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
