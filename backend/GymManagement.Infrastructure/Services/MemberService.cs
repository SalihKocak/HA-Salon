using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Admin;
using GymManagement.Application.DTOs.Member;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace GymManagement.Infrastructure.Services;

public class MemberService : IMemberService
{
    private readonly AppDbContext _db;
    private const int WeekdayStartHour = 6;
    private const int WeekdayEndHour = 21;
    private const int SaturdayStartHour = 6;
    private const int SaturdayEndHour = 14;

    public MemberService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<MemberDetailDto>> GetMembersAsync(string? search, string? status, int page, int pageSize)
    {
        var query = _db.Users.AsNoTracking().Where(u => u.Role == UserRole.Member);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<MemberStatus>(status, true, out var memberStatus))
            query = query.Where(u => u.Status == memberStatus);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            query = query.Where(u =>
                EF.Functions.ILike(u.FirstName, pattern) ||
                EF.Functions.ILike(u.LastName, pattern) ||
                EF.Functions.ILike(u.Email, pattern) ||
                EF.Functions.ILike(u.PhoneNumber, pattern));
        }

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();
        var profiles = await _db.MemberProfiles.AsNoTracking()
            .Where(p => userIds.Contains(p.UserId))
            .ToListAsync();
        var packageIds = profiles.Where(p => p.ActivePackageId != null).Select(p => p.ActivePackageId!).Distinct().ToList();
        var packages = packageIds.Count > 0
            ? await _db.MembershipPackages.AsNoTracking().Where(p => packageIds.Contains(p.Id)).ToListAsync()
            : [];

        var items = users.Select(u =>
        {
            var profile = profiles.FirstOrDefault(p => p.UserId == u.Id);
            var package = profile?.ActivePackageId != null ? packages.FirstOrDefault(p => p.Id == profile.ActivePackageId) : null;
            return MapToDetailDto(u, profile, package?.Name);
        }).ToList();

        return new PagedResult<MemberDetailDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<MemberDetailDto>> GetPendingMembersAsync()
    {
        var users = await _db.Users.AsNoTracking()
            .Where(u => u.Role == UserRole.Member && u.Status == MemberStatus.Pending)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return users.Select(u => MapToDetailDto(u, null, null)).ToList();
    }

    public async Task<MemberDetailDto?> GetMemberByIdAsync(string id)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return null;

        var profile = await _db.MemberProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == id);
        string? packageName = null;
        if (profile?.ActivePackageId != null)
        {
            var package = await _db.MembershipPackages.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == profile.ActivePackageId);
            packageName = package?.Name;
        }

        return MapToDetailDto(user, profile, packageName);
    }

    public async Task<MemberDetailDto?> GetMemberByUserIdAsync(string userId)
        => await GetMemberByIdAsync(userId);

    public async Task<MemberDetailDto> CreateMemberByAdminAsync(AdminCreateMemberRequest request)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var normalizedPhone = request.PhoneNumber.Trim();
        var phoneTaken = await _db.Users.AsNoTracking().AnyAsync(u => u.PhoneNumber == normalizedPhone);
        if (phoneTaken)
            throw new InvalidOperationException("A user with this phone number already exists.");

        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        if (normalizedEmail != null)
        {
            var emailTaken = await _db.Users.AsNoTracking()
                .AnyAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail);
            if (emailTaken)
                throw new InvalidOperationException("A user with this email already exists.");
        }

        var user = new User
        {
            Id = EntityId.New(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            PhoneNumber = normalizedPhone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(ResolveInitialPassword(request)),
            Role = UserRole.Member,
            Status = MemberStatus.Approved,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var profile = new MemberProfile
        {
            Id = EntityId.New(),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        _db.MemberProfiles.Add(profile);

        DateTime? sessionPlanEnd = null;
        string? activePackageName = null;

        if (!string.IsNullOrWhiteSpace(request.PackageId))
        {
            var package = await _db.MembershipPackages
                .FirstOrDefaultAsync(p => p.Id == request.PackageId && p.IsActive)
                ?? throw new KeyNotFoundException("Package not found or inactive.");

            var packageStart = NormalizeToUtcDate(request.PackageStartDate ?? DateTime.UtcNow);
            var packageEnd = packageStart.AddDays(package.DurationInDays);

            profile.ActivePackageId = package.Id;
            profile.MembershipStartDate = packageStart;
            profile.MembershipEndDate = packageEnd;
            profile.UpdatedAt = DateTime.UtcNow;

            _db.Payments.Add(new Payment
            {
                Id = EntityId.New(),
                MemberId = user.Id,
                PackageId = package.Id,
                Amount = package.Price,
                PaymentMethod = "Cash",
                DueDate = packageStart,
                Status = PaymentStatus.Pending,
                Note = $"{user.FirstName} {user.LastName} — {package.Name}"
            });

            sessionPlanEnd = packageEnd;
            activePackageName = package.Name;
        }

        var weeklySessions = request.WeeklySessions ?? [];
        if (weeklySessions.Count > 0)
        {
            var planStart = DateTime.UtcNow;
            var planEnd = sessionPlanEnd ?? planStart.AddDays(30);
            var slotSettings = await _db.AttendanceSlotSettings.AsNoTracking().FirstOrDefaultAsync();
            var intervalMinutes = slotSettings?.IntervalMinutes ?? 120;

            foreach (var plan in weeklySessions)
            {
                var sessionDates = BuildSessionDates(planStart, planEnd, plan.DayOfWeek);
                foreach (var date in sessionDates)
                {
                    _db.SessionSchedules.Add(new SessionSchedule
                    {
                        Id = EntityId.New(),
                        MemberId = user.Id,
                        SessionDate = date,
                        SessionTime = ResolvePlannedSessionLabel(plan.SessionTime, plan.DayOfWeek, intervalMinutes),
                        Status = SessionStatus.Scheduled,
                        IsAttendanceCheckIn = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return MapToDetailDto(user, profile, activePackageName);
    }

    public async Task ApproveMemberAsync(string id)
    {
        await _db.Users
            .Where(u => u.Id == id && u.Role == UserRole.Member)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Status, MemberStatus.Approved)
                .SetProperty(u => u.UpdatedAt, DateTime.UtcNow));
    }

    public async Task RejectMemberAsync(string id)
    {
        await _db.Users
            .Where(u => u.Id == id && u.Role == UserRole.Member)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Status, MemberStatus.Rejected)
                .SetProperty(u => u.UpdatedAt, DateTime.UtcNow));
    }

    public async Task SuspendMemberAsync(string id)
    {
        var n = await _db.Users
            .Where(u => u.Id == id && u.Role == UserRole.Member)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Status, MemberStatus.Suspended)
                .SetProperty(u => u.UpdatedAt, DateTime.UtcNow));
        if (n == 0)
            throw new KeyNotFoundException("Member not found.");

        await _db.RefreshTokenSessions
            .Where(s => s.UserId == id && s.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTime.UtcNow));
    }

    public async Task ActivateMemberAsync(string id)
    {
        var n = await _db.Users
            .Where(u => u.Id == id && u.Role == UserRole.Member)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Status, MemberStatus.Approved)
                .SetProperty(u => u.UpdatedAt, DateTime.UtcNow));
        if (n == 0)
            throw new KeyNotFoundException("Member not found.");
    }

    public async Task DeleteMemberAsync(string id)
    {
        var exists = await _db.Users.AnyAsync(u => u.Id == id && u.Role == UserRole.Member);
        if (!exists)
            throw new KeyNotFoundException("Member not found.");

        await _db.RefreshTokenSessions.Where(s => s.UserId == id).ExecuteDeleteAsync();
        await _db.SessionSchedules.Where(s => s.MemberId == id).ExecuteDeleteAsync();
        await _db.ProgressEntries.Where(e => e.MemberId == id).ExecuteDeleteAsync();
        await _db.Payments.Where(p => p.MemberId == id).ExecuteDeleteAsync();
        await _db.MemberProfiles.Where(p => p.UserId == id).ExecuteDeleteAsync();
        await _db.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
    }

    public async Task UpdateMemberMeasurementsAsync(string memberId, AdminUpdateMemberMeasurementsRequest request)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == memberId && u.Role == UserRole.Member);
        if (!userExists)
            throw new KeyNotFoundException("Member not found.");

        var profile = await _db.MemberProfiles.FirstOrDefaultAsync(p => p.UserId == memberId);
        if (profile == null)
        {
            profile = new MemberProfile
            {
                Id = EntityId.New(),
                UserId = memberId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.MemberProfiles.Add(profile);
        }

        profile.MeasurementBodyFat = request.MeasurementBodyFat;
        profile.MeasurementMuscleMass = request.MeasurementMuscleMass;
        profile.MeasurementChestCm = request.MeasurementChestCm;
        profile.MeasurementWaistCm = request.MeasurementWaistCm;
        profile.MeasurementHipCm = request.MeasurementHipCm;
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task UpdateMemberProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;

        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;
        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            user.PhoneNumber = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        var profile = await _db.MemberProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
        {
            profile = new MemberProfile
            {
                Id = EntityId.New(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.MemberProfiles.Add(profile);
        }

        if (request.Gender != null)
            profile.Gender = request.Gender;
        if (request.BirthDate.HasValue)
            profile.BirthDate = request.BirthDate;
        if (request.Height.HasValue)
            profile.Height = request.Height;
        if (request.Weight.HasValue)
            profile.Weight = request.Weight;
        if (request.TargetWeight.HasValue)
            profile.TargetWeight = request.TargetWeight;
        if (request.Goal != null)
            profile.Goal = request.Goal;
        if (request.Notes != null)
            profile.Notes = request.Notes;
        if (request.RecommendedDailyCalories.HasValue)
            profile.RecommendedDailyCalories = request.RecommendedDailyCalories;
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task UpdateAccountSettingsAsync(string userId, UpdateAccountSettingsRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Role == UserRole.Member)
            ?? throw new KeyNotFoundException("Member not found.");

        var normalizedPhone = request.PhoneNumber.Trim();
        var phoneTaken = await _db.Users.AsNoTracking()
            .AnyAsync(u => u.Id != userId && u.PhoneNumber == normalizedPhone);
        if (phoneTaken)
            throw new InvalidOperationException("This phone number is already in use.");

        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email)
            ? null
            : request.Email.Trim().ToLowerInvariant();

        if (normalizedEmail != null)
        {
            var emailTaken = await _db.Users.AsNoTracking()
                .AnyAsync(u => u.Id != userId && u.Email != null && u.Email.ToLower() == normalizedEmail);
            if (emailTaken)
                throw new InvalidOperationException("This email is already in use.");
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Current password is incorrect.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            await _db.RefreshTokenSessions
                .Where(s => s.UserId == userId && s.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTime.UtcNow));
        }

        user.PhoneNumber = normalizedPhone;
        user.Email = normalizedEmail;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task AssignPackageAsync(string memberId, AssignPackageRequest request)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var member = await _db.Users.FirstOrDefaultAsync(u => u.Id == memberId && u.Role == UserRole.Member)
            ?? throw new KeyNotFoundException("Member not found.");

        var package = await _db.MembershipPackages.FirstOrDefaultAsync(p => p.Id == request.PackageId && p.IsActive)
            ?? throw new KeyNotFoundException("Package not found or inactive.");

        var endDate = request.StartDate.AddDays(package.DurationInDays);

        var profile = await _db.MemberProfiles.FirstOrDefaultAsync(p => p.UserId == memberId);
        if (profile == null)
        {
            profile = new MemberProfile
            {
                Id = EntityId.New(),
                UserId = memberId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.MemberProfiles.Add(profile);
        }

        profile.ActivePackageId = package.Id;
        profile.MembershipStartDate = request.StartDate;
        profile.MembershipEndDate = endDate;
        profile.UpdatedAt = DateTime.UtcNow;

        var due = request.StartDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc)
            : request.StartDate.ToUniversalTime();

        _db.Payments.Add(new Payment
        {
            Id = EntityId.New(),
            MemberId = memberId,
            PackageId = package.Id,
            Amount = package.Price,
            PaymentMethod = "Cash",
            DueDate = due,
            Status = PaymentStatus.Pending,
            Note = $"{member.FirstName} {member.LastName} — {package.Name}"
        });

        await _db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    public async Task AssignSessionPlanAsync(string memberId, AdminAssignSessionPlanRequest request)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var member = await _db.Users.FirstOrDefaultAsync(u => u.Id == memberId && u.Role == UserRole.Member)
            ?? throw new KeyNotFoundException("Member not found.");

        var weeklySessions = request.WeeklySessions ?? [];
        var startDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        var profile = await _db.MemberProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == memberId);
        var endDate = profile?.MembershipEndDate.HasValue == true
            ? DateTime.SpecifyKind(profile.MembershipEndDate.Value.Date, DateTimeKind.Utc)
            : startDate.AddDays(30);

        await _db.SessionSchedules
            .Where(s =>
                s.MemberId == memberId
                && !s.IsAttendanceCheckIn
                && s.Status == SessionStatus.Scheduled
                && s.SessionDate >= startDate)
            .ExecuteDeleteAsync();

        if (weeklySessions.Count > 0)
        {
            var slotSettings = await _db.AttendanceSlotSettings.AsNoTracking().FirstOrDefaultAsync();
            var intervalMinutes = slotSettings?.IntervalMinutes ?? 120;

            foreach (var plan in weeklySessions)
            {
                var sessionDates = BuildSessionDates(startDate, endDate, plan.DayOfWeek);
                foreach (var date in sessionDates)
                {
                    _db.SessionSchedules.Add(new SessionSchedule
                    {
                        Id = EntityId.New(),
                        MemberId = member.Id,
                        SessionDate = date,
                        SessionTime = ResolvePlannedSessionLabel(plan.SessionTime, plan.DayOfWeek, intervalMinutes),
                        Status = SessionStatus.Scheduled,
                        IsAttendanceCheckIn = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    public async Task ResetMemberPasswordAsync(string memberId, AdminResetMemberPasswordRequest request)
    {
        var member = await _db.Users.FirstOrDefaultAsync(u => u.Id == memberId && u.Role == UserRole.Member)
            ?? throw new KeyNotFoundException("Member not found.");

        member.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        member.UpdatedAt = DateTime.UtcNow;

        await _db.RefreshTokenSessions
            .Where(s => s.UserId == memberId && s.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTime.UtcNow));

        await _db.SaveChangesAsync();
    }

    private static string ResolveInitialPassword(AdminCreateMemberRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Password))
            return request.Password.Trim();

        // Admin yeni kayıtta parola girmiyorsa, ilk giriş için telefon numarasını güçlü bir biçimde temel alır.
        var digits = new string(request.PhoneNumber.Where(char.IsDigit).ToArray());
        var tail = digits.Length >= 6 ? digits[^6..] : digits.PadLeft(6, '0');
        return $"Gym{tail}aA!";
    }

    private static DateTime NormalizeToUtcDate(DateTime value)
    {
        var utc = value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
            : value.ToUniversalTime();
        return DateTime.SpecifyKind(utc.Date, DateTimeKind.Utc);
    }

    private static IEnumerable<DateTime> BuildSessionDates(DateTime fromInclusiveUtc, DateTime toExclusiveUtc, int targetDayOfWeek)
    {
        var start = DateTime.SpecifyKind(fromInclusiveUtc.Date, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(toExclusiveUtc.Date, DateTimeKind.Utc);
        while (start < end)
        {
            if ((int)start.DayOfWeek == targetDayOfWeek)
                yield return start;
            start = start.AddDays(1);
        }
    }

    private static string ResolvePlannedSessionLabel(string? sessionTime, int dayOfWeek, int intervalMinutes)
    {
        var value = sessionTime?.Trim();
        if (string.IsNullOrWhiteSpace(value))
            return "—";
        if (value.Contains('-'))
            return value;
        if (!TimeOnly.TryParseExact(value, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var time))
            return value;

        var ranges = BuildRangesForPlanning(dayOfWeek, intervalMinutes);

        foreach (var (start, end) in ranges)
        {
            if (time >= start && time < end)
                return $"{start:HH\\:mm}-{end:HH\\:mm}";
        }

        var exact = ranges.FirstOrDefault(x => x.start == time);
        if (exact != default)
            return $"{exact.start:HH\\:mm}-{exact.end:HH\\:mm}";

        return value;
    }

    private static List<(TimeOnly start, TimeOnly end)> BuildRangesForPlanning(int dayOfWeek, int intervalMinutes)
    {
        if (dayOfWeek == 0) return [];
        if (dayOfWeek == 6)
            return BuildRanges(SaturdayStartHour, SaturdayEndHour, intervalMinutes);
        return BuildRanges(WeekdayStartHour, WeekdayEndHour, intervalMinutes);
    }

    private static List<(TimeOnly start, TimeOnly end)> BuildRanges(int startHour, int endHour, int intervalMinutes)
    {
        var ranges = new List<(TimeOnly start, TimeOnly end)>();
        if (endHour <= startHour || intervalMinutes <= 0) return ranges;

        var cursor = new TimeOnly(startHour, 0);
        var endLimit = new TimeOnly(endHour % 24, 0);
        while (cursor < endLimit)
        {
            var end = cursor.AddMinutes(intervalMinutes);
            if (end > endLimit) end = endLimit;
            ranges.Add((cursor, end));
            if (end == endLimit) break;
            cursor = end;
        }

        return ranges;
    }

    private static MemberDetailDto MapToDetailDto(
        User user,
        MemberProfile? profile,
        string? packageName) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        PhoneNumber = user.PhoneNumber,
        Status = user.Status.ToString(),
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        Gender = profile?.Gender,
        BirthDate = profile?.BirthDate,
        Height = profile?.Height,
        Weight = profile?.Weight,
        TargetWeight = profile?.TargetWeight,
        Goal = profile?.Goal,
        Notes = profile?.Notes,
        RecommendedDailyCalories = profile?.RecommendedDailyCalories,
        MeasurementBodyFat = profile?.MeasurementBodyFat,
        MeasurementMuscleMass = profile?.MeasurementMuscleMass,
        MeasurementChestCm = profile?.MeasurementChestCm,
        MeasurementWaistCm = profile?.MeasurementWaistCm,
        MeasurementHipCm = profile?.MeasurementHipCm,
        ActivePackageId = profile?.ActivePackageId,
        ActivePackageName = packageName,
        MembershipStartDate = profile?.MembershipStartDate,
        MembershipEndDate = profile?.MembershipEndDate
    };
}
