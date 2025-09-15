using QuizHub.Models;

namespace QuizHub.Database.Interfaces
{
    public interface IQuizAttemptRepository : IRepository<QuizAttempt>
    {
        Task<QuizAttempt?> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<QuizAttempt>> GetByUserIdAsync(int userId);
        Task<QuizAttempt?> GetActiveAttemptAsync(int userId, int quizId);
        Task<IEnumerable<QuizAttempt>> GetCompletedAttemptsAsync(int userId);
        Task<IEnumerable<QuizAttempt>> GetCompletedAttemptsAsync();
        Task<bool> HasUserAttemptedQuizAsync(int userId, int quizId);
    }
}