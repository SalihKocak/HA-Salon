using GymManagement.Domain.Entities;

namespace GymManagement.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string? ValidateTokenAndGetUserId(string token);
}
