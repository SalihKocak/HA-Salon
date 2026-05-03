using GymManagement.Application.DTOs.Auth;

namespace GymManagement.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterMemberAsync(RegisterMemberRequest request, string? ipAddress = null);
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress = null);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, string? ipAddress = null);
    Task LogoutAsync(string userId, string refreshToken);
    Task<UserDto?> GetCurrentUserAsync(string userId);
}
