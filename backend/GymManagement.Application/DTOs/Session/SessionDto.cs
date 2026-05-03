using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.Session;

public class SessionScheduleDto
{
    public string Id { get; set; } = null!;
    public string MemberId { get; set; } = null!;
    public string MemberName { get; set; } = null!;
    public string? TrainerName { get; set; }
    public DateTime SessionDate { get; set; }
    public string SessionTime { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Note { get; set; }
    public bool IsAttendanceCheckIn { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DailyAttendanceMemberDto
{
    public string MemberId { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public bool Attended { get; set; }
    public string? AttendanceSessionId { get; set; }
    public string? PlannedTime { get; set; }
    public string? ArrivalTime { get; set; }
}

public class DailyAttendanceBoardDto
{
    public string Date { get; set; } = null!;
    public List<DailyAttendanceMemberDto> Members { get; set; } = new();
}

public class AttendanceSlotRangeDto
{
    public string Label { get; set; } = null!;
    public string Start { get; set; } = null!;
    public string End { get; set; } = null!;
}

public class AttendanceSlotSettingsDto
{
    public int StartHour { get; set; }
    public int EndHour { get; set; }
    public int IntervalMinutes { get; set; }
    public List<AttendanceSlotRangeDto> Ranges { get; set; } = new();
}

public class UpdateAttendanceSlotSettingsRequest
{
    [Range(0, 23)]
    public int StartHour { get; set; }

    [Range(1, 24)]
    public int EndHour { get; set; }

    [Range(15, 240)]
    public int IntervalMinutes { get; set; }
}

public class AttendanceHistoryItemDto
{
    public string SessionId { get; set; } = null!;
    public string MemberId { get; set; } = null!;
    public string MemberName { get; set; } = null!;
    /// <summary>Calendar day yyyy-MM-dd (UTC date of stored session).</summary>
    public string CalendarDate { get; set; } = null!;
    public string ArrivalTime { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class MarkAttendanceRequest
{
    [Required]
    [MaxLength(64)]
    public string MemberId { get; set; } = null!;

    /// <summary>Calendar date yyyy-MM-dd (client local day). Named CalendarDate to avoid JSON/model binding issues with "date".</summary>
    [Required]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "CalendarDate must be in yyyy-MM-dd format.")]
    public string CalendarDate { get; set; } = null!;

    /// <summary>Arrival time HH:mm (client local clock).</summary>
    [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "SessionTime must be in HH:mm format.")]
    public string? SessionTime { get; set; }
}

public class CreateSessionRequest
{
    [Required]
    [MaxLength(64)]
    public string MemberId { get; set; } = null!;

    [MaxLength(120)]
    public string? TrainerName { get; set; }

    [Required]
    public DateTime SessionDate { get; set; }

    [Required]
    [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "SessionTime must be in HH:mm format.")]
    public string SessionTime { get; set; } = null!;

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdateSessionRequest
{
    [MaxLength(120)]
    public string? TrainerName { get; set; }
    public DateTime? SessionDate { get; set; }

    [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "SessionTime must be in HH:mm format.")]
    public string? SessionTime { get; set; }

    [RegularExpression("^(Scheduled|Completed|Cancelled|NoShow)$",
        ErrorMessage = "Status must be one of: Scheduled, Completed, Cancelled, NoShow.")]
    public string? Status { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
