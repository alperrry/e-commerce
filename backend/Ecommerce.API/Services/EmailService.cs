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
        private readonly IConfiguration _configuration;

        // EmailService.cs dosyanızın constructor kısmını şu şekilde değiştirin:

        public EmailService(IOptions<EmailSettings> emailSettings, HttpClient httpClient, ILogger<EmailService> logger, IConfiguration configuration)
        {
            _emailSettings = emailSettings.Value;
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;

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
        // EmailService.cs'e EKLENECEKler - Mevcut metodları değiştir

        public async Task SendOrderCancellationEmailAsync(string toEmail, string orderNumber, string reason)
        {
            var subject = $"Sipariş İptali Bildirimi - #{orderNumber}";

            var body = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Sipariş İptali</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 30px; }}
                .alert {{ background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                .order-info {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .reason-box {{ background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                .footer {{ background-color: #6c757d; color: white; padding: 20px; text-align: center; }}
                .btn {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                .icon {{ width: 24px; height: 24px; vertical-align: middle; margin-right: 8px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🚫 Sipariş İptal Edildi</h1>
                </div>
                
                <div class='content'>
                    <div class='alert'>
                        <strong>Merhaba,</strong><br>
                        Siparişiniz iptal edilmiştir. Aşağıdaki detayları inceleyebilirsiniz.
                    </div>
                    
                    <div class='order-info'>
                        <h3 style='margin-top: 0; color: #333;'>📋 Sipariş Bilgileri</h3>
                        <p><strong>Sipariş Numarası:</strong> #{orderNumber}</p>
                        <p><strong>İptal Tarihi:</strong> {DateTime.Now:dd MMMM yyyy, HH:mm}</p>
                        <p><strong>Durum:</strong> <span style='color: #dc3545; font-weight: bold;'>İPTAL EDİLDİ</span></p>
                    </div>
                    
                    <div class='reason-box'>
                        <h4 style='margin-top: 0;'>💬 İptal Nedeni:</h4>
                        <p style='margin-bottom: 0;'>{reason}</p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <p>Herhangi bir sorunuz için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>
                        <a href='mailto:destek@yourstore.com' class='btn'>📧 Destek İlet</a>
                    </div>
                </div>
                
                <div class='footer'>
                    <p style='margin: 0;'>Bu email otomatik olarak gönderilmiştir.</p>
                    <p style='margin: 0;'>© 2025 E-Ticaret Mağazası. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </body>
        </html>";

            var emailRequest = new EmailRequest
            {
                To = toEmail,
                Subject = subject,
                Body = body
            };
            await SendEmailAsync(emailRequest);
        }

        public async Task SendRefundRequestNotificationToAdminAsync(string orderNumber, string reason, decimal amount)
        {
            var adminEmail = _configuration["EmailSettings:AdminEmail"];
            var subject = $"🔔 Yeni İade Talebi - #{orderNumber}";

            var body = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Yeni İade Talebi</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, #ffc107, #e0a800); color: #212529; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 30px; }}
                .alert {{ background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                .refund-details {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }}
                .amount {{ color: #28a745; font-size: 24px; font-weight: bold; }}
                .btn {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }}
                .btn-primary {{ background-color: #007bff; }}
                .btn-success {{ background-color: #28a745; }}
                .footer {{ background-color: #6c757d; color: white; padding: 20px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>⚠️ Yeni İade Talebi</h1>
                </div>
                
                <div class='content'>
                    <div class='alert'>
                        <strong>Admin Bildirimi:</strong><br>
                        Yeni bir iade talebi oluşturuldu ve onayınızı bekliyor.
                    </div>
                    
                    <div class='refund-details'>
                        <h3 style='margin-top: 0; color: #333;'>📋 İade Talebi Detayları</h3>
                        <p><strong>Sipariş Numarası:</strong> #{orderNumber}</p>
                        <p><strong>İade Miktarı:</strong> <span class='amount'>₺{amount:N2}</span></p>
                        <p><strong>Talep Tarihi:</strong> {DateTime.Now:dd MMMM yyyy, HH:mm}</p>
                        <p><strong>Durum:</strong> <span style='color: #ffc107; font-weight: bold;'>ONAY BEKLİYOR</span></p>
                        
                        <h4 style='margin-top: 20px; color: #333;'>💬 İade Nedeni:</h4>
                        <div style='background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;'>
                            {reason}
                        </div>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <p>İade talebini incelemek ve işlem yapmak için admin panele gidin:</p>
                        <a href='http://localhost:3000/admin/refunds' class='btn btn-primary'>🖥️ Admin Panel</a>
                        <a href='http://localhost:3000/admin/orders' class='btn btn-success'>📦 Sipariş Detayı</a>
                    </div>
                    
                    <div style='background-color: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0;'>
                        <p style='margin: 0; color: #6c757d; font-size: 14px;'>
                            ⏰ İade talepleri 24 saat içinde değerlendirilmelidir.
                        </p>
                    </div>
                </div>
                
                <div class='footer'>
                    <p style='margin: 0;'>Bu email otomatik olarak gönderilmiştir.</p>
                    <p style='margin: 0;'>© 2025 E-Ticaret Admin Sistemi</p>
                </div>
            </div>
        </body>
        </html>";

            var emailRequest = new EmailRequest
            {
                To = adminEmail,
                Subject = subject,
                Body = body
            };
            await SendEmailAsync(emailRequest);
        }

        public async Task SendRefundProcessedEmailAsync(string toEmail, string orderNumber, bool approved, decimal amount, string? adminNotes)
        {
            var subject = $"✅ İade Talebi {(approved ? "Onaylandı" : "Reddedildi")} - #{orderNumber}";
            var statusColor = approved ? "#28a745" : "#dc3545";
            var statusBg = approved ? "#d4edda" : "#f8d7da";
            var statusText = approved ? "ONAYLANDI" : "REDDEDİLDİ";
            var statusIcon = approved ? "✅" : "❌";

            var body = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>İade Talebi Sonucu</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, {statusColor}, {statusColor}dd); color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 30px; }}
                .status-alert {{ background-color: {statusBg}; border: 1px solid {statusColor}; color: {statusColor}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }}
                .refund-details {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .amount {{ color: {statusColor}; font-size: 28px; font-weight: bold; }}
                .admin-note {{ background-color: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6c757d; }}
                .timeline {{ background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; margin: 20px 0; }}
                .btn {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                .footer {{ background-color: #6c757d; color: white; padding: 20px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>{statusIcon} İade Talebi {statusText}</h1>
                </div>
                
                <div class='content'>
                    <div class='status-alert'>
                        <h2 style='margin: 0 0 10px 0;'>Talebiniz {statusText}</h2>
                        <p style='margin: 0; font-size: 16px;'>Sipariş #{orderNumber} için oluşturduğunuz iade talebi işleme alınmıştır.</p>
                    </div>
                    
                    <div class='refund-details'>
                        <h3 style='margin-top: 0; color: #333;'>📋 İade Detayları</h3>
                        <p><strong>Sipariş Numarası:</strong> #{orderNumber}</p>
                        <p><strong>İade Miktarı:</strong> <span class='amount'>₺{amount:N2}</span></p>
                        <p><strong>İşlem Tarihi:</strong> {DateTime.Now:dd MMMM yyyy, HH:mm}</p>
                        <p><strong>Durum:</strong> <span style='color: {statusColor}; font-weight: bold;'>{statusText}</span></p>
                    </div>";

            if (!string.IsNullOrEmpty(adminNotes))
            {
                body += $@"
                    <div class='admin-note'>
                        <h4 style='margin-top: 0; color: #333;'>💬 Yönetici Notu:</h4>
                        <p style='margin-bottom: 0;'>{adminNotes}</p>
                    </div>";
            }

            if (approved)
            {
                body += $@"
                    <div class='timeline'>
                        <h4 style='margin-top: 0; color: #28a745;'>⏱️ Sonraki Adımlar:</h4>
                        <ul style='margin-bottom: 0; padding-left: 20px;'>
                            <li>İade işleminiz başlatılmıştır</li>
                            <li>Para iadesi 3-5 iş günü içinde hesabınıza yansıyacaktır</li>
                            <li>İşlem tamamlandığında tekrar bilgilendirileceksiniz</li>
                        </ul>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <p>İade sürecini siparişlerim sayfasından takip edebilirsiniz:</p>
                        <a href='http://localhost:3000/orders' class='btn'>📦 Siparişlerim</a>
                    </div>";
            }
            else
            {
                body += $@"
                    <div class='timeline'>
                        <h4 style='margin-top: 0; color: #dc3545;'>ℹ️ Red Nedeni:</h4>
                        <p>İade talebiniz yukarıda belirtilen sebeplerle reddedilmiştir.</p>
                        <p>Daha fazla bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='mailto:destek@yourstore.com' class='btn'>📧 Müşteri Hizmetleri</a>
                        <a href='http://localhost:3000/orders' class='btn'>📦 Siparişlerim</a>
                    </div>";
            }

            body += $@"
                </div>
                
                <div class='footer'>
                    <p style='margin: 0;'>Bu email otomatik olarak gönderilmiştir.</p>
                    <p style='margin: 0;'>© 2025 E-Ticaret Mağazası. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </body>
        </html>";

            var emailRequest = new EmailRequest
            {
                To = toEmail,
                Subject = subject,
                Body = body
            };
            await SendEmailAsync(emailRequest);
        }

        // Bonus: İade tamamlandığında gönderilecek email
        public async Task SendRefundCompletedEmailAsync(string toEmail, string orderNumber, decimal amount)
        {
            var subject = $"💰 İade İşlemi Tamamlandı - #{orderNumber}";

            var body = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>İade Tamamlandı</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 30px; }}
                .success-box {{ background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }}
                .amount {{ color: #28a745; font-size: 32px; font-weight: bold; }}
                .refund-details {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .footer {{ background-color: #6c757d; color: white; padding: 20px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 İade İşlemi Tamamlandı!</h1>
                </div>
                
                <div class='content'>
                    <div class='success-box'>
                        <h2 style='margin: 0 0 15px 0;'>Para İadeniz Hesabınıza Yatırıldı</h2>
                        <div class='amount'>₺{amount:N2}</div>
                        <p style='margin: 15px 0 0 0;'>Sipariş #{orderNumber}</p>
                    </div>
                    
                    <div class='refund-details'>
                        <h3 style='margin-top: 0; color: #333;'>📋 İşlem Detayları</h3>
                        <p><strong>İade Miktarı:</strong> ₺{amount:N2}</p>
                        <p><strong>İşlem Tarihi:</strong> {DateTime.Now:dd MMMM yyyy, HH:mm}</p>
                        <p><strong>Durum:</strong> <span style='color: #28a745; font-weight: bold;'>TAMAMLANDI</span></p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <p>Tekrar alışveriş yapmak için mağazamızı ziyaret edebilirsiniz:</p>
                        <a href='http://localhost:3000/products' style='display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;'>🛍️ Alışverişe Devam Et</a>
                    </div>
                </div>
                
                <div class='footer'>
                    <p style='margin: 0;'>Memnuniyetiniz bizim için önemlidir.</p>
                    <p style='margin: 0;'>© 2025 E-Ticaret Mağazası</p>
                </div>
            </div>
        </body>
        </html>";

            var emailRequest = new EmailRequest
            {
                To = toEmail,
                Subject = subject,
                Body = body
            };
            await SendEmailAsync(emailRequest);
        }
    }
}