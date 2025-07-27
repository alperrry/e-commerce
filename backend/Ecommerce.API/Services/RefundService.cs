using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class RefundService : IRefundService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public RefundService(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId, string reason, bool isAdmin = false)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return false;

            // İptal edilebilir mi kontrol et
            if (!await CanCancelOrderAsync(orderId)) return false;

            // Kullanıcı yetkisi kontrol et (admin değilse sadece kendi siparişini iptal edebilir)
            if (!isAdmin && order.UserId != userId) return false;

            // Siparişi iptal et
            order.Status = OrderStatus.Cancelled;
            order.CancellationReason = reason;
            order.CancellationDate = DateTime.UtcNow;
            order.CancelledByUserId = userId;

            // Stokları geri ekle
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();

            foreach (var item in orderItems)
            {
                if (item.Product != null)
                {
                    item.Product.StockQuantity += item.Quantity;
                }
            }

            await _context.SaveChangesAsync();

            // Email gönder
            await _emailService.SendOrderCancellationEmailAsync(order.User!.Email!, order.OrderNumber, reason);

            return true;
        }

        public async Task<RefundRequest> CreateRefundRequestAsync(int orderId, int userId, string reason, decimal? amount = null)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) throw new ArgumentException("Sipariş bulunamadı");
            if (order.UserId != userId) throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok");
            if (!await CanRequestRefundAsync(orderId)) throw new InvalidOperationException("Bu sipariş için iade talebi oluşturulamaz");

            // Iade miktarını belirle
            var refundAmount = amount ?? order.TotalAmount;
            var refundType = (amount.HasValue && amount.Value < order.TotalAmount) ? RefundType.Partial : RefundType.Full;

            var refundRequest = new RefundRequest
            {
                OrderId = orderId,
                Status = RefundStatus.Pending,
                Reason = reason,
                RefundAmount = refundAmount,
                RequestedByUserId = userId,
                Type = refundType
            };

            _context.RefundRequests.Add(refundRequest);
            await _context.SaveChangesAsync();

            // Admin'e email gönder
            // Admin'e email gönder
            var adminEmail = _configuration["EmailSettings:AdminEmail"];
            await _emailService.SendRefundRequestNotificationToAdminAsync(order.OrderNumber, reason, refundAmount);

            return refundRequest;
        }

        public async Task<RefundRequest> ProcessRefundRequestAsync(int refundId, int adminUserId, bool approved, string? adminNotes = null)
        {
            var refundRequest = await _context.RefundRequests
                .Include(rr => rr.Order)
                .ThenInclude(o => o.User)
                .Include(rr => rr.RequestedBy)
                .FirstOrDefaultAsync(rr => rr.Id == refundId);

            if (refundRequest == null) throw new ArgumentException("İade talebi bulunamadı");
            if (refundRequest.Status != RefundStatus.Pending) throw new InvalidOperationException("Bu iade talebi zaten işlenmiş");

            refundRequest.Status = approved ? RefundStatus.Approved : RefundStatus.Rejected;
            refundRequest.ProcessedByUserId = adminUserId;
            refundRequest.ProcessedDate = DateTime.UtcNow;
            refundRequest.AdminNotes = adminNotes;

            if (approved)
            {
                // Sipariş durumunu güncelle
                refundRequest.Order.Status = OrderStatus.Refunded;

                // Stokları geri ekle (eğer tam iade ise)
                if (refundRequest.Type == RefundType.Full)
                {
                    var orderItems = await _context.OrderItems
                        .Include(oi => oi.Product)
                        .Where(oi => oi.OrderId == refundRequest.OrderId)
                        .ToListAsync();

                    foreach (var item in orderItems)
                    {
                        if (item.Product != null)
                        {
                            item.Product.StockQuantity += item.Quantity;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Müşteriye email gönder
            await _emailService.SendRefundProcessedEmailAsync(
                refundRequest.RequestedBy.Email!,
                refundRequest.Order.OrderNumber,
                approved,
                refundRequest.RefundAmount,
                adminNotes);

            return refundRequest;
        }

        public async Task<IEnumerable<RefundRequest>> GetUserRefundRequestsAsync(int userId)
        {
            return await _context.RefundRequests
                .Include(rr => rr.Order)
                .Include(rr => rr.ProcessedBy)
                .Where(rr => rr.RequestedByUserId == userId)
                .OrderByDescending(rr => rr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<RefundRequest>> GetAllRefundRequestsAsync()
        {
            return await _context.RefundRequests
                .Include(rr => rr.Order)
                .Include(rr => rr.RequestedBy)
                .Include(rr => rr.ProcessedBy)
                .OrderByDescending(rr => rr.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> CanCancelOrderAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            // Sadece Pending, Processing durumundaki siparişler iptal edilebilir
            return order.Status == OrderStatus.Pending || order.Status == OrderStatus.Processing;
        }

        public async Task<bool> CanRequestRefundAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            // ESKI: Sadece Delivered
            // if (order.Status != OrderStatus.Delivered) return false;

            // YENİ: Shipped + Delivered
            if (order.Status != OrderStatus.Delivered && order.Status != OrderStatus.Shipped)
                return false;

            var existingRefund = await _context.RefundRequests
                .AnyAsync(rr => rr.OrderId == orderId && rr.Status != RefundStatus.Rejected);

            return !existingRefund;
        }
    }
}