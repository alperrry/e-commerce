using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ECommerce.API.Services.Interfaces;
using ECommerce.API.Models;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RefundController : ControllerBase
    {
        private readonly IRefundService _refundService;

        public RefundController(IRefundService refundService)
        {
            _refundService = refundService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        private bool IsAdmin()
        {
            return User.IsInRole("Admin");
        }

        // POST: api/refund/cancel-order
        [HttpPost("cancel-order")]
        public async Task<IActionResult> CancelOrder([FromBody] CancelOrderRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = IsAdmin();

                var result = await _refundService.CancelOrderAsync(
                    request.OrderId,
                    userId,
                    request.Reason,
                    isAdmin);

                if (!result)
                {
                    return BadRequest(new { message = "Sipariþ iptal edilemedi. Sipariþ durumunu kontrol edin." });
                }

                return Ok(new { message = "Sipariþ baþarýyla iptal edildi." });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/refund/request
        [HttpPost("request")]
        public async Task<IActionResult> CreateRefundRequest([FromBody] CreateRefundRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var refundRequest = await _refundService.CreateRefundRequestAsync(
                    request.OrderId,
                    userId,
                    request.Reason,
                    request.Amount);

                return Ok(new
                {
                    message = "Ýade talebi baþarýyla oluþturuldu.",
                    refundRequestId = refundRequest.Id,
                    status = refundRequest.Status.ToString()
                });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/refund/my-requests
        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyRefundRequests()
        {
            try
            {
                var userId = GetCurrentUserId();
                var refundRequests = await _refundService.GetUserRefundRequestsAsync(userId);

                var result = refundRequests.Select(rr => new
                {
                    id = rr.Id,
                    orderId = rr.OrderId,
                    orderNumber = rr.Order?.OrderNumber,
                    status = rr.Status.ToString(),
                    reason = rr.Reason,
                    refundAmount = rr.RefundAmount,
                    type = rr.Type.ToString(),
                    requestDate = rr.CreatedAt,
                    processedDate = rr.ProcessedDate,
                    adminNotes = rr.AdminNotes
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/refund/check-cancel/{orderId}
        [HttpGet("check-cancel/{orderId}")]
        public async Task<IActionResult> CheckCanCancel(int orderId)
        {
            try
            {
                var canCancel = await _refundService.CanCancelOrderAsync(orderId);
                return Ok(new { canCancel });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/refund/check-refund/{orderId}
        [HttpGet("check-refund/{orderId}")]
        public async Task<IActionResult> CheckCanRefund(int orderId)
        {
            try
            {
                var canRefund = await _refundService.CanRequestRefundAsync(orderId);
                return Ok(new { canRefund });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ADMIN ENDPOINTS
        // GET: api/refund/admin/all-requests
        [HttpGet("admin/all-requests")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRefundRequests()
        {
            try
            {
                var refundRequests = await _refundService.GetAllRefundRequestsAsync();

                var result = refundRequests.Select(rr => new
                {
                    id = rr.Id,
                    orderId = rr.OrderId,
                    orderNumber = rr.Order?.OrderNumber,
                    customerName = $"{rr.RequestedBy?.UserName}",
                    customerEmail = rr.RequestedBy?.Email,
                    status = rr.Status.ToString(),
                    reason = rr.Reason,
                    refundAmount = rr.RefundAmount,
                    type = rr.Type.ToString(),
                    requestDate = rr.CreatedAt,
                    processedBy = rr.ProcessedBy?.UserName,
                    processedDate = rr.ProcessedDate,
                    adminNotes = rr.AdminNotes
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/refund/admin/process/{refundId}
        [HttpPost("admin/process/{refundId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ProcessRefundRequest(int refundId, [FromBody] ProcessRefundRequest request)
        {
            try
            {
                var adminUserId = GetCurrentUserId();

                var refundRequest = await _refundService.ProcessRefundRequestAsync(
                    refundId,
                    adminUserId,
                    request.Approved,
                    request.AdminNotes);

                return Ok(new
                {
                    message = request.Approved ? "Ýade talebi onaylandý." : "Ýade talebi reddedildi.",
                    refundRequest = new
                    {
                        id = refundRequest.Id,
                        status = refundRequest.Status.ToString(),
                        processedDate = refundRequest.ProcessedDate
                    }
                });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class CancelOrderRequest
    {
        public int OrderId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class CreateRefundRequest
    {
        public int OrderId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
    }

    public class ProcessRefundRequest
    {
        public bool Approved { get; set; }
        public string? AdminNotes { get; set; }
    }
}