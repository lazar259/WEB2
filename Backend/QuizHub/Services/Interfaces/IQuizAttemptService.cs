using QuizHub.DTOs;

namespace QuizHub.Services.Interfaces
{
    public interface IQuizAttemptService
    {
        Task<QuizSessionResponse> StartQuizAsync(StartQuizRequest request, int userId);
        Task<QuizAttemptResponse> SubmitAnswerAsync(int attemptId, SubmitAnswerRequest request, int userId);
        Task<QuizAttemptResponse> CompleteQuizAsync(int attemptId, int userId);
        Task<QuizSessionResponse?> GetActiveSessionAsync(int attemptId, int userId);
        Task<IEnumerable<QuizAttemptResponse>> GetUserAttemptsAsync(int userId);
        Task<QuizAttemptResponse?> GetAttemptResultsAsync(int attemptId, int userId);
        Task<QuizAttemptResponse?> GetAttemptResultsByIdAsync(int attemptId);
        Task<IEnumerable<RankingEntryResponse>> GetGlobalRankingsAsync(int? quizId, string? timePeriod);
        Task<bool> DeleteAttemptAsync(int attemptId, int userId);
        Task<IEnumerable<QuizAttemptResponse>> GetAllAttemptsAsync();
    }
}