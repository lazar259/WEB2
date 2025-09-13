using QuizHub.DTOs;
using QuizHub.Models;

namespace QuizHub.Services.Interfaces
{
    public interface IQuizService
    {
        Task<QuizResponse> CreateQuizAsync(CreateQuizRequest request, int createdByUserId);
        Task<QuizResponse?> GetQuizByIdAsync(int id);
        Task<IEnumerable<QuizSummaryResponse>> GetAllQuizzesAsync();
        Task<IEnumerable<QuizSummaryResponse>> GetQuizzesByCreatorAsync(int createdByUserId);
        Task<IEnumerable<QuizSummaryResponse>> GetActiveQuizzesAsync();
        Task<IEnumerable<QuizSummaryResponse>> GetQuizzesByFiltersAsync(DifficultyLevel? difficulty = null, string? topic = null, bool? isActive = null);
        Task<QuizResponse?> UpdateQuizAsync(int id, UpdateQuizRequest request, int updatedByUserId);
        Task<bool> DeleteQuizAsync(int id, int deletedByUserId);
        Task<bool> ToggleQuizStatusAsync(int id, int updatedByUserId);
    }
}