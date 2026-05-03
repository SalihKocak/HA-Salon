using System.Globalization;
using System.Text.RegularExpressions;
using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Session;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly AppDbContext _db;
    private const int DefaultStartHour = 8;
    private const int DefaultEndHour = 20;
    private const int DefaultIntervalMinutes = 120;

    public SessionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<SessionScheduleDto>> GetAllAsync(string? memberId, string? status, int page, int pageSize)
    {
        var query = _db.SessionSchedules.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(memberId))
            query = query.Where(s => s.MemberId == memberId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<SessionStatus>(status, true, out var sessionStatus))
            query = query.Where(s => s.Status == sessionStatus);

        var total = await query.CountAsync();
        var sessions = await query
            .OrderByDescending(s => s.SessionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var memberIds = sessions.Select(s => s.MemberId).Distinct().ToList();
        var members = await _db.Users.AsNoTracking().Where(u => memberIds.Contains(u.Id)).ToListAsync();

        var items = sessions.Select(s =>
        {
            var member = members.FirstOrDefault(m => m.Id == s.MemberId);
            return MapToDto(s, member != null ? $"{member.FirstName} {member.LastName}" : "Unknown");
        }).ToList();

        return new PagedResult<SessionScheduleDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<SessionScheduleDto>> GetByMemberIdAsync(string memberId)
    {
        var sessions = await _db.SessionSchedules.AsNoTracking()
            .Where(s => s.MemberId == memberId)
            .OrderByDescending(s => s.SessionDate)
            .ToListAsync();

        var member = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == memberId);
        var memberName = member != null ? $"{member.FirstName} {member.LastName}" : "Unknown";

        return sessions.Select(s => MapToDto(s, memberName)).ToList();
    }

    public async Task<SessionScheduleDto?> GetByIdAsync(string id)
    {
        var session = await _db.SessionSchedules.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (session == null) return null;

        var member = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == session.MemberId);
        return MapToDto(session, member != null ? $"{member.FirstName} {member.LastName}" : "Unknown");
    }

    public async Task<SessionScheduleDto> CreateAsync(CreateSessionRequest request)
    {
        var session = new SessionSchedule
        {
            Id = EntityId.New(),
            MemberId = request.MemberId,
            TrainerName = request.TrainerName,
            SessionDate = request.SessionDate,
            SessionTime = request.SessionTime,
            Status = SessionStatus.Scheduled,
            Note = request.Note,
            IsAttendanceCheckIn = false
        };

        _db.SessionSchedules.Add(session);
        await _db.SaveChangesAsync();

        return (await GetByIdAsync(session.Id))!;
    }

    public async Task<SessionScheduleDto> UpdateAsync(string id, UpdateSessionRequest request)
    {
        var session = await _db.SessionSchedules.FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException("Session not found.");

        session.UpdatedAt = DateTime.UtcNow;

        if (request.TrainerName != null)
            session.TrainerName = request.TrainerName;
        if (request.SessionDate.HasValue)
            session.SessionDate = request.SessionDate.Value;
        if (!string.IsNullOrWhiteSpace(request.SessionTime))
            session.SessionTime = request.SessionTime;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<SessionStatus>(request.Status, true, out var newStatus))
            session.Status = newStatus;
        if (request.Note != null)
            session.Note = request.Note;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(string id)
    {
        var n = await _db.SessionSchedules.Where(s => s.Id == id).ExecuteDeleteAsync();
        if (n == 0)
            throw new KeyNotFoundException("Session not found.");
    }

    public async Task<DailyAttendanceBoardDto> GetDailyAttendanceAsync(string dateYyyyMmDd)
    {
        if (!DateOnly.TryParse(dateYyyyMmDd, CultureInfo.InvariantCulture, DateTimeStyles.None, out var day))
            throw new ArgumentException("Invalid date. Use yyyy-MM-dd.");

        var (dayStart, dayEnd) = GetUtcDayRange(day);

        var plannedSessions = await _db.SessionSchedules.AsNoTracking()
            .Where(s =>
                s.SessionDate >= dayStart &&
                s.SessionDate < dayEnd &&
                !s.IsAttendanceCheckIn &&
                s.Status == SessionStatus.Scheduled)
            .ToListAsync();

        var attendances = await _db.SessionSchedules.AsNoTracking()
            .Where(s => s.SessionDate >= dayStart && s.SessionDate < dayEnd && s.IsAttendanceCheckIn)
            .ToListAsync();

        var plannedMemberIds = plannedSessions.Select(s => s.MemberId).Distinct().ToList();
        var attendedMemberIds = attendances.Select(s => s.MemberId).Distinct().ToList();
        var boardMemberIds = plannedMemberIds
            .Concat(attendedMemberIds)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        if (boardMemberIds.Count == 0)
        {
            return new DailyAttendanceBoardDto
            {
                Date = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                Members = []
            };
        }

        var members = await _db.Users.AsNoTracking()
            .Where(u =>
                boardMemberIds.Contains(u.Id) &&
                u.Role == UserRole.Member &&
                u.Status == MemberStatus.Approved &&
                u.IsActive)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync();
        var slotSettings = await GetOrCreateAttendanceSettingsAsync();
        var ranges = BuildRanges(slotSettings.StartHour, slotSettings.EndHour, slotSettings.IntervalMinutes);

        var rows = members.Select(m =>
        {
            var att = attendances.FirstOrDefault(a => a.MemberId == m.Id);
            var planned = plannedSessions
                .Where(s => s.MemberId == m.Id)
                .Select(s => ResolvePlannedSlotLabel(s.SessionTime, ranges))
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .OrderBy(x => x, StringComparer.Ordinal)
                .ToList();
            return new DailyAttendanceMemberDto
            {
                MemberId = m.Id,
                FullName = $"{m.FirstName} {m.LastName}",
                Attended = att != null,
                AttendanceSessionId = att?.Id,
                PlannedTime = planned.Count > 0 ? string.Join(", ", planned) : null,
                ArrivalTime = att?.SessionTime
            };
        }).ToList();

        return new DailyAttendanceBoardDto
        {
            Date = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Members = rows
        };
    }

    private static string ResolvePlannedSlotLabel(string? sessionTime, List<(TimeOnly start, TimeOnly end)> ranges)
    {
        var value = sessionTime?.Trim();
        if (string.IsNullOrWhiteSpace(value))
            return "—";
        if (value.Contains('-'))
            return value;
        if (!TimeOnly.TryParseExact(value, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var time))
            return value;

        foreach (var (start, end) in ranges)
        {
            if (time >= start && time < end)
                return $"{start:HH\\:mm}-{end:HH\\:mm}";
        }

        var exactStart = ranges.FirstOrDefault(r => r.start == time);
        if (exactStart != default)
            return $"{exactStart.start:HH\\:mm}-{exactStart.end:HH\\:mm}";

        return value;
    }

    public async Task<SessionScheduleDto> MarkAttendanceAsync(MarkAttendanceRequest request)
    {
        if (!DateOnly.TryParse(request.CalendarDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var day))
            throw new ArgumentException("Invalid date. Use yyyy-MM-dd.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.MemberId)
            ?? throw new KeyNotFoundException("Member not found.");

        if (user.Role != UserRole.Member || user.Status != MemberStatus.Approved || !user.IsActive)
            throw new InvalidOperationException("Only active approved members can be checked in.");

        var (dayStart, dayEnd) = GetUtcDayRange(day);

        var timeStr = string.IsNullOrWhiteSpace(request.SessionTime)
            ? DateTime.UtcNow.ToString("HH:mm", CultureInfo.InvariantCulture)
            : request.SessionTime.Trim();
        var slotLabel = await ResolveSlotLabelAsync(timeStr);

        var existing = await _db.SessionSchedules.FirstOrDefaultAsync(s =>
            s.MemberId == request.MemberId
            && s.SessionDate >= dayStart
            && s.SessionDate < dayEnd
            && s.IsAttendanceCheckIn);

        if (existing != null)
        {
            existing.SessionTime = slotLabel;
            existing.Status = SessionStatus.Completed;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return (await GetByIdAsync(existing.Id))!;
        }

        var plannedForDay = await _db.SessionSchedules
            .Where(s =>
                s.MemberId == request.MemberId
                && s.SessionDate >= dayStart
                && s.SessionDate < dayEnd
                && !s.IsAttendanceCheckIn
                && s.Status == SessionStatus.Scheduled)
            .OrderBy(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (plannedForDay != null)
        {
            plannedForDay.SessionTime = slotLabel;
            plannedForDay.Status = SessionStatus.Completed;
            plannedForDay.IsAttendanceCheckIn = true;
            plannedForDay.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return (await GetByIdAsync(plannedForDay.Id))!;
        }

        var session = new SessionSchedule
        {
            Id = EntityId.New(),
            MemberId = request.MemberId,
            TrainerName = null,
            SessionDate = dayStart,
            SessionTime = slotLabel,
            Status = SessionStatus.Completed,
            Note = null,
            IsAttendanceCheckIn = true
        };

        _db.SessionSchedules.Add(session);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(session.Id))!;
    }

    public async Task<AttendanceSlotSettingsDto> GetAttendanceSlotSettingsAsync()
    {
        var settings = await GetOrCreateAttendanceSettingsAsync();
        return MapSlotSettings(settings);
    }

    public async Task<AttendanceSlotSettingsDto> UpdateAttendanceSlotSettingsAsync(UpdateAttendanceSlotSettingsRequest request)
    {
        if (request.EndHour <= request.StartHour)
            throw new ArgumentException("EndHour must be greater than StartHour.");

        var settings = await GetOrCreateAttendanceSettingsAsync();
        settings.StartHour = request.StartHour;
        settings.EndHour = request.EndHour;
        settings.IntervalMinutes = request.IntervalMinutes;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapSlotSettings(settings);
    }

    public async Task<PagedResult<AttendanceHistoryItemDto>> GetAttendanceHistoryAsync(
        string? dateFromYyyyMmDd,
        string? dateToYyyyMmDd,
        string? nameSearch,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly fromDay;
        DateOnly toDay;

        var hasFrom = DateOnly.TryParse(dateFromYyyyMmDd ?? "", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedFrom);
        var hasTo = DateOnly.TryParse(dateToYyyyMmDd ?? "", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedTo);

        if (!hasFrom && !hasTo)
        {
            toDay = today;
            fromDay = toDay.AddDays(-30);
        }
        else if (hasFrom && !hasTo)
        {
            fromDay = parsedFrom;
            toDay = parsedFrom;
        }
        else if (!hasFrom && hasTo)
        {
            toDay = parsedTo;
            fromDay = parsedTo;
        }
        else
        {
            fromDay = parsedFrom;
            toDay = parsedTo;
        }

        if (fromDay > toDay)
            (fromDay, toDay) = (toDay, fromDay);

        var (rangeStart, _) = GetUtcDayRange(fromDay);
        var (_, rangeEndExclusive) = GetUtcDayRange(toDay);

        var query = _db.SessionSchedules.AsNoTracking()
            .Where(s => s.IsAttendanceCheckIn
                        && s.SessionDate >= rangeStart
                        && s.SessionDate < rangeEndExclusive);

        var search = nameSearch?.Trim();
        if (!string.IsNullOrEmpty(search))
        {
            var escaped = Regex.Escape(search);
            var pattern = $"%{escaped}%";
            var matchingIds = await _db.Users.AsNoTracking()
                .Where(u => u.Role == UserRole.Member
                    && (EF.Functions.ILike(u.FirstName, pattern)
                        || EF.Functions.ILike(u.LastName, pattern)
                        || EF.Functions.ILike(u.Email, pattern)))
                .Select(u => u.Id)
                .ToListAsync();

            if (matchingIds.Count == 0)
            {
                return new PagedResult<AttendanceHistoryItemDto>
                {
                    Items = [],
                    TotalCount = 0,
                    Page = page,
                    PageSize = pageSize
                };
            }

            query = query.Where(s => matchingIds.Contains(s.MemberId));
        }

        var total = await query.CountAsync();
        var sessions = await query
            .OrderByDescending(s => s.SessionDate)
            .ThenByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var memberIds = sessions.Select(s => s.MemberId).Distinct().ToList();
        var members = await _db.Users.AsNoTracking().Where(u => memberIds.Contains(u.Id)).ToListAsync();

        var items = sessions.Select(s =>
        {
            var u = members.FirstOrDefault(m => m.Id == s.MemberId);
            var name = u != null ? $"{u.FirstName} {u.LastName}" : "Unknown";
            var calDay = DateOnly.FromDateTime(DateTime.SpecifyKind(s.SessionDate, DateTimeKind.Utc));
            return new AttendanceHistoryItemDto
            {
                SessionId = s.Id,
                MemberId = s.MemberId,
                MemberName = name,
                CalendarDate = calDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                ArrivalTime = s.SessionTime,
                CreatedAt = s.CreatedAt
            };
        }).ToList();

        return new PagedResult<AttendanceHistoryItemDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    private static (DateTime start, DateTime end) GetUtcDayRange(DateOnly day)
    {
        var start = DateTime.SpecifyKind(day.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        return (start, start.AddDays(1));
    }

    private async Task<string> ResolveSlotLabelAsync(string hhmm)
    {
        if (!TimeOnly.TryParseExact(hhmm, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var time))
            return hhmm;

        var settings = await GetOrCreateAttendanceSettingsAsync();
        var ranges = BuildRanges(settings.StartHour, settings.EndHour, settings.IntervalMinutes);
        if (ranges.Count == 0)
            return hhmm;

        foreach (var (start, end) in ranges)
        {
            if (time >= start && time < end)
                return $"{start:HH\\:mm}-{end:HH\\:mm}";
        }

        // Boundary fallback: if exactly equal to end, assign last slot.
        var last = ranges[^1];
        if (time == last.end)
            return $"{last.start:HH\\:mm}-{last.end:HH\\:mm}";

        return hhmm;
    }

    private async Task<AttendanceSlotSettings> GetOrCreateAttendanceSettingsAsync()
    {
        var settings = await _db.AttendanceSlotSettings.FirstOrDefaultAsync();
        if (settings != null) return settings;

        settings = new AttendanceSlotSettings
        {
            Id = EntityId.New(),
            StartHour = DefaultStartHour,
            EndHour = DefaultEndHour,
            IntervalMinutes = DefaultIntervalMinutes,
            UpdatedAt = DateTime.UtcNow
        };
        _db.AttendanceSlotSettings.Add(settings);
        await _db.SaveChangesAsync();
        return settings;
    }

    private static AttendanceSlotSettingsDto MapSlotSettings(AttendanceSlotSettings settings)
    {
        var ranges = BuildRanges(settings.StartHour, settings.EndHour, settings.IntervalMinutes)
            .Select(x => new AttendanceSlotRangeDto
            {
                Label = $"{x.start:HH\\:mm}-{x.end:HH\\:mm}",
                Start = $"{x.start:HH\\:mm}",
                End = $"{x.end:HH\\:mm}",
            })
            .ToList();

        return new AttendanceSlotSettingsDto
        {
            StartHour = settings.StartHour,
            EndHour = settings.EndHour,
            IntervalMinutes = settings.IntervalMinutes,
            Ranges = ranges
        };
    }

    private static List<(TimeOnly start, TimeOnly end)> BuildRanges(int startHour, int endHour, int intervalMinutes)
    {
        var ranges = new List<(TimeOnly start, TimeOnly end)>();
        var cursor = new TimeOnly(startHour, 0);
        var endLimit = new TimeOnly(endHour % 24, 0);

        // This feature is intended for same-day hour windows (e.g. 08-20).
        if (endHour <= startHour) return ranges;

        while (cursor < endLimit)
        {
            var end = cursor.AddMinutes(intervalMinutes);
            if (end > endLimit) end = endLimit;
            ranges.Add((cursor, end));
            if (end == endLimit) break;
            cursor = end;
        }
        return ranges;
    }

    private static SessionScheduleDto MapToDto(SessionSchedule s, string memberName) => new()
    {
        Id = s.Id,
        MemberId = s.MemberId,
        MemberName = memberName,
        TrainerName = s.TrainerName,
        SessionDate = s.SessionDate,
        SessionTime = s.SessionTime,
        Status = s.Status.ToString(),
        Note = s.Note,
        IsAttendanceCheckIn = s.IsAttendanceCheckIn,
        CreatedAt = s.CreatedAt
    };
}
