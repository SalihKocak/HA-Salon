using GymManagement.Application.DTOs.Developer;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class DeveloperPortalService : IDeveloperPortalService
{
    private readonly AppDbContext _db;

    public DeveloperPortalService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogActivityAsync(
        string? actorUserId,
        string? actorRole,
        string actionType,
        string? targetType,
        string? targetId,
        string? detail,
        string? requestPath,
        string? httpMethod,
        int? statusCode)
    {
        _db.ActivityLogs.Add(new ActivityLog
        {
            Id = EntityId.New(),
            ActorUserId = actorUserId,
            ActorRole = actorRole,
            ActionType = actionType,
            TargetType = targetType,
            TargetId = targetId,
            Detail = detail,
            RequestPath = requestPath,
            HttpMethod = httpMethod,
            StatusCode = statusCode,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    public async Task LogErrorAsync(
        string? userId,
        string? userRole,
        string message,
        string? exceptionType,
        string? stackTrace,
        string? requestPath,
        string? httpMethod,
        int? statusCode)
    {
        _db.ErrorLogs.Add(new ErrorLog
        {
            Id = EntityId.New(),
            UserId = userId,
            UserRole = userRole,
            Message = message,
            ExceptionType = exceptionType,
            StackTrace = stackTrace,
            RequestPath = requestPath,
            HttpMethod = httpMethod,
            StatusCode = statusCode,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    public async Task<List<ActivityLogDto>> GetActivityLogsAsync(
        int take = 200,
        DateTime? from = null,
        DateTime? to = null,
        string? actorRole = null,
        string? actionQuery = null)
    {
        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (from.HasValue) query = query.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) query = query.Where(x => x.CreatedAt <= to.Value);
        if (!string.IsNullOrWhiteSpace(actorRole)) query = query.Where(x => x.ActorRole == actorRole);
        if (!string.IsNullOrWhiteSpace(actionQuery))
        {
            var q = actionQuery.Trim();
            query = query.Where(x =>
                (x.ActionType != null && EF.Functions.ILike(x.ActionType, $"%{q}%")) ||
                (x.RequestPath != null && EF.Functions.ILike(x.RequestPath, $"%{q}%")));
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(Math.Clamp(take, 1, 1000))
            .Select(x => new ActivityLogDto
            {
                Id = x.Id,
                ActorUserId = x.ActorUserId,
                ActorRole = x.ActorRole,
                ActionType = x.ActionType,
                TargetType = x.TargetType,
                TargetId = x.TargetId,
                Detail = x.Detail,
                RequestPath = x.RequestPath,
                HttpMethod = x.HttpMethod,
                StatusCode = x.StatusCode,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<ErrorLogDto>> GetErrorLogsAsync(
        int take = 200,
        DateTime? from = null,
        DateTime? to = null,
        string? userRole = null,
        string? query = null)
    {
        var rows = _db.ErrorLogs.AsNoTracking().AsQueryable();
        if (from.HasValue) rows = rows.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) rows = rows.Where(x => x.CreatedAt <= to.Value);
        if (!string.IsNullOrWhiteSpace(userRole)) rows = rows.Where(x => x.UserRole == userRole);
        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim();
            rows = rows.Where(x =>
                (x.Message != null && EF.Functions.ILike(x.Message, $"%{q}%")) ||
                (x.ExceptionType != null && EF.Functions.ILike(x.ExceptionType, $"%{q}%")) ||
                (x.RequestPath != null && EF.Functions.ILike(x.RequestPath, $"%{q}%")));
        }

        return await rows
            .OrderByDescending(x => x.CreatedAt)
            .Take(Math.Clamp(take, 1, 1000))
            .Select(x => new ErrorLogDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserRole = x.UserRole,
                Message = x.Message,
                ExceptionType = x.ExceptionType,
                RequestPath = x.RequestPath,
                HttpMethod = x.HttpMethod,
                StatusCode = x.StatusCode,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<ActivityLogDto>> GetMemberActivityAsync(
        string? memberId,
        int take = 200,
        DateTime? from = null,
        DateTime? to = null,
        string? query = null)
    {
        var rows = _db.ActivityLogs.AsNoTracking()
            .Where(x => x.TargetType == "Member" || x.ActorRole == "Member");

        if (!string.IsNullOrWhiteSpace(memberId))
            rows = rows.Where(x => x.TargetId == memberId || x.ActorUserId == memberId);
        if (from.HasValue) rows = rows.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) rows = rows.Where(x => x.CreatedAt <= to.Value);
        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim();
            rows = rows.Where(x =>
                (x.ActionType != null && EF.Functions.ILike(x.ActionType, $"%{q}%")) ||
                (x.Detail != null && EF.Functions.ILike(x.Detail, $"%{q}%")) ||
                (x.RequestPath != null && EF.Functions.ILike(x.RequestPath, $"%{q}%")));
        }

        return await rows
            .OrderByDescending(x => x.CreatedAt)
            .Take(Math.Clamp(take, 1, 1000))
            .Select(x => new ActivityLogDto
            {
                Id = x.Id,
                ActorUserId = x.ActorUserId,
                ActorRole = x.ActorRole,
                ActionType = x.ActionType,
                TargetType = x.TargetType,
                TargetId = x.TargetId,
                Detail = x.Detail,
                RequestPath = x.RequestPath,
                HttpMethod = x.HttpMethod,
                StatusCode = x.StatusCode,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }
}
