using AutoMapper;
using Microsoft.EntityFrameworkCore;
using QuizHub.Data;
using QuizHub.Database.Interfaces;
using QuizHub.DTOs;
using QuizHub.Models;

namespace QuizHub.Database.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        private readonly IMapper _mapper;

        public QuizRepository(QuizHubContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
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
                .Include(q => q.Questions)
                .Where(q => q.CreatedByUserId == createdByUserId)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Quiz>> GetActiveQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.CreatedByUser)
                .Include(q => q.Questions)
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

        public async Task UpdateQuizWithQuestionsAsync(Quiz quiz, IEnumerable<UpdateQuestionRequest> questionRequests)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // First, clear all existing questions and options for this quiz
                var existingQuestions = await _context.Questions
                    .Where(q => q.QuizId == quiz.Id)
                    .Include(q => q.Options)
                    .ToListAsync();

                foreach (var question in existingQuestions)
                {
                    _context.QuestionOptions.RemoveRange(question.Options);
                }
                _context.Questions.RemoveRange(existingQuestions);

                // Save the deletions first
                await _context.SaveChangesAsync();

                // Update the quiz properties - get fresh entity to avoid tracking issues
                var quizToUpdate = await _context.Quizzes.FindAsync(quiz.Id);
                if (quizToUpdate != null)
                {
                    quizToUpdate.Title = quiz.Title;
                    quizToUpdate.Description = quiz.Description;
                    quizToUpdate.Topic = quiz.Topic;
                    quizToUpdate.Difficulty = quiz.Difficulty;
                    quizToUpdate.TimeLimitInMinutes = quiz.TimeLimitInMinutes;
                    quizToUpdate.IsActive = quiz.IsActive;
                    quizToUpdate.TotalPoints = quiz.TotalPoints;
                    quizToUpdate.UpdatedAt = quiz.UpdatedAt;
                }

                // Add new questions
                foreach (var questionRequest in questionRequests)
                {
                    var newQuestion = _mapper.Map<Question>(questionRequest);
                    newQuestion.QuizId = quiz.Id;
                    _context.Questions.Add(newQuestion);
                }

                // Save all changes
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> HasAttemptsAsync(int quizId)
        {
            return await _context.QuizAttempts.AnyAsync(qa => qa.QuizId == quizId);
        }

        public new async Task<bool> ExistsAsync(int id)
        {
            return await _context.Quizzes.AnyAsync(q => q.Id == id);
        }
    }
}