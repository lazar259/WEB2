using QuizHub.Database.Interfaces;
using QuizHub.DTOs;
using QuizHub.Models;
using QuizHub.Services.Interfaces;

namespace QuizHub.Services
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository _quizRepository;
        private readonly IUserRepository _userRepository;

        public QuizService(IQuizRepository quizRepository, IUserRepository userRepository)
        {
            _quizRepository = quizRepository;
            _userRepository = userRepository;
        }

        public async Task<QuizResponse> CreateQuizAsync(CreateQuizRequest request, int createdByUserId)
        {
            // Verify user exists and is admin
            var user = await _userRepository.GetByIdAsync(createdByUserId);
            if (user == null)
                throw new UnauthorizedAccessException("User not found");
            
            if (user.UserType != UserType.Admin)
                throw new UnauthorizedAccessException("Only admins can create quizzes");

            // Calculate total points
            var totalPoints = request.Questions.Sum(q => q.Points);

            var quiz = new Quiz
            {
                Title = request.Title,
                Description = request.Description,
                Topic = request.Topic,
                CreatedByUserId = createdByUserId,
                Difficulty = request.Difficulty,
                TimeLimitInMinutes = request.TimeLimitInMinutes,
                TotalPoints = totalPoints,
                Questions = request.Questions.Select(q => new Question
                {
                    QuestionText = q.QuestionText,
                    Type = q.Type,
                    Points = q.Points,
                    Order = q.Order,
                    Explanation = q.Explanation,
                    CorrectAnswer = q.CorrectAnswer,
                    Options = q.Options.Select(o => new QuestionOption
                    {
                        OptionText = o.OptionText,
                        IsCorrect = o.IsCorrect,
                        Order = o.Order
                    }).ToList()
                }).ToList()
            };

            await _quizRepository.AddAsync(quiz);

            var createdQuiz = await _quizRepository.GetByIdWithDetailsAsync(quiz.Id);
            return MapToQuizResponse(createdQuiz!);
        }

        public async Task<QuizResponse?> GetQuizByIdAsync(int id)
        {
            var quiz = await _quizRepository.GetByIdWithDetailsAsync(id);
            return quiz != null ? MapToQuizResponse(quiz) : null;
        }

        public async Task<IEnumerable<QuizSummaryResponse>> GetAllQuizzesAsync()
        {
            var quizzes = await _quizRepository.GetAllWithDetailsAsync();
            return quizzes.Select(MapToQuizSummaryResponse);
        }

        public async Task<IEnumerable<QuizSummaryResponse>> GetQuizzesByCreatorAsync(int createdByUserId)
        {
            var quizzes = await _quizRepository.GetByCreatorAsync(createdByUserId);
            return quizzes.Select(MapToQuizSummaryResponse);
        }

        public async Task<IEnumerable<QuizSummaryResponse>> GetActiveQuizzesAsync()
        {
            var quizzes = await _quizRepository.GetActiveQuizzesAsync();
            return quizzes.Select(MapToQuizSummaryResponse);
        }

        public async Task<IEnumerable<QuizSummaryResponse>> GetQuizzesByFiltersAsync(DifficultyLevel? difficulty = null, string? topic = null, bool? isActive = null)
        {
            var quizzes = await _quizRepository.GetQuizzesByFiltersAsync(difficulty, topic, isActive);
            return quizzes.Select(MapToQuizSummaryResponse);
        }

        public async Task<QuizResponse?> UpdateQuizAsync(int id, UpdateQuizRequest request, int updatedByUserId)
        {
            var quiz = await _quizRepository.GetByIdWithDetailsAsync(id);
            if (quiz == null)
                return null;

            // Verify user can update this quiz
            var user = await _userRepository.GetByIdAsync(updatedByUserId);
            if (user == null)
                throw new UnauthorizedAccessException("User not found");

            if (user.UserType != UserType.Admin || quiz.CreatedByUserId != updatedByUserId)
                throw new UnauthorizedAccessException("Only the quiz creator can update this quiz");

            // Update quiz properties
            quiz.Title = request.Title;
            quiz.Description = request.Description;
            quiz.Topic = request.Topic;
            quiz.Difficulty = request.Difficulty;
            quiz.TimeLimitInMinutes = request.TimeLimitInMinutes;
            quiz.IsActive = request.IsActive;
            quiz.UpdatedAt = DateTime.UtcNow;

            // Calculate new total points
            quiz.TotalPoints = request.Questions.Sum(q => q.Points);

            // Remove all existing questions first to avoid tracking issues
            var existingQuestions = quiz.Questions.ToList();
            foreach (var existingQuestion in existingQuestions)
            {
                quiz.Questions.Remove(existingQuestion);
            }

            // Add new questions
            foreach (var requestQuestion in request.Questions)
            {
                var newQuestion = new Question
                {
                    QuestionText = requestQuestion.QuestionText,
                    Type = requestQuestion.Type,
                    Points = requestQuestion.Points,
                    Order = requestQuestion.Order,
                    Explanation = requestQuestion.Explanation,
                    CorrectAnswer = requestQuestion.CorrectAnswer,
                    QuizId = quiz.Id,
                    Options = requestQuestion.Options.Select(o => new QuestionOption
                    {
                        OptionText = o.OptionText,
                        IsCorrect = o.IsCorrect,
                        Order = o.Order
                    }).ToList()
                };
                quiz.Questions.Add(newQuestion);
            }

            await _quizRepository.UpdateAsync(quiz);

            var updatedQuiz = await _quizRepository.GetByIdWithDetailsAsync(id);
            return MapToQuizResponse(updatedQuiz!);
        }

        public async Task<bool> DeleteQuizAsync(int id, int deletedByUserId)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz == null)
                return false;

            // Verify user can delete this quiz
            var user = await _userRepository.GetByIdAsync(deletedByUserId);
            if (user == null)
                throw new UnauthorizedAccessException("User not found");

            if (user.UserType != UserType.Admin || quiz.CreatedByUserId != deletedByUserId)
                throw new UnauthorizedAccessException("Only the quiz creator can delete this quiz");

            await _quizRepository.DeleteAsync(quiz.Id);
            return true;
        }

        public async Task<bool> ToggleQuizStatusAsync(int id, int updatedByUserId)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz == null)
                return false;

            // Verify user can update this quiz
            var user = await _userRepository.GetByIdAsync(updatedByUserId);
            if (user == null)
                throw new UnauthorizedAccessException("User not found");

            if (user.UserType != UserType.Admin || quiz.CreatedByUserId != updatedByUserId)
                throw new UnauthorizedAccessException("Only the quiz creator can update this quiz");

            quiz.IsActive = !quiz.IsActive;
            quiz.UpdatedAt = DateTime.UtcNow;

            await _quizRepository.UpdateAsync(quiz);
            return true;
        }

        private static QuizResponse MapToQuizResponse(Quiz quiz)
        {
            return new QuizResponse
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Topic = quiz.Topic,
                Difficulty = quiz.Difficulty,
                TimeLimitInMinutes = quiz.TimeLimitInMinutes,
                TotalPoints = quiz.TotalPoints,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt,
                IsActive = quiz.IsActive,
                CreatedByUser = new UserInfo
                {
                    Id = quiz.CreatedByUser.Id,
                    Username = quiz.CreatedByUser.Username,
                    Email = quiz.CreatedByUser.Email,
                    UserType = quiz.CreatedByUser.UserType,
                    ProfilePicture = quiz.CreatedByUser.ProfilePicture
                },
                Questions = quiz.Questions.Select(q => new QuestionResponse
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    Type = q.Type,
                    Points = q.Points,
                    Order = q.Order,
                    Explanation = q.Explanation,
                    CorrectAnswer = q.CorrectAnswer,
                    Options = q.Options.Select(o => new QuestionOptionResponse
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        IsCorrect = o.IsCorrect,
                        Order = o.Order
                    }).ToList()
                }).ToList()
            };
        }

        private static QuizSummaryResponse MapToQuizSummaryResponse(Quiz quiz)
        {
            return new QuizSummaryResponse
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Topic = quiz.Topic,
                Difficulty = quiz.Difficulty,
                TimeLimitInMinutes = quiz.TimeLimitInMinutes,
                TotalPoints = quiz.TotalPoints,
                QuestionCount = quiz.Questions.Count,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt,
                IsActive = quiz.IsActive,
                CreatedByUser = new UserInfo
                {
                    Id = quiz.CreatedByUser.Id,
                    Username = quiz.CreatedByUser.Username,
                    Email = quiz.CreatedByUser.Email,
                    UserType = quiz.CreatedByUser.UserType,
                    ProfilePicture = quiz.CreatedByUser.ProfilePicture
                }
            };
        }
    }
}