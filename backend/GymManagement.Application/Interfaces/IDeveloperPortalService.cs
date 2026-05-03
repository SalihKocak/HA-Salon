using GymManagement.Application.DTOs.Developer;

namespace GymManagement.Application.Interfaces;

public interface IDeveloperPortalService
{
    Task LogActivityAsync(
        string? actorUserId,
        string? actorRole,
        string actionType,
        string? targetType,
        string? targetId,
        string? detail,
        string? requestPath,
        string? httpMethod,
        int? statusCode);

    Task LogErrorAsync(
        string? userId,
        string? userRole,
        string message,
        string? exceptionType,
        string? stackTrace,
        string? requestPath,
        string? httpMethod,
        int? statusCode);

    Task<List<ActivityLogDto>> GetActivityLogsAsync(
        int take = 200,
        DateTime? from = null,
        DateTime? to = null,
        string? actorRole = null,
        string? actionQuery = null);

    Task<List<ErrorLogDto>> GetErrorLogsAsync(
        int take = 200,
        DateTime? from = null,
        DateTime? to = null,
        string? userRole = null,
        string? query = null);

    Task<List<ActivityLogDto>> GetMemberActivityAsync(
        string? memberId,
        int take = 200,
        DateTime? from = null,
        DateTime? to = null,
        string? query = null);
}
