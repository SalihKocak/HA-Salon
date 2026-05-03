using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Progress;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet("me")]
    [Authorize(Policy = "ApprovedMember")]
    public async Task<ActionResult<ApiResponse<List<ProgressEntryDto>>>> GetMyProgress()
    {
        var userId = GetCurrentUserId();
        var entries = await _progressService.GetByMemberIdAsync(userId);
        return Ok(ApiResponse<List<ProgressEntryDto>>.Ok(entries));
    }

    [HttpGet("member/{memberId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<List<ProgressEntryDto>>>> GetMemberProgress(string memberId)
    {
        var entries = await _progressService.GetByMemberIdAsync(memberId);
        return Ok(ApiResponse<List<ProgressEntryDto>>.Ok(entries));
    }

    private string GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();
}
