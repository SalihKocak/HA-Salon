using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Member;
using GymManagement.Application.DTOs.Progress;
using GymManagement.Application.DTOs.Session;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/member")]
[Authorize(Policy = "ApprovedMember")]
public class MemberController : ControllerBase
{
    private readonly IMemberService _memberService;
    private readonly IProgressService _progressService;
    private readonly ISessionService _sessionService;

    public MemberController(IMemberService memberService, IProgressService progressService, ISessionService sessionService)
    {
        _memberService = memberService;
        _progressService = progressService;
        _sessionService = sessionService;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<MemberDetailDto>>> GetProfile()
    {
        var userId = GetCurrentUserId();
        var member = await _memberService.GetMemberByUserIdAsync(userId);
        if (member == null) return NotFound(ApiResponse<MemberDetailDto>.Fail("Profile not found."));
        return Ok(ApiResponse<MemberDetailDto>.Ok(member));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        await _memberService.UpdateMemberProfileAsync(userId, request);
        return Ok(ApiResponse.Ok("Profile updated."));
    }

    [HttpPut("account-settings")]
    public async Task<ActionResult<ApiResponse>> UpdateAccountSettings([FromBody] UpdateAccountSettingsRequest request)
    {
        var userId = GetCurrentUserId();
        await _memberService.UpdateAccountSettingsAsync(userId, request);
        return Ok(ApiResponse.Ok("Account settings updated."));
    }

    [HttpGet("progress")]
    public async Task<ActionResult<ApiResponse<List<ProgressEntryDto>>>> GetProgress()
    {
        var userId = GetCurrentUserId();
        var entries = await _progressService.GetByMemberIdAsync(userId);
        return Ok(ApiResponse<List<ProgressEntryDto>>.Ok(entries));
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<ApiResponse<List<SessionScheduleDto>>>> GetSessions()
    {
        var userId = GetCurrentUserId();
        var sessions = await _sessionService.GetByMemberIdAsync(userId);
        return Ok(ApiResponse<List<SessionScheduleDto>>.Ok(sessions));
    }

    private string GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();
}
