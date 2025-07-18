using Microsoft.AspNetCore.Mvc;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        // GET: api/products?page=1&pageSize=10&search=shirt&categoryId=1&minPrice=10&maxPrice=100
        [HttpGet]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "name")
        {
            try
            {
                var (products, totalItems) = await _productService.GetProductsAsync(
                    page, pageSize, search, categoryId, minPrice, maxPrice, sortBy);

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

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);

                if (product == null)
                {
                    return NotFound();
                }

                // Increment view count
                await _productService.IncrementViewCountAsync(id);

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the product", error = ex.Message });
            }
        }

        // GET: api/products/featured
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<Product>>> GetFeaturedProducts()
        {
            try
            {
                var products = await _productService.GetFeaturedProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching featured products", error = ex.Message });
            }
        }

        // GET: api/products/search-suggestions?q=shirt
        [HttpGet("search-suggestions")]
        public async Task<ActionResult<IEnumerable<string>>> GetSearchSuggestions([FromQuery] string q)
        {
            try
            {
                var suggestions = await _productService.GetSearchSuggestionsAsync(q);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching suggestions", error = ex.Message });
            }
        }

        // POST: api/products
        [HttpPost]
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

        // PUT: api/products/5
        [HttpPut("{id}")]
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

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                
                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the product", error = ex.Message });
            }
        }
        // POST: api/products/5/images/upload
        [HttpPost("{id}/images/upload")]
        public async Task<ActionResult<List<ProductImage>>> UploadProductImages(int id, [FromForm] IFormFileCollection images, [FromForm] string? altText = null)
        {
            try
            {
                var uploadedImages = new List<ProductImage>();

                // Ürünün var olduğunu kontrol et
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                foreach (var image in images)
                {
                    // Dosya validasyonu
                    if (image.Length == 0)
                        continue;

                    if (image.Length > 5 * 1024 * 1024) // 5MB limit
                        return BadRequest(new { message = $"File {image.FileName} is too large. Maximum size is 5MB." });

                    if (!image.ContentType.StartsWith("image/"))
                        return BadRequest(new { message = $"File {image.FileName} is not a valid image." });

                    // Dosyayı kaydet
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                    Directory.CreateDirectory(uploadsFolder);

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    // Veritabanına kaydet
                    var productImage = new ProductImage
                    {
                        ProductId = id,
                        ImageUrl = $"/images/products/{fileName}",
                        AltText = altText ?? $"{product.Name} image",
                        IsMainImage = product.Images?.Count == 0, // İlk resim ana resim
                        DisplayOrder = product.Images?.Count ?? 0
                    };

                    var createdImage = await _productService.AddProductImageAsync(id, productImage);
                    uploadedImages.Add(createdImage);
                }
                // Upload başarılı olduktan sonra ekle:
                Console.WriteLine($"✅ Upload tamamlandı. Product ID: {id}");
                Console.WriteLine($"✅ Yüklenen resim sayısı: {uploadedImages.Count}");

                foreach (var img in uploadedImages)
                {
                    Console.WriteLine($"✅ Resim: ID={img.Id}, URL={img.ImageUrl}, IsMain={img.IsMainImage}");
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

        // POST: api/products/5/images
        [HttpPost("{id}/images")]
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
}