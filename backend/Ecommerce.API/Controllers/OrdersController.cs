using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching orders", error = ex.Message });
            }
        }

        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var order = await _orderService.GetOrderByIdAsync(id, userId);

                if (order == null)
                {
                    return NotFound();
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the order", error = ex.Message });
            }
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderModel model)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var order = await _orderService.CreateOrderAsync(userId, model.AddressId, model.PaymentMethod);
                
                return CreatedAtAction("GetOrder", new { id = order.Id }, order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the order", error = ex.Message });
            }
        }

        // PUT: api/orders/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _orderService.CancelOrderAsync(id, userId);

                if (!result)
                {
                    return BadRequest(new { message = "Order cannot be cancelled" });
                }

                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while cancelling the order", error = ex.Message });
            }
        }

        // GET: api/orders/track/{orderNumber}
        [HttpGet("track/{orderNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> TrackOrder(string orderNumber)
        {
            try
            {
                var order = await _orderService.GetOrderByOrderNumberAsync(orderNumber);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                return Ok(new
                {
                    order.OrderNumber,
                    order.OrderDate,
                    order.Status,
                    order.ShippingCity,
                    ItemCount = order.OrderItems?.Count ?? 0,
                    TotalAmount = order.TotalAmount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while tracking the order", error = ex.Message });
            }
        }

        // GET: api/orders/summary
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetOrdersSummary()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var totalSpent = await _orderService.GetUserTotalSpentAsync(userId);
                var orderCount = await _orderService.GetUserOrderCountAsync(userId);
                var statusSummary = await _orderService.GetOrderStatusSummaryAsync(userId);

                return Ok(new
                {
                    totalOrders = orderCount,
                    totalSpent,
                    ordersByStatus = statusSummary.Select(kvp => new
                    {
                        status = kvp.Key.ToString(),
                        count = kvp.Value
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching order summary", error = ex.Message });
            }
        }
    }

    // Request Models
    public class CreateOrderModel
    {
        public int AddressId { get; set; }
        public string PaymentMethod { get; set; } = "CreditCard";
    }
}