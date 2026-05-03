using System.Security.Claims;
using GymManagement.Application.Interfaces;

namespace GymManagement.API.Middleware;

public class ActivityLogMiddleware
{
    private readonly RequestDelegate _next;

    public ActivityLogMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IDeveloperPortalService developerPortalService)
    {
        await _next(context);

        if (HttpMethods.IsGet(context.Request.Method))
            return;

        var path = context.Request.Path.Value ?? "";
        if (!path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
            return;

        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");
        var role = context.User.FindFirstValue(ClaimTypes.Role);
        var targetId = context.Request.RouteValues.TryGetValue("id", out var idObj) ? idObj?.ToString() : null;

        var targetType = path.Contains("/members", StringComparison.OrdinalIgnoreCase)
            ? "Member"
            : path.Contains("/admin", StringComparison.OrdinalIgnoreCase)
                ? "AdminArea"
                : null;

        var actionType = $"{context.Request.Method} {path}";
        await developerPortalService.LogActivityAsync(
            userId,
            role,
            actionType,
            targetType,
            targetId,
            null,
            path,
            context.Request.Method,
            context.Response.StatusCode);
    }
}
