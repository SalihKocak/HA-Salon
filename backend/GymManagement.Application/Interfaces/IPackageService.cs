using GymManagement.Application.DTOs.Package;

namespace GymManagement.Application.Interfaces;

public interface IPackageService
{
    Task<List<PackageDto>> GetAllAsync(bool activeOnly = false);
    Task<PackageDto?> GetByIdAsync(string id);
    Task<PackageDto> CreateAsync(CreatePackageRequest request);
    Task<PackageDto> UpdateAsync(string id, UpdatePackageRequest request);
    Task DeleteAsync(string id);
}
