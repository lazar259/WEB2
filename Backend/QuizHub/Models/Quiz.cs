using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public enum DifficultyLevel
    {
        Easy,
        Medium,
        Hard
    }

    public class Quiz
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string Topic { get; set; } = string.Empty;

        [Required]
        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;

        [Required]
        public DifficultyLevel Difficulty { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Time limit must be greater than 0")]
        public int TimeLimitInMinutes { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Total points must be non-negative")]
        public int TotalPoints { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    }
}