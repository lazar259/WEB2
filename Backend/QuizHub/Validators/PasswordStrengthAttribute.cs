using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace QuizHub.Validators
{
    public class PasswordStrengthAttribute : ValidationAttribute
    {
        public int MinLength { get; set; } = 8;
        public bool RequireUppercase { get; set; } = true;
        public bool RequireLowercase { get; set; } = true;
        public bool RequireDigit { get; set; } = true;
        public bool RequireSpecialChar { get; set; } = true;

        public override bool IsValid(object? value)
        {
            if (value is not string password)
                return false;

            if (string.IsNullOrWhiteSpace(password))
                return false;

            // Check minimum length
            if (password.Length < MinLength)
                return false;

            // Check for uppercase letter
            if (RequireUppercase && !password.Any(char.IsUpper))
                return false;

            // Check for lowercase letter
            if (RequireLowercase && !password.Any(char.IsLower))
                return false;

            // Check for digit
            if (RequireDigit && !password.Any(char.IsDigit))
                return false;

            // Check for special character
            if (RequireSpecialChar && !Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>/?]"))
                return false;

            return true;
        }

        public override string FormatErrorMessage(string name)
        {
            var requirements = new List<string>();

            if (MinLength > 0)
                requirements.Add($"at least {MinLength} characters");

            if (RequireUppercase)
                requirements.Add("at least one uppercase letter");

            if (RequireLowercase)
                requirements.Add("at least one lowercase letter");

            if (RequireDigit)
                requirements.Add("at least one digit");

            if (RequireSpecialChar)
                requirements.Add("at least one special character");

            var message = $"The {name} field must contain {string.Join(", ", requirements)}.";
            return message;
        }
    }
}