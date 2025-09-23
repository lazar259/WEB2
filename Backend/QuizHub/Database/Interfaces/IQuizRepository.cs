using QuizHub.DTOs;
using QuizHub.Models;

namespace QuizHub.Database.Interfaces
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        Task<IEnumerable<Quiz>> GetAllWithDetailsAsync();
        Task<Quiz?> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<Quiz>> GetByCreatorAsync(int createdByUserId);
        Task<IEnumerable<Quiz>> GetActiveQuizzesAsync();
        Task<IEnumerable<Quiz>> GetQuizzesByFiltersAsync(DifficultyLevel? difficulty = null, string? topic = null, bool? isActive = null);
        Task UpdateQuizWithQuestionsAsync(Quiz quiz, IEnumerable<UpdateQuestionRequest> questions);
        Task<bool> HasAttemptsAsync(int quizId);
        new Task<bool> ExistsAsync(int id);
    }
}