using GymManagement.Application.DTOs.Progress;

namespace GymManagement.Application.Interfaces;

public interface IProgressService
{
    Task<List<ProgressEntryDto>> GetByMemberIdAsync(string memberId);
    Task<ProgressEntryDto> CreateAsync(string memberId, CreateProgressEntryRequest request, string? recordedByUserId = null, string? recordedByName = null);
}
