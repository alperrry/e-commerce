using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly IProductService _productService;
        private readonly ILogger<CartService> _logger;

        public CartService(
            ApplicationDbContext context, 
            IProductService productService,
            ILogger<CartService> logger)
        {
            _context = context;
            _productService = productService;
            _logger = logger;
        }

        public async Task<Cart> GetCartAsync(int? userId, string? sessionId)
        {
            try
            {
                Cart? cart = null;

                if (userId.HasValue)
                {
                    cart = await _context.Carts
                        .Include(c => c.CartItems)
                            .ThenInclude(ci => ci.Product)
                                .ThenInclude(p => p!.Images)
                        .FirstOrDefaultAsync(c => c.UserId == userId.Value);
                }
                else if (!string.IsNullOrEmpty(sessionId))
                {
                    cart = await _context.Carts
                        .Include(c => c.CartItems)
                            .ThenInclude(ci => ci.Product)
                                .ThenInclude(p => p!.Images)
                        .FirstOrDefaultAsync(c => c.SessionId == sessionId);
                }

                return cart ?? new Cart { CartItems = new List<CartItem>() };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart");
                throw;
            }
        }

        public async Task<Cart> GetOrCreateCartAsync(int? userId, string? sessionId)
        {
            try
            {
                var cart = await GetCartAsync(userId, sessionId);
                
                if (cart.Id == 0) // New cart
                {
                    cart = new Cart
                    {
                        UserId = userId,
                        SessionId = sessionId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CartItems = new List<CartItem>()
                    };

                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("New cart created for user: {UserId}, session: {SessionId}", 
                        userId, sessionId);
                }

                return cart;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cart");
                throw;
            }
        }

        public async Task<Cart> AddToCartAsync(int? userId, string? sessionId, int productId, int quantity)
        {
            try
            {
                // Validate product and stock
                var product = await _productService.GetProductByIdAsync(productId);
                if (product == null)
                {
                    throw new InvalidOperationException("Product not found");
                }

                if (!await _productService.CheckStockAvailabilityAsync(productId, quantity))
                {
                    throw new InvalidOperationException("Insufficient stock");
                }

                // Get or create cart
                var cart = await GetOrCreateCartAsync(userId, sessionId);

                // Check if product already in cart
                var existingItem = cart.CartItems?.FirstOrDefault(ci => ci.ProductId == productId);

                if (existingItem != null)
                {
                    // Update quantity
                    var newQuantity = existingItem.Quantity + quantity;
                    
                    if (!await _productService.CheckStockAvailabilityAsync(productId, newQuantity))
                    {
                        throw new InvalidOperationException("Insufficient stock for the requested quantity");
                    }

                    existingItem.Quantity = newQuantity;
                    existingItem.UpdatedAt = DateTime.UtcNow;

                    _logger.LogInformation("Updated cart item quantity for product: {ProductId}", productId);
                }
                else
                {
                    // Add new item
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = productId,
                        Quantity = quantity,
                        Price = product.DiscountPrice ?? product.Price,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.CartItems.Add(cartItem);

                    _logger.LogInformation("Added new item to cart for product: {ProductId}", productId);
                }

                await _context.SaveChangesAsync();

                // Reload cart with updated items
                return await GetCartAsync(userId, sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to cart");
                throw;
            }
        }

        public async Task<Cart> UpdateCartItemAsync(int cartItemId, int quantity, int? userId, string? sessionId)
        {
            try
            {
                var cartItem = await GetCartItemAsync(cartItemId);
                if (cartItem == null)
                {
                    throw new InvalidOperationException("Cart item not found");
                }

                // Validate ownership
                if (!await ValidateCartItemOwnershipAsync(cartItemId, userId, sessionId))
                {
                    throw new UnauthorizedAccessException("Access denied to this cart item");
                }

                if (quantity <= 0)
                {
                    // Remove item
                    _context.CartItems.Remove(cartItem);
                    _logger.LogInformation("Removed cart item: {CartItemId}", cartItemId);
                }
                else
                {
                    // Check stock
                    if (!await _productService.CheckStockAvailabilityAsync(cartItem.ProductId, quantity))
                    {
                        throw new InvalidOperationException("Insufficient stock");
                    }

                    cartItem.Quantity = quantity;
                    cartItem.UpdatedAt = DateTime.UtcNow;

                    _logger.LogInformation("Updated cart item: {CartItemId} with quantity: {Quantity}", 
                        cartItemId, quantity);
                }

                await _context.SaveChangesAsync();

                return await GetCartAsync(userId, sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item");
                throw;
            }
        }

        public async Task<bool> RemoveFromCartAsync(int cartItemId, int? userId, string? sessionId)
        {
            try
            {
                var cartItem = await GetCartItemAsync(cartItemId);
                if (cartItem == null)
                {
                    return false;
                }

                // Validate ownership
                if (!await ValidateCartItemOwnershipAsync(cartItemId, userId, sessionId))
                {
                    throw new UnauthorizedAccessException("Access denied to this cart item");
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed cart item: {CartItemId}", cartItemId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from cart");
                throw;
            }
        }

        public async Task<bool> ClearCartAsync(int? userId, string? sessionId)
        {
            try
            {
                var cart = await GetCartAsync(userId, sessionId);
                
                if (cart.Id == 0 || cart.CartItems == null || !cart.CartItems.Any())
                {
                    return true; // Already empty
                }

                _context.CartItems.RemoveRange(cart.CartItems);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleared cart: {CartId}", cart.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                throw;
            }
        }

        public async Task<CartItem?> GetCartItemAsync(int cartItemId)
        {
            return await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);
        }

        public async Task<bool> ValidateCartItemOwnershipAsync(int cartItemId, int? userId, string? sessionId)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null)
            {
                return false;
            }

            if (userId.HasValue)
            {
                return cartItem.Cart?.UserId == userId.Value;
            }

            if (!string.IsNullOrEmpty(sessionId))
            {
                return cartItem.Cart?.SessionId == sessionId;
            }

            return false;
        }

        public async Task<decimal> GetCartTotalAsync(int cartId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => ci.CartId == cartId)
                    .ToListAsync();

                return cartItems.Sum(ci => ci.Quantity * ci.Price);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating cart total");
                throw;
            }
        }

        public async Task<int> GetCartItemCountAsync(int cartId)
        {
            try
            {
                return await _context.CartItems
                    .Where(ci => ci.CartId == cartId)
                    .SumAsync(ci => ci.Quantity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart item count");
                throw;
            }
        }

        public async Task<Dictionary<int, decimal>> GetCartItemSubtotalsAsync(int cartId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => ci.CartId == cartId)
                    .ToListAsync();

                return cartItems.ToDictionary(
                    ci => ci.Id,
                    ci => ci.Quantity * ci.Price
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart item subtotals");
                throw;
            }
        }

        public async Task<bool> ValidateCartStockAsync(int cartId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.CartId == cartId)
                    .ToListAsync();

                foreach (var item in cartItems)
                {
                    if (item.Product == null || item.Product.StockQuantity < item.Quantity)
                    {
                        return false;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating cart stock");
                throw;
            }
        }

        public async Task<List<(string productName, int available, int requested)>> GetStockIssuesAsync(int cartId)
        {
            try
            {
                var issues = new List<(string, int, int)>();

                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.CartId == cartId)
                    .ToListAsync();

                foreach (var item in cartItems)
                {
                    if (item.Product == null || item.Product.StockQuantity < item.Quantity)
                    {
                        issues.Add((
                            item.Product?.Name ?? "Unknown Product",
                            item.Product?.StockQuantity ?? 0,
                            item.Quantity
                        ));
                    }
                }

                return issues;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stock issues");
                throw;
            }
        }

        public async Task<Cart> MergeCartsAsync(int userId, string sessionId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Get both carts
                var userCart = await GetOrCreateCartAsync(userId, null);
                var sessionCart = await GetCartAsync(null, sessionId);

                if (sessionCart.Id == 0 || sessionCart.CartItems == null || !sessionCart.CartItems.Any())
                {
                    return userCart; // Nothing to merge
                }

                // Merge items
                foreach (var sessionItem in sessionCart.CartItems)
                {
                    var existingItem = userCart.CartItems?.FirstOrDefault(ci => ci.ProductId == sessionItem.ProductId);

                    if (existingItem != null)
                    {
                        // Update quantity
                        existingItem.Quantity += sessionItem.Quantity;
                        existingItem.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // Transfer item to user cart
                        sessionItem.CartId = userCart.Id;
                        sessionItem.UpdatedAt = DateTime.UtcNow;
                    }
                }

                // Delete session cart
                _context.Carts.Remove(sessionCart);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Merged carts for user: {UserId}", userId);

                return await GetCartAsync(userId, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error merging carts");
                throw;
            }
        }

        public async Task<bool> TransferCartToUserAsync(string sessionId, int userId)
        {
            try
            {
                var sessionCart = await _context.Carts
                    .FirstOrDefaultAsync(c => c.SessionId == sessionId);

                if (sessionCart == null)
                {
                    return false;
                }

                sessionCart.UserId = userId;
                sessionCart.SessionId = null;
                sessionCart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Transferred cart from session: {SessionId} to user: {UserId}", 
                    sessionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring cart");
                throw;
            }
        }

        public async Task<decimal> GetAverageCartValueAsync()
        {
            try
            {
                var carts = await _context.Carts
                    .Include(c => c.CartItems)
                    .Where(c => c.CartItems!.Any())
                    .ToListAsync();

                if (!carts.Any())
                {
                    return 0;
                }

                var totalValue = carts.Sum(c => c.CartItems!.Sum(ci => ci.Quantity * ci.Price));
                return totalValue / carts.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting average cart value");
                throw;
            }
        }

        public async Task<int> GetAbandonedCartCountAsync(DateTime since)
        {
            try
            {
                return await _context.Carts
                    .Include(c => c.CartItems)
                    .Where(c => c.UpdatedAt < since && c.CartItems!.Any())
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting abandoned cart count");
                throw;
            }
        }

        public async Task<List<Cart>> GetAbandonedCartsAsync(DateTime since, int take = 10)
        {
            try
            {
                return await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Product)
                    .Include(c => c.User)
                    .Where(c => c.UpdatedAt < since && c.CartItems!.Any())
                    .OrderByDescending(c => c.UpdatedAt)
                    .Take(take)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting abandoned carts");
                throw;
            }
        }
    }
}