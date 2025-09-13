using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class QuestionOption
    {
        public int Id { get; set; }

        [Required]
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string OptionText { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Order must be greater than 0")]
        public int Order { get; set; }
    }
}