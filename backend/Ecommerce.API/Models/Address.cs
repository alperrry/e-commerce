namespace ECommerce.API.Models
{
    public class Address : BaseEntity
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FirstName { get; set; }= string.Empty;
        public string LastName { get; set; }= string.Empty;
        public string Phone { get; set; }= string.Empty;
        public string AddressLine1 { get; set; }= string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; }= string.Empty;
        public string? State { get; set; }
        public string PostalCode { get; set; }= string.Empty;
        public string Country { get; set; }= string.Empty;
        public bool IsDefault { get; set; } = false;
        
        // Navigation Property
        public virtual User? User { get; set; }
    }
}