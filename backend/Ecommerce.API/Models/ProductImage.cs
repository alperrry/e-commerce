namespace ECommerce.API.Models
{
    public class ProductImage : BaseEntity
    {
        public int ProductId { get; set; }
        public string ImageUrl { get; set; }= string.Empty;
        public string? AltText { get; set; }
        public bool IsMainImage { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
        
        // Navigation Property
        public virtual Product? Product { get; set; }
    }
}