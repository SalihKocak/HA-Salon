using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Package;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/packages")]
public class PackagesController : ControllerBase
{
    private readonly IPackageService _packageService;

    public PackagesController(IPackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PackageDto>>>> GetAll([FromQuery] bool activeOnly = false)
    {
        var packages = await _packageService.GetAllAsync(activeOnly);
        return Ok(ApiResponse<List<PackageDto>>.Ok(packages));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PackageDto>>> GetById(string id)
    {
        var package = await _packageService.GetByIdAsync(id);
        if (package == null) return NotFound(ApiResponse<PackageDto>.Fail("Package not found."));
        return Ok(ApiResponse<PackageDto>.Ok(package));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PackageDto>>> Create([FromBody] CreatePackageRequest request)
    {
        var package = await _packageService.CreateAsync(request);
        return Created($"/api/packages/{package.Id}", ApiResponse<PackageDto>.Ok(package));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PackageDto>>> Update(string id, [FromBody] UpdatePackageRequest request)
    {
        var package = await _packageService.UpdateAsync(id, request);
        return Ok(ApiResponse<PackageDto>.Ok(package));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> Delete(string id)
    {
        await _packageService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Package deleted."));
    }
}
