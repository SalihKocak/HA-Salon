using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Product;

namespace GymManagement.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(string? category, bool? activeOnly, int page, int pageSize);
    Task<PagedResult<ProductSaleDto>> GetSalesAsync(string? memberId, int page, int pageSize);
    Task<ProductDto?> GetByIdAsync(string id);
    Task<ProductDto> CreateAsync(CreateProductRequest request);
    Task<ProductSaleDto> CreateSaleAsync(CreateProductSaleRequest request);
    Task<ProductSaleDto> UpdateSaleAsync(string id, UpdateProductSaleRequest request);
    Task DeleteSaleAsync(string id);
    Task<ProductDto> UpdateAsync(string id, UpdateProductRequest request);
    Task DeleteAsync(string id);
}
