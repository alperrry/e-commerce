namespace ECommerce.API.Models
{
    public class RefundRequest : BaseEntity
    {
        public int OrderId { get; set; }
        public RefundStatus Status { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal RefundAmount { get; set; }
        public int RequestedByUserId { get; set; }
        public int? ProcessedByUserId { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? AdminNotes { get; set; }
        public RefundType Type { get; set; } // Tam/Kýsmi iade

        // Navigation Properties
        public virtual Order Order { get; set; } = null!;
        public virtual User RequestedBy { get; set; } = null!;
        public virtual User? ProcessedBy { get; set; }
    }

    public enum RefundStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Completed = 3
    }

    public enum RefundType
    {
        Full = 0,      // Tam iade
        Partial = 1    // Kýsmi iade
    }
}