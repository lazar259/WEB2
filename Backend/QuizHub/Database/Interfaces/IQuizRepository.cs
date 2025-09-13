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
        new Task<bool> ExistsAsync(int id);
    }
}