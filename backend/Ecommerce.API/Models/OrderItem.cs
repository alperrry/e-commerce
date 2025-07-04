namespace ECommerce.API.Models
{
    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty; // Sipariş anındaki ürün adı
        public decimal UnitPrice { get; set; } // Sipariş anındaki birim fiyat
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        
        // Navigation Properties
        public virtual Order? Order { get; set; }
        public virtual Product? Product { get; set; }
    }
}