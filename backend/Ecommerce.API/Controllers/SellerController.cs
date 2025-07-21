using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ECommerce.API.Services.Interfaces;
using ECommerce.API.Models;
using ECommerce.API.Data;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Seller,Admin")]
    public class SellerController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SellerController> _logger;

        public SellerController(
            IProductService productService,
            ApplicationDbContext context,
            ILogger<SellerController> logger)
        {
            _productService = productService;
            _context = context;
            _logger = logger;
        }

        // GET: api/seller/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var (products, totalItems) = await _productService.GetProductsAsync(
                    page: 1,
                    pageSize: 1000,
                    search: null,
                    categoryId: null,
                    minPrice: null,
                    maxPrice: null,
                    sortBy: "name"
                );

                // GERÇEK SÝPARÝÞ VERÝLERÝ - Admin'den kopyalandý
                var totalOrders = await _context.Orders.CountAsync();
                var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending);

                var today = DateTime.UtcNow.Date;
                var todayOrders = await _context.Orders.CountAsync(o => o.OrderDate >= today);

                var recentOrders = await _context.Orders
                    .Include(o => o.User)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(5)
                    .Select(o => new
                    {
                        id = o.Id,
                        orderNumber = o.OrderNumber,
                        customerName = o.User!.FirstName + " " + o.User.LastName,
                        totalAmount = o.TotalAmount,
                        status = o.Status.ToString(),
                        orderDate = o.OrderDate
                    })
                    .ToListAsync();

                var stats = new
                {
                    totalProducts = products.Count(),
                    lowStockProducts = products.Count(p => p.StockQuantity <= 10),
                    pendingOrders,
                    todayOrders,
                    recentOrders
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching seller dashboard stats");
                return StatusCode(500, new { message = "Dashboard verileri alýnýrken hata oluþtu" });
            }
        }

        // GET: api/seller/orders - Admin'den kopyalandý
        [HttpGet("orders")]
        public async Task<ActionResult<object>> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? search = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .AsQueryable();

                // Status filter
                if (!string.IsNullOrEmpty(status) && status != "all")
                {
                    if (Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
                    {
                        query = query.Where(o => o.Status == orderStatus);
                    }
                }

                // Search filter (order number, customer name)
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(o =>
                        o.OrderNumber.Contains(search) ||
                        (o.User!.FirstName + " " + o.User.LastName).Contains(search) ||
                        o.User.Email.Contains(search));
                }

                // Date filters
                if (startDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate <= endDate.Value);
                }

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var orders = await query
                    .OrderByDescending(o => o.OrderDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(o => new
                    {
                        id = o.Id,
                        orderNumber = o.OrderNumber,
                        orderDate = o.OrderDate,
                        status = o.Status.ToString(),
                        totalAmount = o.TotalAmount,
                        shippingAddress = o.ShippingAddress,
                        user = new
                        {
                            firstName = o.User!.FirstName,
                            lastName = o.User.LastName,
                            email = o.User.Email
                        },
                        orderItems = o.OrderItems!.Select(oi => new
                        {
                            id = oi.Id,
                            productId = oi.ProductId,
                            product = oi.Product != null ? new
                            {
                                name = oi.Product.Name,
                                price = oi.Product.Price,
                                imageUrl = oi.Product.Images != null && oi.Product.Images.Any()
                                    ? oi.Product.Images.FirstOrDefault(img => img.IsMainImage)!.ImageUrl
                                    : null
                            } : null,
                            quantity = oi.Quantity,
                            unitPrice = oi.UnitPrice
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = orders,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalItems,
                        totalPages
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching orders");
                return StatusCode(500, new { message = "Sipariþler alýnýrken hata oluþtu" });
            }
        }

        // PUT: api/seller/orders/5/status - Admin'den kopyalandý
        [HttpPut("orders/{id}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusModel model)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);

                if (order == null)
                {
                    return NotFound(new { message = "Sipariþ bulunamadý" });
                }

                order.Status = model.Status;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Seller updated order {OrderId} status to {Status}", id, model.Status);

                return Ok(new { message = "Sipariþ durumu baþarýyla güncellendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status for order {OrderId}", id);
                return StatusCode(500, new { message = "Sipariþ durumu güncellenirken hata oluþtu" });
            }
        }

        // GET: api/seller/products - ProductsController'dan kopyalandý
        [HttpGet("products")]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "name",
            [FromQuery] string? stock = null)
        {
            try
            {
                var (products, totalItems) = await _productService.GetProductsAsync(
                    page, pageSize, search, categoryId, minPrice, maxPrice, sortBy);

                // Düþük stok filtresi
                if (stock == "low")
                {
                    products = products.Where(p => p.StockQuantity <= 10);
                    totalItems = products.Count();
                }

                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                return Ok(new
                {
                    products,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalItems,
                        totalPages
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching products", error = ex.Message });
            }
        }

        // POST: api/seller/products - ProductsController'dan kopyalandý
        [HttpPost("products")]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            try
            {
                var createdProduct = await _productService.CreateProductAsync(product);
                return CreatedAtAction("GetProduct", new { id = createdProduct.Id }, createdProduct);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the product", error = ex.Message });
            }
        }

        // GET: api/seller/products/5 - ProductsController'dan kopyalandý
        [HttpGet("products/{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);

                if (product == null)
                {
                    return NotFound();
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the product", error = ex.Message });
            }
        }

        // PUT: api/seller/products/5 - ProductsController'dan kopyalandý
        [HttpPut("products/{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedProduct = await _productService.UpdateProductAsync(id, product);

                if (updatedProduct == null)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the product", error = ex.Message });
            }
        }

        // PUT: api/seller/products/5/deactivate - Seller için özel
        [HttpPut("products/{id}/deactivate")]
        public async Task<IActionResult> DeactivateProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound();
                }

                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                await _productService.UpdateProductAsync(id, product);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deactivating the product", error = ex.Message });
            }
        }

        // POST: api/seller/products/5/images/upload - ProductsController'dan kopyalandý
        [HttpPost("products/{id}/images/upload")]
        public async Task<ActionResult<List<ProductImage>>> UploadProductImages(int id, [FromForm] IFormFileCollection images, [FromForm] string? altText = null)
        {
            try
            {
                var uploadedImages = new List<ProductImage>();

                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                foreach (var image in images)
                {
                    if (image.Length == 0)
                        continue;

                    if (image.Length > 5 * 1024 * 1024)
                        return BadRequest(new { message = $"File {image.FileName} is too large. Maximum size is 5MB." });

                    if (!image.ContentType.StartsWith("image/"))
                        return BadRequest(new { message = $"File {image.FileName} is not a valid image." });

                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                    Directory.CreateDirectory(uploadsFolder);

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    var productImage = new ProductImage
                    {
                        ProductId = id,
                        ImageUrl = $"/images/products/{fileName}",
                        AltText = altText ?? $"{product.Name} image",
                        IsMainImage = product.Images?.Count == 0,
                        DisplayOrder = product.Images?.Count ?? 0
                    };

                    var createdImage = await _productService.AddProductImageAsync(id, productImage);
                    uploadedImages.Add(createdImage);
                }

                return Ok(uploadedImages);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while uploading images", error = ex.Message });
            }
        }

        // POST: api/seller/products/5/images - ProductsController'dan kopyalandý
        [HttpPost("products/{id}/images")]
        public async Task<ActionResult<ProductImage>> AddProductImage(int id, ProductImage image)
        {
            try
            {
                var createdImage = await _productService.AddProductImageAsync(id, image);
                return Ok(createdImage);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding the image", error = ex.Message });
            }
        }
    }

    // Request Models - Admin'den kopyalandý

}