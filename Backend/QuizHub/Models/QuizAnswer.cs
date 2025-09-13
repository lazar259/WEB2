using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class QuizAnswer
    {
        public int Id { get; set; }

        [Required]
        public int QuizAttemptId { get; set; }
        public QuizAttempt QuizAttempt { get; set; } = null!;

        [Required]
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

        [MaxLength(2000)]
        public string? UserAnswer { get; set; }

        public ICollection<int> SelectedOptionIds { get; set; } = new List<int>();

        public bool IsCorrect { get; set; } = false;
        public int PointsEarned { get; set; } = 0;

        public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    }
}