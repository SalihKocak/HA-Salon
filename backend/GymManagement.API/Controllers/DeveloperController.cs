using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Developer;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/developer")]
[Authorize(Roles = "Developer")]
public class DeveloperController : ControllerBase
{
    private readonly IDeveloperPortalService _developerPortalService;

    public DeveloperController(IDeveloperPortalService developerPortalService)
    {
        _developerPortalService = developerPortalService;
    }

    [HttpGet("activity-logs")]
    public async Task<ActionResult<ApiResponse<List<ActivityLogDto>>>> GetActivityLogs(
        [FromQuery] int take = 200,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? actorRole = null,
        [FromQuery] string? actionQuery = null)
    {
        var data = await _developerPortalService.GetActivityLogsAsync(take, from, to, actorRole, actionQuery);
        return Ok(ApiResponse<List<ActivityLogDto>>.Ok(data));
    }

    [HttpGet("error-logs")]
    public async Task<ActionResult<ApiResponse<List<ErrorLogDto>>>> GetErrorLogs(
        [FromQuery] int take = 200,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? userRole = null,
        [FromQuery] string? query = null)
    {
        var data = await _developerPortalService.GetErrorLogsAsync(take, from, to, userRole, query);
        return Ok(ApiResponse<List<ErrorLogDto>>.Ok(data));
    }

    [HttpGet("member-activity")]
    public async Task<ActionResult<ApiResponse<List<ActivityLogDto>>>> GetMemberActivity(
        [FromQuery] string? memberId,
        [FromQuery] int take = 200,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? query = null)
    {
        var data = await _developerPortalService.GetMemberActivityAsync(memberId, take, from, to, query);
        return Ok(ApiResponse<List<ActivityLogDto>>.Ok(data));
    }
}
