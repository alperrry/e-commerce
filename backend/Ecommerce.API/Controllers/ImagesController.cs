using Microsoft.AspNetCore.Mvc;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IProductService _productService;

        public ImagesController(IProductService productService)
        {
            _productService = productService;
        }

        // PUT: api/images/5/main
        [HttpPut("{imageId}/main")]
        public async Task<IActionResult> SetMainImage(int imageId)
        {
            try
            {
                var result = await _productService.SetMainImageAsync(imageId);

                if (!result)
                {
                    return NotFound(new { message = "Image not found" });
                }

                return Ok(new { message = "Main image updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while setting main image", error = ex.Message });
            }
        }

        // DELETE: api/images/5
        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            try
            {
                var result = await _productService.DeleteImageAsync(imageId);

                if (!result)
                {
                    return NotFound(new { message = "Image not found" });
                }

                return Ok(new { message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting image", error = ex.Message });
            }
        }
    }
}