using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Product;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] bool? activeOnly,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _productService.GetAllAsync(category, activeOnly, page, pageSize);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(result));
    }

    [HttpGet("sales")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductSaleDto>>>> GetSales(
        [FromQuery] string? memberId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _productService.GetSalesAsync(memberId, page, pageSize);
        return Ok(ApiResponse<PagedResult<ProductSaleDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(string id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product == null) return NotFound(ApiResponse<ProductDto>.Fail("Product not found."));
        return Ok(ApiResponse<ProductDto>.Ok(product));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create([FromBody] CreateProductRequest request)
    {
        var product = await _productService.CreateAsync(request);
        return Created($"/api/products/{product.Id}", ApiResponse<ProductDto>.Ok(product));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(string id, [FromBody] UpdateProductRequest request)
    {
        var product = await _productService.UpdateAsync(id, request);
        return Ok(ApiResponse<ProductDto>.Ok(product));
    }

    [HttpPost("sales")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ProductSaleDto>>> CreateSale([FromBody] CreateProductSaleRequest request)
    {
        var sale = await _productService.CreateSaleAsync(request);
        return Created($"/api/products/sales/{sale.Id}", ApiResponse<ProductSaleDto>.Ok(sale));
    }

    [HttpPut("sales/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ProductSaleDto>>> UpdateSale(string id, [FromBody] UpdateProductSaleRequest request)
    {
        var sale = await _productService.UpdateSaleAsync(id, request);
        return Ok(ApiResponse<ProductSaleDto>.Ok(sale));
    }

    [HttpDelete("sales/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteSale(string id)
    {
        await _productService.DeleteSaleAsync(id);
        return Ok(ApiResponse.Ok("Sale deleted."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> Delete(string id)
    {
        await _productService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Product deleted."));
    }
}
