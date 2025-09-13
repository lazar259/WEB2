using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public enum QuestionType
    {
        SingleChoice,
        MultipleChoice,
        TrueFalse,
        FillInTheBlank
    }

    public class Question
    {
        public int Id { get; set; }

        [Required]
        public int QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;

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

        // For Fill-in-the-blank questions - stores the correct answer(s)
        public string? CorrectAnswer { get; set; }

        // Navigation properties
        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    }
}