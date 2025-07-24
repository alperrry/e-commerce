namespace ECommerce.API.Models
{
    public class EmailSettings
    {
        public string ResendApiKey { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = string.Empty;
    }
}