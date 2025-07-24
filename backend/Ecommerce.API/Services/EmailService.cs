using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace ECommerce.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly HttpClient _httpClient;
        private readonly ILogger<EmailService> _logger;

        // EmailService.cs dosyanızın constructor kısmını şu şekilde değiştirin:

        public EmailService(IOptions<EmailSettings> emailSettings, HttpClient httpClient, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _httpClient = httpClient;
            _logger = logger;

            // Sadece Authorization header'ını ekle
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_emailSettings.ResendApiKey}");
            // Content-Type'ı burada ekleme, SendEmailAsync metodunda ekleyeceğiz
        }
        public async Task<bool> SendEmailAsync(EmailRequest emailRequest)
        {
            try
            {
                var emailData = new
                {
                    from = _emailSettings.FromEmail,
                    to = new[] { emailRequest.To },
                    subject = emailRequest.Subject,
                    html = emailRequest.Body
                };

                var json = JsonSerializer.Serialize(emailData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://api.resend.com/emails", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Email sent successfully to {emailRequest.To}");
                    return true;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Failed to send email to {emailRequest.To}. Status: {response.StatusCode}, Error: {errorContent}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {emailRequest.To}");
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string userName, string verificationToken)
        {
            var verificationUrl = $"{_emailSettings.BaseUrl}/verify-email?token={Uri.EscapeDataString(verificationToken)}&email={Uri.EscapeDataString(email)}";
            var subject = "Hoş Geldiniz - Email Adresinizi Doğrulayın";
            var body = GetWelcomeEmailTemplate(userName, verificationUrl);

            var emailRequest = new EmailRequest
            {
                To = email,
                Subject = subject,
                Body = body
            };

            return await SendEmailAsync(emailRequest);
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email, string userName, string resetToken)
        {
            var resetUrl = $"{_emailSettings.BaseUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(email)}";
            var subject = "Şifre Sıfırlama Talebi";
            var body = GetPasswordResetEmailTemplate(userName, resetUrl);

            var emailRequest = new EmailRequest
            {
                To = email,
                Subject = subject,
                Body = body
            };

            return await SendEmailAsync(emailRequest);
        }

        public async Task<bool> SendOrderConfirmationEmailAsync(string email, string userName, string orderNumber, decimal totalAmount)
        {
            var subject = $"Sipariş Onayı - #{orderNumber}";
            var body = GetOrderConfirmationEmailTemplate(userName, orderNumber, totalAmount);

            var emailRequest = new EmailRequest
            {
                To = email,
                Subject = subject,
                Body = body
            };

            return await SendEmailAsync(emailRequest);
        }

        public async Task<bool> SendOrderStatusUpdateEmailAsync(string email, string userName, string orderNumber, string newStatus)
        {
            var subject = $"Sipariş Güncelleme - #{orderNumber}";
            var body = GetOrderStatusUpdateEmailTemplate(userName, orderNumber, newStatus);

            var emailRequest = new EmailRequest
            {
                To = email,
                Subject = subject,
                Body = body
            };

            return await SendEmailAsync(emailRequest);
        }

        private string GetWelcomeEmailTemplate(string userName, string verificationUrl)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1'>
                    <title>Hoş Geldiniz</title>
                </head>
                <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
                        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                            <h1 style='color: white; margin: 0; font-size: 28px;'>🎉 Hoş Geldiniz!</h1>
                        </div>
                        <div style='padding: 30px;'>
                            <h2 style='color: #333; margin-bottom: 20px;'>Merhaba {userName},</h2>
                            <p style='color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                E-ticaret sitemize hoş geldiniz! Hesabınız başarıyla oluşturuldu. 
                                Alışverişe başlamak için email adresinizi doğrulamanız gerekmektedir.
                            </p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{verificationUrl}' 
                                   style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                                          font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);'>
                                    ✅ Email Adresimi Doğrula
                                </a>
                            </div>
                            <p style='color: #999; font-size: 14px; text-align: center; margin-top: 25px;'>
                                Bu link 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu emaili göz ardı edebilirsiniz.
                            </p>
                        </div>
                        <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;'>
                            <p style='color: #666; font-size: 12px; margin: 0;'>
                                © 2024 E-Commerce Sitesi. Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private string GetPasswordResetEmailTemplate(string userName, string resetUrl)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1'>
                    <title>Şifre Sıfırlama</title>
                </head>
                <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
                        <div style='background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                            <h1 style='color: white; margin: 0; font-size: 28px;'>🔐 Şifre Sıfırlama</h1>
                        </div>
                        <div style='padding: 30px;'>
                            <h2 style='color: #333; margin-bottom: 20px;'>Merhaba {userName},</h2>
                            <p style='color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                Şifrenizi sıfırlamak için bir talepte bulundunuz. 
                                Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz.
                            </p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{resetUrl}' 
                                   style='display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                                          color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                                          font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);'>
                                    🔑 Şifremi Sıfırla
                                </a>
                            </div>
                            <p style='color: #999; font-size: 14px; text-align: center; margin-top: 25px;'>
                                Bu link 1 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu emaili göz ardı edebilirsiniz.
                            </p>
                        </div>
                        <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;'>
                            <p style='color: #666; font-size: 12px; margin: 0;'>
                                © 2024 E-Commerce Sitesi. Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private string GetOrderConfirmationEmailTemplate(string userName, string orderNumber, decimal totalAmount)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1'>
                    <title>Sipariş Onayı</title>
                </head>
                <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
                        <div style='background: linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                            <h1 style='color: white; margin: 0; font-size: 28px;'>🛍 Sipariş Onayı</h1>
                        </div>
                        <div style='padding: 30px;'>
                            <h2 style='color: #333; margin-bottom: 20px;'>Merhaba {userName},</h2>
                            <p style='color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                Siparişiniz başarıyla alındı! Siparişinizle ilgili detaylar aşağıdadır:
                            </p>
                            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                <h3 style='color: #333; margin: 0 0 15px 0;'>Sipariş Detayları</h3>
                                <p style='margin: 5px 0; color: #666;'><strong>Sipariş No:</strong> #{orderNumber}</p>
                                <p style='margin: 5px 0; color: #666;'><strong>Toplam Tutar:</strong> {totalAmount:C}</p>
                                <p style='margin: 5px 0; color: #666;'><strong>Tarih:</strong> {DateTime.Now:dd.MM.yyyy HH:mm}</p>
                            </div>
                            <p style='color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                Siparişiniz hazırlanmaya başlandı. Kargo süreci hakkında bilgilendirme emaili alacaksınız.
                            </p>
                        </div>
                        <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;'>
                            <p style='color: #666; font-size: 12px; margin: 0;'>
                                © 2024 E-Commerce Sitesi. Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private string GetOrderStatusUpdateEmailTemplate(string userName, string orderNumber, string newStatus)
        {
            var statusMessages = new Dictionary<string, (string message, string color, string emoji)>
            {
                ["Pending"] = ("Siparişiniz alındı ve işleme konuyor", "#ffa726", "⏳"),
                ["Processing"] = ("Siparişiniz hazırlanıyor", "#42a5f5", "📦"),
                ["Shipped"] = ("Siparişiniz kargoya verildi", "#26a69a", "🚚"),
                ["Delivered"] = ("Siparişiniz teslim edildi", "#66bb6a", "✅"),
                ["Cancelled"] = ("Siparişiniz iptal edildi", "#ef5350", "❌")
            };

            var (message, color, emoji) = statusMessages.GetValueOrDefault(newStatus, ("Sipariş durumu güncellendi", "#9e9e9e", "📝"));

            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1'>
                    <title>Sipariş Güncelleme</title>
                </head>
                <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
                        <div style='background-color: {color}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                            <h1 style='color: white; margin: 0; font-size: 28px;'>{emoji} Sipariş Güncelleme</h1>
                        </div>
                        <div style='padding: 30px;'>
                            <h2 style='color: #333; margin-bottom: 20px;'>Merhaba {userName},</h2>
                            <p style='color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                #{orderNumber} numaralı siparişinizin durumu güncellendi:
                            </p>
                            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'>
                                <h3 style='color: {color}; margin: 0 0 10px 0; font-size: 24px;'>{newStatus}</h3>
                                <p style='color: #666; margin: 0; font-size: 16px;'>{message}</p>
                            </div>
                            <p style='color: #999; font-size: 14px; text-align: center; margin-top: 25px;'>
                                Güncellenme Zamanı: {DateTime.Now:dd.MM.yyyy HH:mm}
                            </p>
                        </div>
                        <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;'>
                            <p style='color: #666; font-size: 12px; margin: 0;'>
                                © 2024 E-Commerce Sitesi. Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }
    }
}