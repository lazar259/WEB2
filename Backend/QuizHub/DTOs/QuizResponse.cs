using QuizHub.Models;

namespace QuizHub.DTOs
{
    public class QuizResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Topic { get; set; } = string.Empty;
        public DifficultyLevel Difficulty { get; set; }
        public int TimeLimitInMinutes { get; set; }
        public int TotalPoints { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public UserInfo CreatedByUser { get; set; } = null!;
        public List<QuestionResponse> Questions { get; set; } = new List<QuestionResponse>();
    }

    public class QuestionResponse
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int Order { get; set; }
        public string? Explanation { get; set; }
        public string? CorrectAnswer { get; set; }
        public List<QuestionOptionResponse> Options { get; set; } = new List<QuestionOptionResponse>();
    }

    public class QuestionOptionResponse
    {
        public int Id { get; set; }
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    public class QuizSummaryResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Topic { get; set; } = string.Empty;
        public DifficultyLevel Difficulty { get; set; }
        public int TimeLimitInMinutes { get; set; }
        public int TotalPoints { get; set; }
        public int QuestionCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public UserInfo CreatedByUser { get; set; } = null!;
    }
}