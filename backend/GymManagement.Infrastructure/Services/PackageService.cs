using GymManagement.Application.DTOs.Package;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class PackageService : IPackageService
{
    private readonly AppDbContext _db;

    public PackageService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<PackageDto>> GetAllAsync(bool activeOnly = false)
    {
        var query = _db.MembershipPackages.AsNoTracking();
        if (activeOnly)
            query = query.Where(p => p.IsActive);

        var packages = await query.OrderBy(p => p.DurationInDays).ToListAsync();
        return packages.Select(MapToDto).ToList();
    }

    public async Task<PackageDto?> GetByIdAsync(string id)
    {
        var package = await _db.MembershipPackages.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return package == null ? null : MapToDto(package);
    }

    public async Task<PackageDto> CreateAsync(CreatePackageRequest request)
    {
        var package = new MembershipPackage
        {
            Id = EntityId.New(),
            Name = request.Name,
            Description = request.Description,
            DurationInDays = request.DurationInDays,
            Price = request.Price,
            IsActive = request.IsActive
        };

        _db.MembershipPackages.Add(package);
        await _db.SaveChangesAsync();

        return MapToDto(package);
    }

    public async Task<PackageDto> UpdateAsync(string id, UpdatePackageRequest request)
    {
        var package = await _db.MembershipPackages.FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Package not found.");

        package.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Name))
            package.Name = request.Name;
        if (request.Description != null)
            package.Description = request.Description;
        if (request.DurationInDays.HasValue)
            package.DurationInDays = request.DurationInDays.Value;
        if (request.Price.HasValue)
            package.Price = request.Price.Value;
        if (request.IsActive.HasValue)
            package.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();

        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(string id)
    {
        var hasActiveMembers = await _db.MemberProfiles.AsNoTracking()
            .AnyAsync(p => p.ActivePackageId == id);
        if (hasActiveMembers)
            throw new InvalidOperationException("Package is assigned to active members and cannot be deleted.");

        var hasPaymentHistory = await _db.Payments.AsNoTracking()
            .AnyAsync(p => p.PackageId == id);
        if (hasPaymentHistory)
            throw new InvalidOperationException("Package has payment history and cannot be deleted.");

        var n = await _db.MembershipPackages.Where(p => p.Id == id).ExecuteDeleteAsync();
        if (n == 0)
            throw new KeyNotFoundException("Package not found.");
    }

    private static PackageDto MapToDto(MembershipPackage p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        DurationInDays = p.DurationInDays,
        Price = p.Price,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
