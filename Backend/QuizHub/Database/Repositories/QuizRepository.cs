using Microsoft.EntityFrameworkCore;
using QuizHub.Data;
using QuizHub.Database.Interfaces;
using QuizHub.Models;

namespace QuizHub.Database.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        public QuizRepository(QuizHubContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Quiz>> GetAllWithDetailsAsync()
        {
            return await _context.Quizzes
                .Include(q => q.CreatedByUser)
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<Quiz?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Quizzes
                .Include(q => q.CreatedByUser)
                .Include(q => q.Questions.OrderBy(qu => qu.Order))
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.Order))
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<IEnumerable<Quiz>> GetByCreatorAsync(int createdByUserId)
        {
            return await _context.Quizzes
                .Include(q => q.CreatedByUser)
                .Where(q => q.CreatedByUserId == createdByUserId)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Quiz>> GetActiveQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.CreatedByUser)
                .Where(q => q.IsActive)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByFiltersAsync(DifficultyLevel? difficulty = null, string? topic = null, bool? isActive = null)
        {
            var query = _context.Quizzes
                .Include(q => q.CreatedByUser)
                .Include(q => q.Questions)
                .AsQueryable();

            if (difficulty.HasValue)
            {
                query = query.Where(q => q.Difficulty == difficulty.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(q => q.IsActive == isActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(topic))
            {
                query = query.Where(q => q.Topic.ToLower().Contains(topic.ToLower()));
            }

            return await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
        }

        public new async Task<bool> ExistsAsync(int id)
        {
            return await _context.Quizzes.AnyAsync(q => q.Id == id);
        }
    }
}