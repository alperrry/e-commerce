using ECommerce.API.Models;

namespace ECommerce.API.Services.Interfaces
{
    public interface ICartService
    {
        // Cart Operations
        Task<Cart> GetCartAsync(int? userId, string? sessionId);
        Task<Cart> GetOrCreateCartAsync(int? userId, string? sessionId);
        Task<Cart> AddToCartAsync(int? userId, string? sessionId, int productId, int quantity);
        Task<Cart> UpdateCartItemAsync(int cartItemId, int quantity, int? userId, string? sessionId);
        Task<bool> RemoveFromCartAsync(int cartItemId, int? userId, string? sessionId);
        Task<bool> ClearCartAsync(int? userId, string? sessionId);
        
        // Cart Item Operations
        Task<CartItem?> GetCartItemAsync(int cartItemId);
        Task<bool> ValidateCartItemOwnershipAsync(int cartItemId, int? userId, string? sessionId);
        
        // Cart Calculations
        Task<decimal> GetCartTotalAsync(int cartId);
        Task<int> GetCartItemCountAsync(int cartId);
        Task<Dictionary<int, decimal>> GetCartItemSubtotalsAsync(int cartId);
        
        // Stock Validation
        Task<bool> ValidateCartStockAsync(int cartId);
        Task<List<(string productName, int available, int requested)>> GetStockIssuesAsync(int cartId);
        
        // Cart Merge Operations
        Task<Cart> MergeCartsAsync(int userId, string sessionId);
        Task<bool> TransferCartToUserAsync(string sessionId, int userId);
        
        // Cart Analytics
        Task<decimal> GetAverageCartValueAsync();
        Task<int> GetAbandonedCartCountAsync(DateTime since);
        Task<List<Cart>> GetAbandonedCartsAsync(DateTime since, int take = 10);
    }
}