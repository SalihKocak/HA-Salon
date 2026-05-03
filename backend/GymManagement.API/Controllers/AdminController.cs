using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Admin;
using GymManagement.Application.DTOs.Member;
using GymManagement.Application.DTOs.Progress;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IMemberService _memberService;
    private readonly IProgressService _progressService;

    public AdminController(IDashboardService dashboardService, IMemberService memberService, IProgressService progressService)
    {
        _dashboardService = dashboardService;
        _memberService = memberService;
        _progressService = progressService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboard()
    {
        var stats = await _dashboardService.GetStatsAsync();
        return Ok(ApiResponse<DashboardStatsDto>.Ok(stats));
    }

    [HttpGet("members")]
    public async Task<ActionResult<ApiResponse<PagedResult<MemberDetailDto>>>> GetMembers(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _memberService.GetMembersAsync(search, status, page, pageSize);
        return Ok(ApiResponse<PagedResult<MemberDetailDto>>.Ok(result));
    }

    [HttpGet("members/pending")]
    public async Task<ActionResult<ApiResponse<List<MemberDetailDto>>>> GetPendingMembers()
    {
        var result = await _memberService.GetPendingMembersAsync();
        return Ok(ApiResponse<List<MemberDetailDto>>.Ok(result));
    }

    [HttpGet("members/{id}")]
    public async Task<ActionResult<ApiResponse<MemberDetailDto>>> GetMember(string id)
    {
        var member = await _memberService.GetMemberByIdAsync(id);
        if (member == null) return NotFound(ApiResponse<MemberDetailDto>.Fail("Member not found."));
        return Ok(ApiResponse<MemberDetailDto>.Ok(member));
    }

    [HttpPost("members")]
    public async Task<ActionResult<ApiResponse<MemberDetailDto>>> CreateMember([FromBody] AdminCreateMemberRequest request)
    {
        var created = await _memberService.CreateMemberByAdminAsync(request);
        return Ok(ApiResponse<MemberDetailDto>.Ok(created, "Member created."));
    }

    [HttpPut("members/{id}/approve")]
    public async Task<ActionResult<ApiResponse>> ApproveMember(string id)
    {
        await _memberService.ApproveMemberAsync(id);
        return Ok(ApiResponse.Ok("Member approved."));
    }

    [HttpPut("members/{id}/reject")]
    public async Task<ActionResult<ApiResponse>> RejectMember(string id)
    {
        await _memberService.RejectMemberAsync(id);
        return Ok(ApiResponse.Ok("Member rejected."));
    }

    [HttpPost("members/{id}/assign-package")]
    public async Task<ActionResult<ApiResponse>> AssignPackage(string id, [FromBody] AssignPackageRequest request)
    {
        await _memberService.AssignPackageAsync(id, request);
        return Ok(ApiResponse.Ok("Package assigned."));
    }

    [HttpPost("members/{id}/session-plan")]
    public async Task<ActionResult<ApiResponse>> AssignSessionPlan(string id, [FromBody] AdminAssignSessionPlanRequest request)
    {
        await _memberService.AssignSessionPlanAsync(id, request);
        return Ok(ApiResponse.Ok("Session plan assigned."));
    }

    [HttpPut("members/{id}/suspend")]
    public async Task<ActionResult<ApiResponse>> SuspendMember(string id)
    {
        await _memberService.SuspendMemberAsync(id);
        return Ok(ApiResponse.Ok("Member suspended."));
    }

    [HttpPut("members/{id}/activate")]
    public async Task<ActionResult<ApiResponse>> ActivateMember(string id)
    {
        await _memberService.ActivateMemberAsync(id);
        return Ok(ApiResponse.Ok("Member activated."));
    }

    [HttpDelete("members/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteMember(string id)
    {
        await _memberService.DeleteMemberAsync(id);
        return Ok(ApiResponse.Ok("Member deleted."));
    }

    [HttpPut("members/{id}/measurements")]
    public async Task<ActionResult<ApiResponse>> UpdateMeasurements(string id, [FromBody] AdminUpdateMemberMeasurementsRequest request)
    {
        await _memberService.UpdateMemberMeasurementsAsync(id, request);
        return Ok(ApiResponse.Ok("Measurements updated."));
    }

    [HttpPost("members/{id}/progress")]
    public async Task<ActionResult<ApiResponse<ProgressEntryDto>>> AddMemberProgress(string id, [FromBody] CreateProgressEntryRequest request)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        var adminName = "HA Salon";

        var entry = await _progressService.CreateAsync(id, request, adminId, adminName);
        return Ok(ApiResponse<ProgressEntryDto>.Ok(entry));
    }

    [HttpPut("members/{id}/password")]
    public async Task<ActionResult<ApiResponse>> ResetMemberPassword(string id, [FromBody] AdminResetMemberPasswordRequest request)
    {
        await _memberService.ResetMemberPasswordAsync(id, request);
        return Ok(ApiResponse.Ok("Member password updated."));
    }
}
