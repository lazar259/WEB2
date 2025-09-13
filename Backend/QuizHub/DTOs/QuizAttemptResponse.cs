namespace QuizHub.DTOs
{
    public class QuizAttemptResponse
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public double Percentage { get; set; }
        public bool IsCompleted { get; set; }
        public int TimeSpentInSeconds { get; set; }
        public List<QuizAnswerResponse> Answers { get; set; } = new();
    }

    public class QuizAnswerResponse
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string? UserAnswer { get; set; }
        public List<int> SelectedOptionIds { get; set; } = new();
        public bool IsCorrect { get; set; }
        public int PointsEarned { get; set; }
        public DateTime AnsweredAt { get; set; }
    }

    public class QuizSessionResponse
    {
        public int AttemptId { get; set; }
        public QuizResponse Quiz { get; set; } = null!;
        public DateTime StartedAt { get; set; }
        public int TimeRemainingInSeconds { get; set; }
        public List<QuizAnswerResponse> CurrentAnswers { get; set; } = new();
    }
}