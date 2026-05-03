using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Product;
using GymManagement.Application.Interfaces;
using GymManagement.Domain.Entities;
using GymManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ProductDto>> GetAllAsync(string? category, bool? activeOnly, int page, int pageSize)
    {
        var query = _db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
        {
            var pattern = $"%{category}%";
            query = query.Where(p => p.Category != null && EF.Functions.ILike(p.Category, pattern));
        }

        if (activeOnly == true)
            query = query.Where(p => p.IsActive);

        var total = await query.CountAsync();
        var products = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = products.Select(MapToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDto?> GetByIdAsync(string id)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return product == null ? null : MapToDto(product);
    }

    public async Task<PagedResult<ProductSaleDto>> GetSalesAsync(string? memberId, int page, int pageSize)
    {
        var query = _db.ProductSales.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(memberId))
            query = query.Where(x => x.MemberId == memberId);

        var total = await query.CountAsync();
        var sales = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var productIds = sales.Select(x => x.ProductId).Distinct().ToList();
        var memberIds = sales.Select(x => x.MemberId).Distinct().ToList();

        var products = productIds.Count > 0
            ? await _db.Products.AsNoTracking().Where(x => productIds.Contains(x.Id)).ToListAsync()
            : [];
        var members = memberIds.Count > 0
            ? await _db.Users.AsNoTracking().Where(x => memberIds.Contains(x.Id)).ToListAsync()
            : [];

        var items = sales.Select(x =>
        {
            var product = products.FirstOrDefault(p => p.Id == x.ProductId);
            var member = members.FirstOrDefault(m => m.Id == x.MemberId);
            return new ProductSaleDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = product?.Name ?? "Unknown",
                MemberId = x.MemberId,
                MemberName = member != null ? $"{member.FirstName} {member.LastName}" : "Unknown",
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                TotalAmount = x.UnitPrice * x.Quantity,
                PaidAmount = x.PaidAmount,
                PaymentMethod = string.IsNullOrWhiteSpace(x.PaymentMethod) ? "Cash" : x.PaymentMethod,
                IsPaid = x.IsPaid,
                PaidAt = x.PaidAt,
                Note = x.Note,
                CreatedAt = x.CreatedAt
            };
        }).ToList();

        return new PagedResult<ProductSaleDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request)
    {
        var product = new Product
        {
            Id = EntityId.New(),
            Name = request.Name,
            Category = request.Category,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            IsActive = request.IsActive
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return MapToDto(product);
    }

    public async Task<ProductSaleDto> CreateSaleAsync(CreateProductSaleRequest request)
    {
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == request.ProductId)
            ?? throw new KeyNotFoundException("Product not found.");

        var member = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.MemberId)
            ?? throw new KeyNotFoundException("Member not found.");

        if (request.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        if (request.UnitPrice <= 0)
            throw new ArgumentException("Unit price must be greater than zero.");

        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
            throw new ArgumentException("Payment method is required.");

        var totalAmount = request.Quantity * request.UnitPrice;
        var paidAmount = request.IsPaid ? (request.PaidAmount ?? totalAmount) : 0m;
        if (paidAmount < 0 || paidAmount > totalAmount)
            throw new ArgumentException("Paid amount must be between zero and total amount.");

        if (request.IsPaid && product.StockQuantity < request.Quantity)
            throw new ArgumentException("Insufficient stock quantity.");

        var sale = new ProductSale
        {
            Id = EntityId.New(),
            ProductId = request.ProductId,
            MemberId = request.MemberId,
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            PaidAmount = paidAmount,
            PaymentMethod = request.PaymentMethod.Trim(),
            IsPaid = request.IsPaid,
            PaidAt = request.IsPaid ? DateTime.UtcNow : null,
            Note = request.Note
        };

        if (request.IsPaid)
        {
            product.StockQuantity -= request.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        _db.ProductSales.Add(sale);
        await _db.SaveChangesAsync();

        return new ProductSaleDto
        {
            Id = sale.Id,
            ProductId = sale.ProductId,
            ProductName = product.Name,
            MemberId = sale.MemberId,
            MemberName = $"{member.FirstName} {member.LastName}",
            Quantity = sale.Quantity,
            UnitPrice = sale.UnitPrice,
            TotalAmount = sale.Quantity * sale.UnitPrice,
            PaidAmount = sale.PaidAmount,
            PaymentMethod = sale.PaymentMethod,
            IsPaid = sale.IsPaid,
            PaidAt = sale.PaidAt,
            Note = sale.Note,
            CreatedAt = sale.CreatedAt
        };
    }

    public async Task<ProductSaleDto> UpdateSaleAsync(string id, UpdateProductSaleRequest request)
    {
        var sale = await _db.ProductSales.FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException("Sale not found.");

        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == request.ProductId)
            ?? throw new KeyNotFoundException("Product not found.");

        var member = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.MemberId)
            ?? throw new KeyNotFoundException("Member not found.");

        if (request.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        if (request.UnitPrice <= 0)
            throw new ArgumentException("Unit price must be greater than zero.");

        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
            throw new ArgumentException("Payment method is required.");

        var totalAmount = request.Quantity * request.UnitPrice;
        var paidAmount = request.IsPaid ? (request.PaidAmount ?? totalAmount) : 0m;
        if (paidAmount < 0 || paidAmount > totalAmount)
            throw new ArgumentException("Paid amount must be between zero and total amount.");

        var previousProduct = await _db.Products.FirstOrDefaultAsync(x => x.Id == sale.ProductId)
            ?? throw new KeyNotFoundException("Previous product not found.");

        // Revert old stock effect first.
        if (sale.IsPaid)
        {
            previousProduct.StockQuantity += sale.Quantity;
            previousProduct.UpdatedAt = DateTime.UtcNow;
        }

        // Apply new stock effect.
        if (request.IsPaid)
        {
            if (product.StockQuantity < request.Quantity)
                throw new ArgumentException("Insufficient stock quantity.");

            product.StockQuantity -= request.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        sale.MemberId = request.MemberId;
        sale.ProductId = request.ProductId;
        sale.Quantity = request.Quantity;
        sale.UnitPrice = request.UnitPrice;
        sale.PaymentMethod = request.PaymentMethod.Trim();
        sale.IsPaid = request.IsPaid;
        sale.PaidAmount = paidAmount;
        sale.PaidAt = request.IsPaid ? (sale.PaidAt ?? DateTime.UtcNow) : null;
        sale.Note = request.Note;

        await _db.SaveChangesAsync();

        return new ProductSaleDto
        {
            Id = sale.Id,
            ProductId = sale.ProductId,
            ProductName = product.Name,
            MemberId = sale.MemberId,
            MemberName = $"{member.FirstName} {member.LastName}",
            Quantity = sale.Quantity,
            UnitPrice = sale.UnitPrice,
            TotalAmount = sale.Quantity * sale.UnitPrice,
            PaidAmount = sale.PaidAmount,
            PaymentMethod = sale.PaymentMethod,
            IsPaid = sale.IsPaid,
            PaidAt = sale.PaidAt,
            Note = sale.Note,
            CreatedAt = sale.CreatedAt
        };
    }

    public async Task DeleteSaleAsync(string id)
    {
        var sale = await _db.ProductSales.FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException("Sale not found.");

        if (sale.IsPaid)
        {
            var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == sale.ProductId)
                ?? throw new KeyNotFoundException("Product not found.");

            product.StockQuantity += sale.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        _db.ProductSales.Remove(sale);
        await _db.SaveChangesAsync();
    }

    public async Task<ProductDto> UpdateAsync(string id, UpdateProductRequest request)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Product not found.");

        product.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Name))
            product.Name = request.Name;
        if (request.Category != null)
            product.Category = request.Category;
        if (request.Price.HasValue)
            product.Price = request.Price.Value;
        if (request.StockQuantity.HasValue)
            product.StockQuantity = request.StockQuantity.Value;
        if (request.IsActive.HasValue)
            product.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(string id)
    {
        var n = await _db.Products.Where(p => p.Id == id).ExecuteDeleteAsync();
        if (n == 0)
            throw new KeyNotFoundException("Product not found.");
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Category = p.Category,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
