using GymManagement.Application.DTOs.Progress;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class ProgressService : IProgressService
{
    private readonly AppDbContext _db;

    public ProgressService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProgressEntryDto>> GetByMemberIdAsync(string memberId)
    {
        var entries = await _db.ProgressEntries.AsNoTracking()
            .Where(e => e.MemberId == memberId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return entries.Select(MapToDto).ToList();
    }

    public async Task<ProgressEntryDto> CreateAsync(string memberId, CreateProgressEntryRequest request, string? recordedByUserId = null, string? recordedByName = null)
    {
        var entry = new ProgressEntry
        {
            Id = EntityId.New(),
            MemberId = memberId,
            Weight = request.Weight,
            HeightCm = request.HeightCm,
            BodyFat = request.BodyFat,
            MuscleMass = request.MuscleMass,
            RightArmCm = request.RightArmCm,
            LeftArmCm = request.LeftArmCm,
            ShoulderCm = request.ShoulderCm,
            ChestCm = request.ChestCm,
            WaistCm = request.WaistCm,
            HipCm = request.HipCm,
            Note = request.Note,
            RecordedByUserId = recordedByUserId,
            RecordedByName = recordedByName
        };

        _db.ProgressEntries.Add(entry);
        await _db.SaveChangesAsync();

        return MapToDto(entry);
    }

    private static ProgressEntryDto MapToDto(ProgressEntry e) => new()
    {
        Id = e.Id,
        MemberId = e.MemberId,
        Weight = e.Weight,
        HeightCm = e.HeightCm,
        BodyFat = e.BodyFat,
        MuscleMass = e.MuscleMass,
        RightArmCm = e.RightArmCm,
        LeftArmCm = e.LeftArmCm,
        ShoulderCm = e.ShoulderCm,
        ChestCm = e.ChestCm,
        WaistCm = e.WaistCm,
        HipCm = e.HipCm,
        Note = e.Note,
        RecordedByUserId = e.RecordedByUserId,
        RecordedByName = e.RecordedByName,
        CreatedAt = e.CreatedAt
    };
}
