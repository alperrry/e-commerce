using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;
namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Tüm controller admin rolü gerektiriyor
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IOrderService _orderService;

        public AdminController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            IOrderService orderService)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _orderService = orderService;
        }

        // GET: api/admin/dashboard/stats
        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != OrderStatus.Cancelled)
                .SumAsync(o => o.TotalAmount);

            var pendingOrders = await _context.Orders
                .CountAsync(o => o.Status == OrderStatus.Pending);

            var lowStockProducts = await _context.Products
                .CountAsync(p => p.IsActive && p.StockQuantity < 10);

            // Bugünün siparişleri
            var today = DateTime.UtcNow.Date;
            var todayOrders = await _context.Orders
                .CountAsync(o => o.OrderDate >= today);

            var todayRevenue = await _context.Orders
                .Where(o => o.OrderDate >= today && o.Status != OrderStatus.Cancelled)
                .SumAsync(o => o.TotalAmount);

            return Ok(new
            {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders,
                lowStockProducts,
                todayOrders,
                todayRevenue
            });
        }

        // GET: api/admin/dashboard/recent-orders
        [HttpGet("dashboard/recent-orders")]
        public async Task<ActionResult<object>> GetRecentOrders()
        {
            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(10)
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.OrderDate,
                    o.Status,
                    o.TotalAmount,
                    CustomerName = o.User!.FirstName + " " + o.User.LastName,
                    CustomerEmail = o.User.Email
                })
                .ToListAsync();

            return Ok(recentOrders);
        }

        // GET: api/admin/dashboard - Combined dashboard data
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboard()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != OrderStatus.Cancelled)
                .SumAsync(o => o.TotalAmount);

            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(10)
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.OrderDate,
                    o.Status,
                    o.TotalAmount,
                    CustomerName = o.User!.FirstName + " " + o.User.LastName,
                    CustomerEmail = o.User.Email
                })
                .ToListAsync();

            var lowStockProducts = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity < 10)
                .OrderBy(p => p.StockQuantity)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.SKU,
                    p.StockQuantity
                })
                .ToListAsync();

            var ordersByStatus = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                recentOrders,
                lowStockProducts,
                ordersByStatus
            });
        }
        // GET: api/admin/roles
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<string>>> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
            return Ok(roles);
        }

        // GET: api/admin/users/5/roles  
        [HttpGet("users/{id}/roles")]
        public async Task<ActionResult<IEnumerable<string>>> GetUserRoles(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles);
        }

        // PUT: api/admin/users/5/roles
        [HttpPut("users/{id}/roles")]
        public async Task<ActionResult> UpdateUserRoles(int id, [FromBody] UpdateUserRolesModel model)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRolesAsync(user, model.Roles);

            return Ok(new { message = "User roles updated successfully" });
        }

        // GET: api/admin/orders
        [HttpGet("orders")]
        public async Task<ActionResult<object>> GetAllOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] OrderStatus? status = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

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
                    o.Id,
                    o.OrderNumber,
                    o.OrderDate,
                    o.Status,
                    o.TotalAmount,
                    o.PaymentMethod,
                    ItemCount = o.OrderItems!.Count,
                    Customer = new
                    {
                        Id = o.User!.Id,
                        Name = o.User.FirstName + " " + o.User.LastName,
                        Email = o.User.Email
                    }
                })
                .ToListAsync();

            return Ok(new
            {
                orders,
                pagination = new
                {
                    currentPage = page,
                    pageSize,
                    totalItems,
                    totalPages
                }
            });
        }

        // PUT: api/admin/orders/5/status - Bu metodu değiştirin
        [HttpPut("orders/{id}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusModel model)
        {
            try
            {
                // OrderService metodunu kullan - email gönderir
                var success = await _orderService.UpdateOrderStatusAsync(id, model.Status);

                if (!success)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // Tracking number varsa ayrıca işle
                if (model.Status == OrderStatus.Shipped && !string.IsNullOrEmpty(model.TrackingNumber))
                {
                    // Tracking number logic buraya eklenebilir
                    var order = await _context.Orders.FindAsync(id);
                    if (order != null)
                    {
                        // order.TrackingNumber = model.TrackingNumber; // Eğer model'de bu field varsa
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { message = "Order status updated successfully and email sent" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating order status", error = ex.Message });
            }
        }
    

    // GET: api/admin/users
    [HttpGet("users")]
        public async Task<ActionResult<object>> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null)
        {
            var query = _context.Users
                .Include(u => u.Orders)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u =>
                    u.Email.Contains(search) ||
                    u.FirstName.Contains(search) ||
                    u.LastName.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var usersFromDb = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var users = new List<object>();
            foreach (var user in usersFromDb)
            {
                var roles = await _userManager.GetRolesAsync(user);
                users.Add(new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.CreatedAt,
                    user.IsActive,
                    OrderCount = user.Orders?.Count ?? 0,
                    TotalSpent = user.Orders?.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount) ?? 0,
                    Roles = roles.ToList()
                });
            }

            return Ok(new
            {
                users,
                pagination = new
                {
                    currentPage = page,
                    pageSize,
                    totalItems,
                    totalPages
                }
            });
        }
        // PUT: api/admin/users/5/activate
        [HttpPut("users/{id}/activate")]
        public async Task<ActionResult> ActivateUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            return Ok(new { message = "User activated successfully" });
        }

        // PUT: api/admin/users/5/deactivate
        [HttpPut("users/{id}/deactivate")]
        public async Task<ActionResult> DeactivateUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            return Ok(new { message = "User deactivated successfully" });
        }

        // GET: api/admin/products/stock-report
        [HttpGet("products/stock-report")]
        public async Task<ActionResult<object>> GetStockReport()
        {
            var outOfStock = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity == 0)
                .CountAsync();

            var lowStock = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity > 0 && p.StockQuantity < 10)
                .CountAsync();

            var inStock = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity >= 10)
                .CountAsync();

            var stockByCategory = await _context.Categories
                .Where(c => c.IsActive)
                .Select(c => new
                {
                    Category = c.Name,
                    TotalProducts = c.Products!.Count(p => p.IsActive),
                    TotalStock = c.Products!.Where(p => p.IsActive).Sum(p => p.StockQuantity),
                    TotalValue = c.Products!.Where(p => p.IsActive).Sum(p => p.StockQuantity * p.Price)
                })
                .ToListAsync();

            return Ok(new
            {
                summary = new
                {
                    outOfStock,
                    lowStock,
                    inStock,
                    total = outOfStock + lowStock + inStock
                },
                stockByCategory
            });
        }

        // GET: api/admin/reports/sales
        [HttpGet("reports/sales")]
        public async Task<ActionResult<object>> GetSalesReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Orders
                .Where(o => o.Status != OrderStatus.Cancelled);

            if (startDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= endDate.Value);
            }

            var totalOrders = await query.CountAsync();
            var totalRevenue = await query.SumAsync(o => o.TotalAmount);
            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            var salesByDay = await query
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(s => s.Date)
                .ToListAsync();

            var topProducts = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => query.Select(o => o.Id).Contains(oi.OrderId))
                .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    QuantitySold = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.TotalPrice)
                })
                .OrderByDescending(p => p.Revenue)
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                summary = new
                {
                    totalOrders,
                    totalRevenue,
                    averageOrderValue
                },
                salesByDay,
                topProducts
            });
        }

        // POST: api/admin/seed-admin
        [AllowAnonymous]
        [HttpPost("seed-admin")]
        public async Task<ActionResult> SeedAdmin()
        {
            // Create all roles if they don't exist
            var roles = new[] { "Admin", "Seller", "User" };

            foreach (var roleName in roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole<int> { Name = roleName });
                }
            }

            // Check if admin user exists
            var adminEmail = "admin@ecommerce.com";
            var adminUser = await _userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "User",
                    EmailConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(adminUser, "Admin123!");

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, "Admin");
                    return Ok(new { message = "Admin user and all roles created successfully" });
                }

                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            // Eğer admin kullanıcısı varsa admin rolünü kontrol et
            var isAdmin = await _userManager.IsInRoleAsync(adminUser, "Admin");
            if (!isAdmin)
            {
                await _userManager.AddToRoleAsync(adminUser, "Admin");
            }

            return Ok(new { message = "All roles exist, admin user ready" });
        }

        // GET: api/admin/check-admin - Debug için
        [HttpGet("check-admin")]
        public async Task<ActionResult<object>> CheckAdminStatus()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                userId,
                userEmail,
                roles,
                isAuthenticated = User.Identity?.IsAuthenticated ?? false,
                authType = User.Identity?.AuthenticationType
            });
        }
    }

    // Request Models (AdminController.cs'nin en sonuna ekleyin)
    public class UpdateOrderStatusModel
    {
        public OrderStatus Status { get; set; }
        public string? TrackingNumber { get; set; }
    }

    public class UpdateUserRolesModel
    {
        public List<string> Roles { get; set; } = new List<string>();
    }
}