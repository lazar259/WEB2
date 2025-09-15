using System.ComponentModel.DataAnnotations;

namespace QuizHub.DTOs
{
    public class StartQuizRequest
    {
        [Required]
        public int QuizId { get; set; }

        public bool Restart { get; set; } = false;
    }
}