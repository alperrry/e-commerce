using ECommerce.API.Models;

namespace ECommerce.API.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(EmailRequest emailRequest);
        Task<bool> SendWelcomeEmailAsync(string email, string userName, string verificationToken);
        Task<bool> SendPasswordResetEmailAsync(string email, string userName, string resetToken);
        Task<bool> SendOrderConfirmationEmailAsync(string email, string userName, string orderNumber, decimal totalAmount);
        Task<bool> SendOrderStatusUpdateEmailAsync(string email, string userName, string orderNumber, string newStatus);
        Task SendOrderCancellationEmailAsync(string toEmail, string orderNumber, string reason);
        Task SendRefundRequestNotificationToAdminAsync(string orderNumber, string reason, decimal amount);
        Task SendRefundProcessedEmailAsync(string toEmail, string orderNumber, bool approved, decimal amount, string? adminNotes);
        Task SendRefundCompletedEmailAsync(string toEmail, string orderNumber, decimal amount);
    }
}