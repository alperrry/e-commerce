namespace ECommerce.API.Models
{
    public class Product : BaseEntity
    {
        public string Name { get; set; }= string.Empty;
        public string Description { get; set; }= string.Empty;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int StockQuantity { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Brand { get; set; }= string.Empty;
        public int CategoryId { get; set; }
        public bool IsFeatured { get; set; } = false;
        public int ViewCount { get; set; } = 0;
        
        // Navigation Properties
        public virtual Category? Category { get; set; }
        public virtual ICollection<ProductImage>? Images { get; set; }
        public virtual ICollection<CartItem>? CartItems { get; set; }
        public virtual ICollection<OrderItem>? OrderItems { get; set; }
    }
}