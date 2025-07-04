using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // GET: api/cart
        [HttpGet]
        public async Task<ActionResult<Cart>> GetCart()
        {
            try
            {
                int? userId = null;
                string? sessionId = null;

                // Check if user is authenticated
                if (User.Identity?.IsAuthenticated == true)
                {
                    userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }
                else
                {
                    // For guest users, use session ID from header
                    sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
                }

                var cart = await _cartService.GetCartAsync(userId, sessionId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the cart", error = ex.Message });
            }
        }

        // POST: api/cart/add
        [HttpPost("add")]
        public async Task<ActionResult<Cart>> AddToCart([FromBody] AddToCartModel model)
        {
            try
            {
                int? userId = null;
                string? sessionId = null;

                // Get user ID or session ID
                if (User.Identity?.IsAuthenticated == true)
                {
                    userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }
                else
                {
                    sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
                    if (string.IsNullOrEmpty(sessionId))
                    {
                        return BadRequest(new { message = "Session ID required for guest users" });
                    }
                }

                var cart = await _cartService.AddToCartAsync(userId, sessionId, model.ProductId, model.Quantity);
                return Ok(cart);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding to cart", error = ex.Message });
            }
        }

        // PUT: api/cart/update
        [HttpPut("update")]
        public async Task<ActionResult<Cart>> UpdateCartItem([FromBody] UpdateCartItemModel model)
        {
            try
            {
                int? userId = null;
                string? sessionId = null;

                // Get user ID or session ID
                if (User.Identity?.IsAuthenticated == true)
                {
                    userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }
                else
                {
                    sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
                }

                var cart = await _cartService.UpdateCartItemAsync(model.CartItemId, model.Quantity, userId, sessionId);
                return Ok(cart);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating cart item", error = ex.Message });
            }
        }

        // DELETE: api/cart/remove/{cartItemId}
        [HttpDelete("remove/{cartItemId}")]
        public async Task<ActionResult> RemoveFromCart(int cartItemId)
        {
            try
            {
                int? userId = null;
                string? sessionId = null;

                // Get user ID or session ID
                if (User.Identity?.IsAuthenticated == true)
                {
                    userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }
                else
                {
                    sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
                }

                var result = await _cartService.RemoveFromCartAsync(cartItemId, userId, sessionId);

                if (!result)
                {
                    return NotFound(new { message = "Cart item not found" });
                }

                return Ok(new { message = "Item removed from cart" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing from cart", error = ex.Message });
            }
        }

        // DELETE: api/cart/clear
        [HttpDelete("clear")]
        public async Task<ActionResult> ClearCart()
        {
            try
            {
                int? userId = null;
                string? sessionId = null;

                // Get user ID or session ID
                if (User.Identity?.IsAuthenticated == true)
                {
                    userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }
                else
                {
                    sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
                }

                await _cartService.ClearCartAsync(userId, sessionId);
                return Ok(new { message = "Cart cleared" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while clearing cart", error = ex.Message });
            }
        }

        // GET: api/cart/validate
        [HttpGet("validate")]
        public async Task<ActionResult<object>> ValidateCart()
        {
            try
            {
                int? userId = null;
                string? sessionId = null;

                // Get user ID or session ID
                if (User.Identity?.IsAuthenticated == true)
                {
                    userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }
                else
                {
                    sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
                }

                var cart = await _cartService.GetCartAsync(userId, sessionId);
                
                if (cart.Id == 0)
                {
                    return Ok(new { isValid = true, issues = new List<object>() });
                }

                var isValid = await _cartService.ValidateCartStockAsync(cart.Id);
                var stockIssues = await _cartService.GetStockIssuesAsync(cart.Id);
                
                var issues = stockIssues.Select(issue => new
                {
                    productName = issue.productName,
                    available = issue.available,
                    requested = issue.requested
                }).ToList();

                return Ok(new { isValid, issues });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while validating cart", error = ex.Message });
            }
        }

        // POST: api/cart/merge
        [HttpPost("merge")]
        [Authorize]
        public async Task<ActionResult<Cart>> MergeCarts([FromBody] MergeCartModel model)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var mergedCart = await _cartService.MergeCartsAsync(userId, model.SessionId);
                return Ok(mergedCart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while merging carts", error = ex.Message });
            }
        }
    }

    // Request Models
    public class AddToCartModel
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemModel
    {
        public int CartItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class MergeCartModel
    {
        public string SessionId { get; set; } = string.Empty;
    }
}