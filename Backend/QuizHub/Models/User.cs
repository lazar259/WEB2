using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public enum UserType
    {
        Student,
        Admin
    }

    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        public UserType UserType { get; set; } = UserType.Student;

        public string? ProfilePicture { get; set; }
    }
}