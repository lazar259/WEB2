using System.ComponentModel.DataAnnotations;
using QuizHub.Models;
using QuizHub.Validators;

namespace QuizHub.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters.")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(255, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 255 characters.")]
        [PasswordStrength(MinLength = 8, RequireUppercase = true, RequireLowercase = true, RequireDigit = true, RequireSpecialChar = true)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [PasswordConfirmation("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        public UserType UserType { get; set; } = UserType.Regular;

        public string? ProfilePicture { get; set; }

        public string? ProfilePictureName { get; set; }

    }
}