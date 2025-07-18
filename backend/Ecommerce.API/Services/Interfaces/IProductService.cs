using ECommerce.API.Models;

namespace ECommerce.API.Services.Interfaces
{
    public interface IProductService
    {
        // Product CRUD Operations
        Task<(IEnumerable<Product> products, int totalItems)> GetProductsAsync(
            int page, 
            int pageSize, 
            string? search, 
            int? categoryId, 
            decimal? minPrice, 
            decimal? maxPrice, 
            string? sortBy);
        
        Task<Product?> GetProductByIdAsync(int id);
        Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 8);
        Task<IEnumerable<string>> GetSearchSuggestionsAsync(string query);
        Task<Product> CreateProductAsync(Product product);
        Task<Product?> UpdateProductAsync(int id, Product product);
        Task<bool> DeleteProductAsync(int id);
        
        // Stock Management
        Task<bool> UpdateStockAsync(int productId, int quantity);
        Task<bool> CheckStockAvailabilityAsync(int productId, int requestedQuantity);
        Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10);
        
        // Product Images
        Task<ProductImage> AddProductImageAsync(int productId, ProductImage image);
        Task<bool> RemoveProductImageAsync(int imageId);
        
        
        // Business Logic
        Task<bool> IncrementViewCountAsync(int productId);
        Task<decimal> CalculateDiscountPriceAsync(int productId, decimal discountPercentage);

        // IProductService interface'ine ekleyin
        Task<bool> SetMainImageAsync(int imageId);
        Task<bool> DeleteImageAsync(int imageId);
    }
}