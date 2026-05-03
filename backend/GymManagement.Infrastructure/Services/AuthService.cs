using GymManagement.Application.DTOs.Auth;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using GymManagement.Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace GymManagement.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwtService;
    private readonly JwtSettings _jwtSettings;

    public AuthService(AppDbContext db, IJwtService jwtService, IOptions<JwtSettings> jwtSettings)
    {
        _db = db;
        _jwtService = jwtService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponse> RegisterMemberAsync(RegisterMemberRequest request, string? ipAddress = null)
    {
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        if (normalizedEmail != null)
        {
            var existingEmail = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail);
            if (existingEmail != null)
                throw new InvalidOperationException("A user with this email already exists.");
        }

        var normalizedPhone = request.PhoneNumber.Trim();
        var existingPhone = await _db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.PhoneNumber == normalizedPhone);
        if (existingPhone != null)
            throw new InvalidOperationException("A user with this phone number already exists.");

        var userId = EntityId.New();
        var user = new User
        {
            Id = userId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = normalizedEmail,
            PhoneNumber = normalizedPhone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Member,
            Status = MemberStatus.Pending,
            IsActive = true
        };

        _db.Users.Add(user);

        var profile = new MemberProfile
        {
            Id = EntityId.New(),
            UserId = user.Id,
            Gender = request.Gender,
            BirthDate = request.BirthDate.HasValue
                ? DateTime.SpecifyKind(request.BirthDate.Value, DateTimeKind.Utc)
                : null,
            Height = request.Height,
            Weight = request.Weight,
            TargetWeight = request.TargetWeight,
            Goal = request.Goal
        };

        _db.MemberProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return await CreateAuthResponseAsync(user, ipAddress);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress = null)
    {
        var identifier = request.Identifier.Trim();
        var normalized = identifier.ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.PhoneNumber == identifier || (u.Email != null && u.Email.ToLower() == normalized));
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is inactive.");

        if (user.Status == MemberStatus.Suspended)
            throw new UnauthorizedAccessException("ACCOUNT_SUSPENDED");

        return await CreateAuthResponseAsync(user, ipAddress);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, string? ipAddress = null)
    {
        var tokenHash = HashToken(refreshToken);
        var session = await _db.RefreshTokenSessions.FirstOrDefaultAsync(s => s.RefreshToken == tokenHash);

        if (session == null || !session.IsActive)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == session.UserId);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("User not found or inactive.");

        if (user.Status == MemberStatus.Suspended)
            throw new UnauthorizedAccessException("ACCOUNT_SUSPENDED");

        session.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await CreateAuthResponseAsync(user, ipAddress);
    }

    public async Task LogoutAsync(string userId, string refreshToken)
    {
        var tokenHash = HashToken(refreshToken);
        await _db.RefreshTokenSessions
            .Where(s => s.UserId == userId &&
                s.RefreshToken == tokenHash &&
                s.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTime.UtcNow));
    }

    public async Task<UserDto?> GetCurrentUserAsync(string userId)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return null;

        return MapUserToDto(user);
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(User user, string? ipAddress)
    {
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        var session = new RefreshTokenSession
        {
            Id = EntityId.New(),
            UserId = user.Id,
            RefreshToken = HashToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
            IpAddress = ipAddress
        };

        _db.RefreshTokenSessions.Add(session);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes),
            User = MapUserToDto(user)
        };
    }

    private static UserDto MapUserToDto(User user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role.ToString(),
        Status = user.Status.ToString()
    };

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
