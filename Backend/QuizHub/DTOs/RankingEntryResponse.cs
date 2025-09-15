namespace QuizHub.DTOs
{
    public class RankingEntryResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public decimal Percentage { get; set; }
        public int TimeSpentInSeconds { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}