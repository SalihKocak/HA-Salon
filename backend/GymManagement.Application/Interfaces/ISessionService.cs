using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Session;

namespace GymManagement.Application.Interfaces;

public interface ISessionService
{
    Task<PagedResult<SessionScheduleDto>> GetAllAsync(string? memberId, string? status, int page, int pageSize);
    Task<List<SessionScheduleDto>> GetByMemberIdAsync(string memberId);
    Task<SessionScheduleDto?> GetByIdAsync(string id);
    Task<SessionScheduleDto> CreateAsync(CreateSessionRequest request);
    Task<SessionScheduleDto> UpdateAsync(string id, UpdateSessionRequest request);
    Task DeleteAsync(string id);
    Task<DailyAttendanceBoardDto> GetDailyAttendanceAsync(string dateYyyyMmDd);
    Task<SessionScheduleDto> MarkAttendanceAsync(MarkAttendanceRequest request);
    Task<AttendanceSlotSettingsDto> GetAttendanceSlotSettingsAsync();
    Task<AttendanceSlotSettingsDto> UpdateAttendanceSlotSettingsAsync(UpdateAttendanceSlotSettingsRequest request);
    Task<PagedResult<AttendanceHistoryItemDto>> GetAttendanceHistoryAsync(
        string? dateFromYyyyMmDd,
        string? dateToYyyyMmDd,
        string? nameSearch,
        int page,
        int pageSize);
}
