using ECommerce.API.Models;

namespace ECommerce.API.Services.Interfaces
{
    public interface IOrderService
    {
        // Order Operations
        Task<IEnumerable<Order>> GetUserOrdersAsync(int userId);
        Task<Order?> GetOrderByIdAsync(int orderId, int userId);
        Task<Order> CreateOrderAsync(int userId, int addressId, string paymentMethod);
        Task<bool> CancelOrderAsync(int orderId, int userId);
        Task<Order?> GetOrderByOrderNumberAsync(string orderNumber);
        
        // Order Status Management
        Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus);
        Task<bool> MarkOrderAsShippedAsync(int orderId, string? trackingNumber = null);
        Task<bool> MarkOrderAsDeliveredAsync(int orderId);
        
        // Payment Operations
        Task<bool> ProcessPaymentAsync(int orderId, string paymentTransactionId);
        Task<bool> ProcessRefundAsync(int orderId, string reason);
        
        // Order Analytics
        Task<decimal> GetUserTotalSpentAsync(int userId);
        Task<int> GetUserOrderCountAsync(int userId);
        Task<Dictionary<OrderStatus, int>> GetOrderStatusSummaryAsync(int userId);
        
        // Business Logic
        Task<bool> ValidateOrderAsync(Order order);
        Task<decimal> CalculateOrderTotalAsync(int orderId);
        Task<string> GenerateOrderNumberAsync();
        Task<decimal> CalculateShippingCostAsync(int addressId);
        
        // Admin Operations
        Task<(IEnumerable<Order> orders, int totalItems)> GetAllOrdersAsync(
            int page, 
            int pageSize, 
            OrderStatus? status = null,
            DateTime? startDate = null,
            DateTime? endDate = null);
        Task<Dictionary<DateTime, decimal>> GetDailySalesAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(string productName, int quantity, decimal revenue)>> GetTopSellingProductsAsync(int count = 10);
    }
}