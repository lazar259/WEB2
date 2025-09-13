using System.ComponentModel.DataAnnotations;

namespace QuizHub.DTOs
{
    public class SubmitAnswerRequest
    {
        [Required]
        public int QuestionId { get; set; }

        public string? UserAnswer { get; set; }

        public List<int> SelectedOptionIds { get; set; } = new();
    }
}