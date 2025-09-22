using System.ComponentModel.DataAnnotations;

namespace QuizHub.DTOs
{
    public class StartQuizRequest
    {
        [Required]
        public int QuizId { get; set; }

        public bool Restart { get; set; } = false;

        /// <summary>
        /// If true, only checks for existing attempts without creating a new one
        /// </summary>
        public bool CheckOnly { get; set; } = false;
    }
}