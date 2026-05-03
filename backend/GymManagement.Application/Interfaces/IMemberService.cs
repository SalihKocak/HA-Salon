using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Admin;
using GymManagement.Application.DTOs.Member;

namespace GymManagement.Application.Interfaces;

public interface IMemberService
{
    Task<PagedResult<MemberDetailDto>> GetMembersAsync(string? search, string? status, int page, int pageSize);
    Task<List<MemberDetailDto>> GetPendingMembersAsync();
    Task<MemberDetailDto?> GetMemberByIdAsync(string id);
    Task<MemberDetailDto?> GetMemberByUserIdAsync(string userId);
    Task<MemberDetailDto> CreateMemberByAdminAsync(AdminCreateMemberRequest request);
    Task ApproveMemberAsync(string id);
    Task RejectMemberAsync(string id);
    Task SuspendMemberAsync(string id);
    Task ActivateMemberAsync(string id);
    Task DeleteMemberAsync(string id);
    Task UpdateMemberProfileAsync(string userId, UpdateProfileRequest request);
    Task UpdateAccountSettingsAsync(string userId, UpdateAccountSettingsRequest request);
    Task UpdateMemberMeasurementsAsync(string memberId, AdminUpdateMemberMeasurementsRequest request);
    Task AssignPackageAsync(string memberId, AssignPackageRequest request);
    Task AssignSessionPlanAsync(string memberId, AdminAssignSessionPlanRequest request);
    Task ResetMemberPasswordAsync(string memberId, AdminResetMemberPasswordRequest request);
}
