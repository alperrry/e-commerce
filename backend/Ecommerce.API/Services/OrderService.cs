using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.Images)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId, int userId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.Images)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order: {OrderId} for user: {UserId}", orderId, userId);
                throw;
            }
        }

        public async Task<Order> CreateOrderAsync(int userId, int addressId, string paymentMethod)
        {
            // Transaction kullanmıyoruz - InMemory database desteklemiyor
            // using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Get user's cart
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
                {
                    throw new InvalidOperationException("Cart is empty");
                }

                // Validate address
                var address = await _context.Addresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                {
                    throw new InvalidOperationException("Invalid address");
                }

                // Check stock availability
                foreach (var item in cart.CartItems)
                {
                    if (item.Product == null || item.Product.StockQuantity < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {item.Product?.Name}");
                    }
                }

                // Get user info
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new InvalidOperationException("User not found");
                }

                // Create order
                var order = new Order
                {
                    UserId = userId,
                    OrderNumber = await GenerateOrderNumberAsync(),
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    
                    // Copy address details
                    ShippingFirstName = address.FirstName,
                    ShippingLastName = address.LastName,
                    ShippingEmail = user.Email ?? "",
                    ShippingPhone = address.Phone,
                    ShippingAddress = address.AddressLine1 + (string.IsNullOrEmpty(address.AddressLine2) ? "" : " " + address.AddressLine2),
                    ShippingCity = address.City,
                    ShippingPostalCode = address.PostalCode,
                    ShippingCountry = address.Country,
                    
                    // Payment details
                    PaymentMethod = paymentMethod,
                    
                    // Calculate totals
                    TotalAmount = cart.CartItems.Sum(ci => ci.Quantity * ci.Price),
                    ShippingCost = await CalculateShippingCostAsync(addressId),
                    TaxAmount = 0,
                    
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    
                    OrderItems = new List<OrderItem>()
                };

                // Calculate tax (18% VAT)
                order.TaxAmount = order.TotalAmount * 0.18m;
                order.TotalAmount = order.TotalAmount + order.TaxAmount + order.ShippingCost;

                _context.Orders.Add(order);

                // Create order items and update stock
                foreach (var cartItem in cart.CartItems)
                {
                    var orderItem = new OrderItem
                    {
                        Order = order,
                        ProductId = cartItem.ProductId,
                        ProductName = cartItem.Product?.Name ?? "",
                        UnitPrice = cartItem.Price,
                        Quantity = cartItem.Quantity,
                        TotalPrice = cartItem.Quantity * cartItem.Price,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    order.OrderItems.Add(orderItem);

                    // Update stock
                    if (cartItem.Product != null)
                    {
                        cartItem.Product.StockQuantity -= cartItem.Quantity;
                    }
                }

                // Clear cart
                _context.CartItems.RemoveRange(cart.CartItems);

                await _context.SaveChangesAsync();
                // await transaction.CommitAsync();

                _logger.LogInformation("Order created successfully: {OrderNumber}", order.OrderNumber);
                return order;
            }
            catch (Exception ex)
            {
                // await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating order for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

                if (order == null)
                {
                    return false;
                }

                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Processing)
                {
                    _logger.LogWarning("Cannot cancel order {OrderId} with status {Status}", orderId, order.Status);
                    return false;
                }

                order.Status = OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;

                // Restore stock
                if (order.OrderItems != null)
                {
                    foreach (var item in order.OrderItems)
                    {
                        if (item.Product != null)
                        {
                            item.Product.StockQuantity += item.Quantity;
                        }
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order cancelled successfully: {OrderNumber}", order.OrderNumber);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<Order?> GetOrderByOrderNumberAsync(string orderNumber)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order by number: {OrderNumber}", orderNumber);
                throw;
            }
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                {
                    return false;
                }

                order.Status = newStatus;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} status updated to {Status}", orderId, newStatus);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> MarkOrderAsShippedAsync(int orderId, string? trackingNumber = null)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.Status != OrderStatus.Processing)
                {
                    return false;
                }

                order.Status = OrderStatus.Shipped;
                order.UpdatedAt = DateTime.UtcNow;
                // Add tracking number if provided
                // order.TrackingNumber = trackingNumber;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} marked as shipped", orderId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking order as shipped: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> MarkOrderAsDeliveredAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.Status != OrderStatus.Shipped)
                {
                    return false;
                }

                order.Status = OrderStatus.Delivered;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} marked as delivered", orderId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking order as delivered: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> ProcessPaymentAsync(int orderId, string paymentTransactionId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                {
                    return false;
                }

                order.PaymentTransactionId = paymentTransactionId;
                order.PaymentDate = DateTime.UtcNow;
                order.Status = OrderStatus.Processing;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment processed for order {OrderId}", orderId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for order: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> ProcessRefundAsync(int orderId, string reason)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.Status == OrderStatus.Refunded)
                {
                    return false;
                }

                order.Status = OrderStatus.Refunded;
                order.UpdatedAt = DateTime.UtcNow;
                // Add refund reason to a new field if needed

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refund processed for order {OrderId}, Reason: {Reason}", orderId, reason);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for order: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<decimal> GetUserTotalSpentAsync(int userId)
        {
            try
            {
                return await _context.Orders
                    .Where(o => o.UserId == userId && o.Status != OrderStatus.Cancelled)
                    .SumAsync(o => o.TotalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total spent for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<int> GetUserOrderCountAsync(int userId)
        {
            try
            {
                return await _context.Orders
                    .CountAsync(o => o.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order count for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<Dictionary<OrderStatus, int>> GetOrderStatusSummaryAsync(int userId)
        {
            try
            {
                var summary = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .GroupBy(o => o.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Status, x => x.Count);

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order status summary for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ValidateOrderAsync(Order order)
        {
            // Implement order validation logic
            if (order == null) return false;
            if (order.OrderItems == null || !order.OrderItems.Any()) return false;
            if (order.TotalAmount <= 0) return false;
            if (string.IsNullOrEmpty(order.ShippingAddress)) return false;
            
            return true;
        }

        public async Task<decimal> CalculateOrderTotalAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return 0;
                }

                var subtotal = order.OrderItems?.Sum(oi => oi.TotalPrice) ?? 0;
                var tax = subtotal * 0.18m;
                var total = subtotal + tax + order.ShippingCost;

                return total;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating order total: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<string> GenerateOrderNumberAsync()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"ORD-{timestamp}-{random}";
        }

        public async Task<decimal> CalculateShippingCostAsync(int addressId)
        {
            try
            {
                var address = await _context.Addresses.FindAsync(addressId);
                if (address == null)
                {
                    return 25.00m; // Default shipping cost
                }

                // Simple shipping cost calculation based on city
                return address.City.ToLower() switch
                {
                    "istanbul" => 15.00m,
                    "ankara" => 20.00m,
                    "izmir" => 20.00m,
                    _ => 25.00m
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating shipping cost for address: {AddressId}", addressId);
                return 25.00m; // Default shipping cost on error
            }
        }

        public async Task<(IEnumerable<Order> orders, int totalItems)> GetAllOrdersAsync(
            int page, 
            int pageSize, 
            OrderStatus? status = null,
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .AsQueryable();

                if (status.HasValue)
                {
                    query = query.Where(o => o.Status == status.Value);
                }

                if (startDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate <= endDate.Value);
                }

                var totalItems = await query.CountAsync();

                var orders = await query
                    .OrderByDescending(o => o.OrderDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (orders, totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                throw;
            }
        }

        public async Task<Dictionary<DateTime, decimal>> GetDailySalesAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var sales = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status != OrderStatus.Cancelled)
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount) })
                    .OrderBy(s => s.Date)
                    .ToDictionaryAsync(x => x.Date, x => x.Revenue);

                return sales;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily sales");
                throw;
            }
        }

        public async Task<IEnumerable<(string productName, int quantity, decimal revenue)>> GetTopSellingProductsAsync(int count = 10)
        {
            try
            {
                var topProducts = await _context.OrderItems
                    .Include(oi => oi.Order)
                    .Where(oi => oi.Order!.Status != OrderStatus.Cancelled)
                    .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                    .Select(g => new
                    {
                        ProductName = g.Key.ProductName,
                        Quantity = g.Sum(oi => oi.Quantity),
                        Revenue = g.Sum(oi => oi.TotalPrice)
                    })
                    .OrderByDescending(p => p.Revenue)
                    .Take(count)
                    .ToListAsync();

                return topProducts.Select(p => (p.ProductName, p.Quantity, p.Revenue));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top selling products");
                throw;
            }
        }
    }
}