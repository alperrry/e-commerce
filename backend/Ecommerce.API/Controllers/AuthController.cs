using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            RoleManager<IdentityRole<int>> roleManager,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _roleManager = roleManager;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new User
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                IsActive = true,
                EmailConfirmed = false, // Email doðrulanmamýþ olarak baþlat
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                try
                {
                    // User rolünü otomatik ata
                    if (!await _roleManager.RoleExistsAsync("User"))
                    {
                        var roleResult = await _roleManager.CreateAsync(new IdentityRole<int> { Name = "User" });
                        Console.WriteLine($"User role created: {roleResult.Succeeded}");
                    }

                    var addRoleResult = await _userManager.AddToRoleAsync(user, "User");
                    Console.WriteLine($"Role added to user: {addRoleResult.Succeeded}");

                    if (!addRoleResult.Succeeded)
                    {
                        Console.WriteLine($"Role add errors: {string.Join(", ", addRoleResult.Errors.Select(e => e.Description))}");
                    }

                    // Email doðrulama token'ý oluþtur ve email gönder
                    var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    var emailSent = await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName, emailToken);

                    if (!emailSent)
                    {
                        // Email gönderilemedi ama kullanýcý oluþturuldu, log'la
                        Console.WriteLine($"Welcome email could not be sent to {user.Email}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error in registration process: {ex.Message}");
                }

                // Generate JWT token
                var token = await GenerateJwtToken(user);
                var roles = await _userManager.GetRolesAsync(user);
                return Ok(new
                {
                    message = "User registered successfully. Please check your email to verify your account.",
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        role = roles.ToList(),
                        emailConfirmed = user.EmailConfirmed
                    }
                });
            }

            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] EmailVerificationRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var result = await _userManager.ConfirmEmailAsync(user, model.Token);
            if (result.Succeeded)
            {
                return Ok(new { message = "Email verified successfully" });
            }

            return BadRequest(new { message = "Email verification failed", errors = result.Errors.Select(e => e.Description) });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] PasswordResetRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Güvenlik nedeniyle kullanýcý bulunamasa bile baþarýlý mesaj döndür
                return Ok(new { message = "If your email is registered, you will receive a password reset link." });
            }

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email, user.FirstName, resetToken);

            if (emailSent)
            {
                return Ok(new { message = "Password reset email sent successfully." });
            }

            return StatusCode(500, new { message = "Failed to send password reset email. Please try again later." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] PasswordResetConfirmRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { message = "Password reset successfully" });
            }

            return BadRequest(new { message = "Password reset failed", errors = result.Errors.Select(e => e.Description) });
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok(new { message = "If your email is registered, you will receive a verification email." });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { message = "Email is already verified" });
            }

            var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var emailSent = await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName, emailToken);

            if (emailSent)
            {
                return Ok(new { message = "Verification email sent successfully." });
            }

            return StatusCode(500, new { message = "Failed to send verification email. Please try again later." });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (result.Succeeded)
            {
                // Generate JWT token
                var token = await GenerateJwtToken(user);
                var roles = await _userManager.GetRolesAsync(user);
                return Ok(new
                {
                    message = "Login successful",
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        role = roles.ToList(),
                        emailConfirmed = user.EmailConfirmed
                    }
                });
            }

            return Unauthorized(new { message = "Invalid email or password" });
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logout successful" });
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Kullanýcýnýn rollerini çekiyoruz
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

            // Rol claim'lerini ekle
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["ExpirationInDays"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Models for Request
    public class RegisterModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class LoginModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ResendVerificationRequest
    {
        public string Email { get; set; } = string.Empty;
    }
}