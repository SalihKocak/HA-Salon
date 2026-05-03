namespace GymManagement.Domain.Entities;

public class AttendanceSlotSettings
{
    public string Id { get; set; } = null!;

    public int StartHour { get; set; } = 8;
    public int EndHour { get; set; } = 20;
    public int IntervalMinutes { get; set; } = 120;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
