using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace GymManagement.Infrastructure.Services;

public class AdminSeeder : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminSeeder> _logger;

    public AdminSeeder(IServiceScopeFactory scopeFactory, IConfiguration configuration, ILogger<AdminSeeder> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var adminEmail = _configuration["AdminSeed:Email"] ?? "admin@gym.local";
        var adminPassword = _configuration["AdminSeed:Password"];
        var adminFirstName = _configuration["AdminSeed:FirstName"] ?? "Gym";
        var adminLastName = _configuration["AdminSeed:LastName"] ?? "Admin";
        var developerEmail = _configuration["DeveloperSeed:Email"] ?? "developer@gym.local";
        var developerPassword = _configuration["DeveloperSeed:Password"];
        var developerFirstName = _configuration["DeveloperSeed:FirstName"] ?? "Gym";
        var developerLastName = _configuration["DeveloperSeed:LastName"] ?? "Developer";

        var exists = await db.Users.AnyAsync(
            u => u.Email == adminEmail && u.Role == UserRole.Admin,
            cancellationToken);

        if (!exists)
        {
            adminPassword ??= GenerateStrongPassword();
            db.Users.Add(new User
            {
                Id = EntityId.New(),
                FirstName = adminFirstName,
                LastName = adminLastName,
                Email = adminEmail,
                PhoneNumber = "0000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = UserRole.Admin,
                Status = MemberStatus.Approved,
                IsActive = true
            });

            await db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Default admin user created: {Email}", adminEmail);
            if (string.IsNullOrWhiteSpace(_configuration["AdminSeed:Password"]))
                _logger.LogWarning("Admin seed password was not configured. One-time generated password: {Password}", adminPassword);
        }

        var developerExists = await db.Users.AnyAsync(
            u => u.Email == developerEmail && u.Role == UserRole.Developer,
            cancellationToken);

        if (!developerExists)
        {
            developerPassword ??= GenerateStrongPassword();
            db.Users.Add(new User
            {
                Id = EntityId.New(),
                FirstName = developerFirstName,
                LastName = developerLastName,
                Email = developerEmail,
                PhoneNumber = "0000000001",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(developerPassword),
                Role = UserRole.Developer,
                Status = MemberStatus.Approved,
                IsActive = true
            });

            await db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Default developer user created: {Email}", developerEmail);
            if (string.IsNullOrWhiteSpace(_configuration["DeveloperSeed:Password"]))
                _logger.LogWarning("Developer seed password was not configured. One-time generated password: {Password}", developerPassword);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static string GenerateStrongPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
        var bytes = new byte[18];
        RandomNumberGenerator.Fill(bytes);
        return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
    }
}
