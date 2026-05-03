using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GymManagement.Infrastructure.Services;

/// <summary>
/// Development/demo: 15 approved members with known logins (idempotent by email).
/// Enable with <c>MemberSeed:Enabled</c> (true in appsettings.Development.json).
/// </summary>
public class MemberDemoSeeder : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MemberDemoSeeder> _logger;

    private static readonly (string FirstName, string LastName, int Index)[] Members =
    [
        ("Ahmet", "Yılmaz", 1),
        ("Ayşe", "Kaya", 2),
        ("Mehmet", "Demir", 3),
        ("Zeynep", "Çelik", 4),
        ("Ali", "Şahin", 5),
        ("Elif", "Yıldız", 6),
        ("Burak", "Aydın", 7),
        ("Selin", "Öztürk", 8),
        ("Emre", "Koç", 9),
        ("Merve", "Arslan", 10),
        ("Can", "Doğan", 11),
        ("Deniz", "Polat", 12),
        ("Kerem", "Güneş", 13),
        ("Büşra", "Kurt", 14),
        ("Oğuz", "Tekin", 15),
    ];

    public MemberDemoSeeder(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<MemberDemoSeeder> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_configuration.GetValue("MemberSeed:Enabled", false))
            return;

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var password = _configuration["MemberSeed:Password"];
        var emailDomain = _configuration["MemberSeed:EmailDomain"] ?? "gym-seed.local";
        if (string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("MemberSeed is enabled but MemberSeed:Password is not configured. Demo member seeding skipped.");
            return;
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        var created = 0;
        foreach (var (firstName, lastName, index) in Members)
        {
            var email = $"uye{index:D2}@{emailDomain}";
            var exists = await db.Users.AnyAsync(u => u.Email == email, cancellationToken);
            if (exists)
                continue;

            var user = new User
            {
                Id = EntityId.New(),
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                PhoneNumber = $"530{index:D7}",
                PasswordHash = passwordHash,
                Role = UserRole.Member,
                Status = MemberStatus.Approved,
                IsActive = true
            };

            db.Users.Add(user);

            db.MemberProfiles.Add(new MemberProfile
            {
                Id = EntityId.New(),
                UserId = user.Id,
                Gender = index % 2 == 0 ? "Male" : "Female",
                BirthDate = new DateTime(1990 + (index % 10), 3, 10 + index, 0, 0, 0, DateTimeKind.Utc),
                Height = 165 + index,
                Weight = 62 + (index % 12),
                TargetWeight = 68,
                Goal = "General Health"
            });

            await db.SaveChangesAsync(cancellationToken);
            created++;
            _logger.LogInformation("Demo member seeded: {Email} ({First} {Last})", email, firstName, lastName);
        }

        if (created > 0)
            _logger.LogInformation(
                "Member demo seed finished: {Created} new users (password from MemberSeed:Password, e.g. uye01@{Domain}).",
                created,
                emailDomain);
        else
            _logger.LogInformation("Member demo seed skipped: all demo emails already exist at @{Domain}.", emailDomain);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
