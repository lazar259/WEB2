using System.ComponentModel.DataAnnotations;

namespace QuizHub.Validators
{
    public class PasswordConfirmationAttribute : ValidationAttribute
    {
        private readonly string _passwordPropertyName;

        public PasswordConfirmationAttribute(string passwordPropertyName)
        {
            _passwordPropertyName = passwordPropertyName;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var passwordProperty = validationContext.ObjectType.GetProperty(_passwordPropertyName);
            
            if (passwordProperty == null)
            {
                return new ValidationResult($"Property {_passwordPropertyName} not found.");
            }

            var passwordValue = passwordProperty.GetValue(validationContext.ObjectInstance)?.ToString();
            var confirmPasswordValue = value?.ToString();

            if (passwordValue != confirmPasswordValue)
            {
                return new ValidationResult("Passwords do not match.");
            }

            return ValidationResult.Success;
        }
    }
}