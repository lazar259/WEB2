using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class QuizAttempt
    {
        public int Id { get; set; }

        [Required]
        public int QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;

        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public int Score { get; set; } = 0;
        public int MaxScore { get; set; }
        public double Percentage { get; set; } = 0.0;

        public bool IsCompleted { get; set; } = false;
        public int TimeSpentInSeconds { get; set; } = 0;

        public ICollection<QuizAnswer> Answers { get; set; } = new List<QuizAnswer>();
    }
}