namespace ECommerce.API.Models
{
    public class Cart : BaseEntity
    {
        public int? UserId { get; set; }
        public string? SessionId { get; set; } // Misafir kullanıcılar için
        
        // Navigation Properties
        public virtual User? User { get; set; }
        public virtual ICollection<CartItem>? CartItems { get; set; }
        
        // Calculated Property - Getter only, not stored in database
        public decimal TotalAmount { get; set; }
    }
}