using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(IEnumerable<Product> products, int totalItems)> GetProductsAsync(
            int page, 
            int pageSize, 
            string? search, 
            int? categoryId, 
            decimal? minPrice, 
            decimal? maxPrice, 
            string? sortBy)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Where(p => p.IsActive);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(p => 
                        p.Name.ToLower().Contains(search.ToLower()) ||
                        p.Description.ToLower().Contains(search.ToLower()) ||
                        p.Brand.ToLower().Contains(search.ToLower()));
                }

                if (categoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                if (minPrice.HasValue)
                {
                    query = query.Where(p => p.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    query = query.Where(p => p.Price <= maxPrice.Value);
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "price" => query.OrderBy(p => p.Price),
                    "price_desc" => query.OrderByDescending(p => p.Price),
                    "newest" => query.OrderByDescending(p => p.CreatedAt),
                    "popular" => query.OrderByDescending(p => p.ViewCount),
                    _ => query.OrderBy(p => p.Name)
                };

                var totalItems = await query.CountAsync();

                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (products, totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products");
                throw;
            }
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by id: {ProductId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 8)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Images)
                    .Where(p => p.IsActive && p.IsFeatured)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured products");
                throw;
            }
        }

        public async Task<IEnumerable<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return new List<string>();
            }

            try
            {
                return await _context.Products
                    .Where(p => p.IsActive && p.Name.ToLower().Contains(query.ToLower()))
                    .Select(p => p.Name)
                    .Distinct()
                    .Take(10)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
                throw;
            }
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            try
            {
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;
                product.IsActive = true;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product created with ID: {ProductId}", product.Id);
                return product;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                throw;
            }
        }

        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            try
            {
                var existingProduct = await _context.Products.FindAsync(id);
                if (existingProduct == null)
                {
                    return null;
                }

                // Update properties
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.DiscountPrice = product.DiscountPrice;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.SKU = product.SKU;
                existingProduct.Brand = product.Brand;
                existingProduct.CategoryId = product.CategoryId;
                existingProduct.IsFeatured = product.IsFeatured;
                existingProduct.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product updated with ID: {ProductId}", id);
                return existingProduct;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product with ID: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return false;
                }

                // Soft delete
                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product soft deleted with ID: {ProductId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product with ID: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.StockQuantity = quantity;
                product.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stock updated for product ID: {ProductId}, New quantity: {Quantity}", 
                    productId, quantity);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> CheckStockAvailabilityAsync(int productId, int requestedQuantity)
        {
            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive);

                return product != null && product.StockQuantity >= requestedQuantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking stock availability for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive && p.StockQuantity < threshold)
                    .OrderBy(p => p.StockQuantity)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting low stock products");
                throw;
            }
        }

        public async Task<ProductImage> AddProductImageAsync(int productId, ProductImage image)
        {
            try
            {
                var productExists = await _context.Products
                    .AnyAsync(p => p.Id == productId && p.IsActive);

                if (!productExists)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                image.ProductId = productId;
                image.CreatedAt = DateTime.UtcNow;
                image.UpdatedAt = DateTime.UtcNow;

                _context.ProductImages.Add(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image added for product ID: {ProductId}", productId);
                return image;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding image for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> RemoveProductImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null)
                {
                    return false;
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image removed with ID: {ImageId}", imageId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing image with ID: {ImageId}", imageId);
                throw;
            }
        }

       

        public async Task<bool> IncrementViewCountAsync(int productId)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.ViewCount++;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing view count for product ID: {ProductId}", productId);
                throw;
            }
        }
        // ProductService class'ýna ekleyin

        public async Task<bool> SetMainImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null) return false;

                // Ayný üründeki tüm resimlerin isMainImage'ini false yap
                var productImages = await _context.ProductImages
                    .Where(pi => pi.ProductId == image.ProductId)
                    .ToListAsync();

                foreach (var img in productImages)
                {
                    img.IsMainImage = false;
                }

                // Seçilen resmi ana resim yap
                image.IsMainImage = true;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null) return false;

                // Dosyayý fiziksel olarak sil
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", image.ImageUrl.TrimStart('/'));
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<decimal> CalculateDiscountPriceAsync(int productId, decimal discountPercentage)
        {
            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == productId);

                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                var discountAmount = product.Price * (discountPercentage / 100);
                return product.Price - discountAmount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating discount price for product ID: {ProductId}", productId);
                throw;
            }
        }
    }
}