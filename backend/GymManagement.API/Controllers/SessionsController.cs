using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Session;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize(Roles = "Admin")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet("daily-board")]
    public async Task<ActionResult<ApiResponse<DailyAttendanceBoardDto>>> GetDailyBoard([FromQuery] string? date)
    {
        var d = string.IsNullOrWhiteSpace(date)
            ? DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd")
            : date.Trim();
        var result = await _sessionService.GetDailyAttendanceAsync(d);
        return Ok(ApiResponse<DailyAttendanceBoardDto>.Ok(result));
    }

    [HttpPost("attendance")]
    public async Task<ActionResult<ApiResponse<SessionScheduleDto>>> MarkAttendance([FromBody] MarkAttendanceRequest request)
    {
        var session = await _sessionService.MarkAttendanceAsync(request);
        return Ok(ApiResponse<SessionScheduleDto>.Ok(session));
    }

    [HttpGet("attendance-slots")]
    public async Task<ActionResult<ApiResponse<AttendanceSlotSettingsDto>>> GetAttendanceSlots()
    {
        var result = await _sessionService.GetAttendanceSlotSettingsAsync();
        return Ok(ApiResponse<AttendanceSlotSettingsDto>.Ok(result));
    }

    [HttpPut("attendance-slots")]
    public async Task<ActionResult<ApiResponse<AttendanceSlotSettingsDto>>> UpdateAttendanceSlots([FromBody] UpdateAttendanceSlotSettingsRequest request)
    {
        var result = await _sessionService.UpdateAttendanceSlotSettingsAsync(request);
        return Ok(ApiResponse<AttendanceSlotSettingsDto>.Ok(result));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<SessionScheduleDto>>>> GetAll(
        [FromQuery] string? memberId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sessionService.GetAllAsync(memberId, status, page, pageSize);
        return Ok(ApiResponse<PagedResult<SessionScheduleDto>>.Ok(result));
    }

    [HttpGet("attendance-history")]
    public async Task<ActionResult<ApiResponse<PagedResult<AttendanceHistoryItemDto>>>> GetAttendanceHistory(
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sessionService.GetAttendanceHistoryAsync(dateFrom, dateTo, search, page, pageSize);
        return Ok(ApiResponse<PagedResult<AttendanceHistoryItemDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<SessionScheduleDto>>> GetById(string id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null) return NotFound(ApiResponse<SessionScheduleDto>.Fail("Session not found."));
        return Ok(ApiResponse<SessionScheduleDto>.Ok(session));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SessionScheduleDto>>> Create([FromBody] CreateSessionRequest request)
    {
        var session = await _sessionService.CreateAsync(request);
        return Created($"/api/sessions/{session.Id}", ApiResponse<SessionScheduleDto>.Ok(session));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<SessionScheduleDto>>> Update(string id, [FromBody] UpdateSessionRequest request)
    {
        var session = await _sessionService.UpdateAsync(id, request);
        return Ok(ApiResponse<SessionScheduleDto>.Ok(session));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(string id)
    {
        await _sessionService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Session deleted."));
    }
}
