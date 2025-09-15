using Microsoft.EntityFrameworkCore;
using QuizHub.Data;
using QuizHub.Database.Interfaces;
using QuizHub.Models;

namespace QuizHub.Database.Repositories
{
    public class QuizAttemptRepository : Repository<QuizAttempt>, IQuizAttemptRepository
    {
        public QuizAttemptRepository(QuizHubContext context) : base(context)
        {
        }

        public async Task<QuizAttempt?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Questions)
                        .ThenInclude(qu => qu.Options)
                .Include(qa => qa.User)
                .Include(qa => qa.Answers)
                    .ThenInclude(a => a.Question)
                .FirstOrDefaultAsync(qa => qa.Id == id);
        }

        public async Task<IEnumerable<QuizAttempt>> GetByUserIdAsync(int userId)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Include(qa => qa.Answers)
                .Where(qa => qa.UserId == userId)
                .OrderByDescending(qa => qa.StartedAt)
                .ToListAsync();
        }

        public async Task<QuizAttempt?> GetActiveAttemptAsync(int userId, int quizId)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Questions)
                        .ThenInclude(qu => qu.Options)
                .Include(qa => qa.Answers)
                    .ThenInclude(a => a.Question)
                .FirstOrDefaultAsync(qa => qa.UserId == userId &&
                                          qa.QuizId == quizId &&
                                          !qa.IsCompleted);
        }

        public async Task<IEnumerable<QuizAttempt>> GetCompletedAttemptsAsync(int userId)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Where(qa => qa.UserId == userId && qa.IsCompleted)
                .OrderByDescending(qa => qa.CompletedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<QuizAttempt>> GetCompletedAttemptsAsync()
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Include(qa => qa.User)
                .Where(qa => qa.IsCompleted)
                .OrderByDescending(qa => qa.CompletedAt)
                .ToListAsync();
        }

        public async Task<bool> HasUserAttemptedQuizAsync(int userId, int quizId)
        {
            return await _context.QuizAttempts
                .AnyAsync(qa => qa.UserId == userId && qa.QuizId == quizId);
        }

        public override async Task<IEnumerable<QuizAttempt>> GetAllAsync()
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Include(qa => qa.User)
                .Include(qa => qa.Answers)
                    .ThenInclude(a => a.Question)
                .ToListAsync();
        }
    }
}