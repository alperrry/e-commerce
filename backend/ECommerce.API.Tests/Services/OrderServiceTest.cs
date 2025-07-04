using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using ECommerce.API.Services;
using ECommerce.API.Data;
using ECommerce.API.Models;
using System;

namespace ECommerce.API.Tests.Services
{
    public class OrderServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly OrderService _orderService;
        private readonly Mock<ILogger<OrderService>> _loggerMock;

        public OrderServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<OrderService>>();
            _orderService = new OrderService(_context, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateOrderAsync_WithValidData_ShouldCreateOrder()
        {
            // Arrange
            var user = new User { Id = 1, Email = "test@example.com" };
            _context.Users.Add(user);
            var product = new Product { Id = 1, Name = "Test Product", StockQuantity = 10, Price = 100 };
            _context.Products.Add(product);
            var address = new Address { Id = 1, UserId = 1, FirstName = "Ali", LastName = "Veli", Phone = "123", AddressLine1 = "Adres", City = "Ankara", PostalCode = "06000", Country = "TR" };
            _context.Addresses.Add(address);
            var cart = new Cart
            {
                UserId = 1,
                CartItems = new List<CartItem> {
                new CartItem { ProductId = 1, Quantity = 1, Price = 100, Product = product }
            }
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            // Act
            var order = await _orderService.CreateOrderAsync(1, 1, "CreditCard");

            // Assert
            Assert.NotNull(order);
            Assert.Equal(OrderStatus.Pending, order.Status);
            Assert.Single(order.OrderItems);
            Assert.Equal(9, product.StockQuantity);
        }

        [Fact]
        public async Task CreateOrderAsync_WithEmptyCart_ShouldThrow()
        {
            var user = new User { Id = 2, Email = "empty@example.com" };
            _context.Users.Add(user);
            _context.Carts.Add(new Cart { UserId = 2 });
            await _context.SaveChangesAsync();

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _orderService.CreateOrderAsync(2, 0, "CreditCard"));
        }

        [Fact]
        public async Task CreateOrderAsync_WithInvalidAddress_ShouldThrow()
        {
            var user = new User { Id = 3, Email = "test2@example.com" };
            var product = new Product { Id = 2, Name = "Product", StockQuantity = 5, Price = 50 };
            _context.Users.Add(user);
            _context.Products.Add(product);
            _context.Carts.Add(new Cart
            {
                UserId = 3,
                CartItems = new List<CartItem> {
                    new CartItem { ProductId = 2, Quantity = 1, Price = 50, Product = product }
                }
            });
            await _context.SaveChangesAsync();

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _orderService.CreateOrderAsync(3, 999, "CreditCard"));
        }

        [Fact]
        public async Task CancelOrderAsync_WithValidPendingOrder_ShouldCancel()
        {
            var user = new User { Id = 4 };
            _context.Users.Add(user);
            var order = new Order { Id = 1, UserId = 4, Status = OrderStatus.Pending };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = await _orderService.CancelOrderAsync(1, 4);

            Assert.True(result);
            var updatedOrder = await _context.Orders.FindAsync(1);
            Assert.Equal(OrderStatus.Cancelled, updatedOrder.Status);
        }

        [Fact]
        public async Task CancelOrderAsync_WithDeliveredOrder_ShouldNotCancel()
        {
            var user = new User { Id = 5 };
            _context.Users.Add(user);
            var order = new Order { Id = 2, UserId = 5, Status = OrderStatus.Delivered };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = await _orderService.CancelOrderAsync(2, 5);

            Assert.False(result);
        }

        [Fact]
        public async Task GetUserOrdersAsync_ShouldReturnOrders()
        {
            var user = new User { Id = 6 };
            _context.Users.Add(user);
            _context.Orders.Add(new Order { UserId = 6, Status = OrderStatus.Pending });
            _context.Orders.Add(new Order { UserId = 6, Status = OrderStatus.Shipped });
            await _context.SaveChangesAsync();

            var orders = await _orderService.GetUserOrdersAsync(6);

            Assert.Equal(2, orders.Count());
        }

        [Fact]
        public async Task ProcessPaymentAsync_ShouldSetPaymentStatusAndDate()
        {
            var order = new Order { Id = 3, UserId = 7, Status = OrderStatus.Pending };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = await _orderService.ProcessPaymentAsync(3, "TXN-123");

            Assert.True(result);
            var updatedOrder = await _context.Orders.FindAsync(3);
            Assert.Equal(OrderStatus.Processing, updatedOrder.Status);
            Assert.NotNull(updatedOrder.PaymentTransactionId);
        }

        [Fact]
        public async Task ValidateOrderAsync_WithInvalidOrder_ShouldReturnFalse()
        {
            var invalidOrder = new Order();
            var isValid = await _orderService.ValidateOrderAsync(invalidOrder);
            Assert.False(isValid);
        }

        [Fact]
        public async Task GetOrderByIdAsync_ShouldReturnCorrectOrder()
        {
            var order = new Order { Id = 10, UserId = 9 };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = await _orderService.GetOrderByIdAsync(10, 9);
            Assert.NotNull(result);
            Assert.Equal(10, result!.Id);
        }
    }
}
