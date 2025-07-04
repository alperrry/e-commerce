using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services;

namespace ECommerce.API.Tests.Services
{
    public class ProductServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly ProductService _productService;
        private readonly Mock<ILogger<ProductService>> _loggerMock;

        public ProductServiceTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<ProductService>>();
            _productService = new ProductService(_context, _loggerMock.Object);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Electronics", Description = "Electronic products", IsActive = true },
                new Category { Id = 2, Name = "Clothing", Description = "Clothing items", IsActive = true }
            };

            var products = new List<Product>
            {
                new Product
                {
                    Id = 1,
                    Name = "Laptop",
                    Description = "Gaming Laptop",
                    Price = 1500,
                    StockQuantity = 10,
                    CategoryId = 1,
                    SKU = "LAP001",
                    Brand = "TestBrand",
                    IsActive = true,
                    IsFeatured = true,
                    ViewCount = 100
                },
                new Product
                {
                    Id = 2,
                    Name = "T-Shirt",
                    Description = "Cotton T-Shirt",
                    Price = 25,
                    DiscountPrice = 20,
                    StockQuantity = 50,
                    CategoryId = 2,
                    SKU = "TSH001",
                    Brand = "TestClothing",
                    IsActive = true,
                    IsFeatured = false,
                    ViewCount = 50
                },
                new Product
                {
                    Id = 3,
                    Name = "Inactive Product",
                    Description = "This product is inactive",
                    Price = 100,
                    StockQuantity = 5,
                    CategoryId = 1,
                    SKU = "INA001",
                    Brand = "TestBrand",
                    IsActive = false
                }
            };

            _context.Categories.AddRange(categories);
            _context.Products.AddRange(products);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetProductsAsync_ShouldReturnActiveProducts()
        {
            // Arrange
            int page = 1, pageSize = 10;

            // Act
            var (products, totalItems) = await _productService.GetProductsAsync(
                page, pageSize, null, null, null, null, null);

            // Assert
            products.Should().HaveCount(2);
            totalItems.Should().Be(2);
            products.Should().OnlyContain(p => p.IsActive == true);
        }

        [Fact]
        public async Task GetProductsAsync_WithSearch_ShouldReturnMatchingProducts()
        {
            // Arrange
            string search = "laptop";

            // Act
            var (products, totalItems) = await _productService.GetProductsAsync(
                1, 10, search, null, null, null, null);

            // Assert
            products.Should().HaveCount(1);
            products.First().Name.Should().Be("Laptop");
        }

        [Fact]
        public async Task GetProductsAsync_WithCategoryFilter_ShouldReturnCategoryProducts()
        {
            // Arrange
            int categoryId = 2;

            // Act
            var (products, totalItems) = await _productService.GetProductsAsync(
                1, 10, null, categoryId, null, null, null);

            // Assert
            products.Should().HaveCount(1);
            products.First().CategoryId.Should().Be(categoryId);
        }

        [Fact]
        public async Task GetProductsAsync_WithPriceFilter_ShouldReturnProductsInRange()
        {
            // Arrange
            decimal minPrice = 20, maxPrice = 30;

            // Act
            var (products, totalItems) = await _productService.GetProductsAsync(
                1, 10, null, null, minPrice, maxPrice, null);

            // Assert
            products.Should().HaveCount(1);
            products.First().Price.Should().BeInRange(minPrice, maxPrice);
        }

        [Fact]
        public async Task GetProductByIdAsync_ExistingProduct_ShouldReturnProduct()
        {
            // Arrange
            int productId = 1;

            // Act
            var product = await _productService.GetProductByIdAsync(productId);

            // Assert
            product.Should().NotBeNull();
            product!.Id.Should().Be(productId);
            product.IsActive.Should().BeTrue();
        }

        [Fact]
        public async Task GetProductByIdAsync_NonExistingProduct_ShouldReturnNull()
        {
            // Arrange
            int productId = 999;

            // Act
            var product = await _productService.GetProductByIdAsync(productId);

            // Assert
            product.Should().BeNull();
        }

        [Fact]
        public async Task GetProductByIdAsync_InactiveProduct_ShouldReturnNull()
        {
            // Arrange
            int productId = 3;

            // Act
            var product = await _productService.GetProductByIdAsync(productId);

            // Assert
            product.Should().BeNull();
        }

        [Fact]
        public async Task CreateProductAsync_ShouldCreateAndReturnProduct()
        {
            // Arrange
            var newProduct = new Product
            {
                Name = "New Product",
                Description = "New Description",
                Price = 100,
                StockQuantity = 20,
                CategoryId = 1,
                SKU = "NEW001",
                Brand = "NewBrand"
            };

            // Act
            var createdProduct = await _productService.CreateProductAsync(newProduct);

            // Assert
            createdProduct.Should().NotBeNull();
            createdProduct.Id.Should().BeGreaterThan(0);
            createdProduct.IsActive.Should().BeTrue();
            createdProduct.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task UpdateProductAsync_ExistingProduct_ShouldUpdateAndReturn()
        {
            // Arrange
            int productId = 1;
            var updateProduct = new Product
            {
                Id = productId,
                Name = "Updated Laptop",
                Description = "Updated Description",
                Price = 1600,
                StockQuantity = 15,
                CategoryId = 1,
                SKU = "LAP001",
                Brand = "UpdatedBrand"
            };

            // Act
            var updatedProduct = await _productService.UpdateProductAsync(productId, updateProduct);

            // Assert
            updatedProduct.Should().NotBeNull();
            updatedProduct!.Name.Should().Be("Updated Laptop");
            updatedProduct.Price.Should().Be(1600);
            updatedProduct.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task DeleteProductAsync_ExistingProduct_ShouldSoftDelete()
        {
            // Arrange
            int productId = 2;

            // Act
            var result = await _productService.DeleteProductAsync(productId);

            // Assert
            result.Should().BeTrue();
            
            var deletedProduct = await _context.Products.FindAsync(productId);
            deletedProduct.Should().NotBeNull();
            deletedProduct!.IsActive.Should().BeFalse();
        }

        [Fact]
        public async Task CheckStockAvailabilityAsync_SufficientStock_ShouldReturnTrue()
        {
            // Arrange
            int productId = 1;
            int requestedQuantity = 5;

            // Act
            var result = await _productService.CheckStockAvailabilityAsync(productId, requestedQuantity);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task CheckStockAvailabilityAsync_InsufficientStock_ShouldReturnFalse()
        {
            // Arrange
            int productId = 1;
            int requestedQuantity = 15;

            // Act
            var result = await _productService.CheckStockAvailabilityAsync(productId, requestedQuantity);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task GetFeaturedProductsAsync_ShouldReturnOnlyFeaturedProducts()
        {
            // Act
            var products = await _productService.GetFeaturedProductsAsync(5);

            // Assert
            products.Should().HaveCount(1);
            products.Should().OnlyContain(p => p.IsFeatured == true);
        }

        [Fact]
        public async Task IncrementViewCountAsync_ShouldIncreaseViewCount()
        {
            // Arrange
            int productId = 1;
            var originalProduct = await _context.Products.FindAsync(productId);
            var originalViewCount = originalProduct!.ViewCount;

            // Act
            var result = await _productService.IncrementViewCountAsync(productId);

            // Assert
            result.Should().BeTrue();
            
            var updatedProduct = await _context.Products.FindAsync(productId);
            updatedProduct!.ViewCount.Should().Be(originalViewCount + 1);
        }

        [Fact]
        public async Task CalculateDiscountPriceAsync_ShouldReturnCorrectDiscountedPrice()
        {
            // Arrange
            int productId = 1;
            decimal discountPercentage = 10;

            // Act
            var discountedPrice = await _productService.CalculateDiscountPriceAsync(productId, discountPercentage);

            // Assert
            discountedPrice.Should().Be(1350); // 1500 - (1500 * 0.10) = 1350
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}