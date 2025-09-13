using System.ComponentModel.DataAnnotations;
using QuizHub.Models;

namespace QuizHub.DTOs
{
    public class CreateQuizRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string Topic { get; set; } = string.Empty;

        [Required]
        public DifficultyLevel Difficulty { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Time limit must be greater than 0")]
        public int TimeLimitInMinutes { get; set; }

        public List<CreateQuestionRequest> Questions { get; set; } = new List<CreateQuestionRequest>();
    }

    public class CreateQuestionRequest
    {
        [Required]
        [MaxLength(1000)]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        public QuestionType Type { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Points must be greater than 0")]
        public int Points { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Order must be greater than 0")]
        public int Order { get; set; }

        public string? Explanation { get; set; }

        // For Fill-in-the-blank questions
        public string? CorrectAnswer { get; set; }

        // For multiple choice questions
        public List<CreateQuestionOptionRequest> Options { get; set; } = new List<CreateQuestionOptionRequest>();
    }

    public class CreateQuestionOptionRequest
    {
        [Required]
        [MaxLength(500)]
        public string OptionText { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Order must be greater than 0")]
        public int Order { get; set; }
    }
}