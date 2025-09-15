using QuizHub.Database.Interfaces;
using QuizHub.DTOs;
using QuizHub.Models;
using QuizHub.Services.Interfaces;

namespace QuizHub.Services
{
    public class QuizAttemptService : IQuizAttemptService
    {
        private readonly IQuizAttemptRepository _attemptRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IUserRepository _userRepository;

        public QuizAttemptService(
            IQuizAttemptRepository attemptRepository,
            IQuizRepository quizRepository,
            IUserRepository userRepository)
        {
            _attemptRepository = attemptRepository;
            _quizRepository = quizRepository;
            _userRepository = userRepository;
        }

        public async Task<QuizSessionResponse> StartQuizAsync(StartQuizRequest request, int userId)
        {
            // Check if user exists
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new UnauthorizedAccessException("User not found");

            // Get quiz with details
            var quiz = await _quizRepository.GetByIdWithDetailsAsync(request.QuizId);
            if (quiz == null)
                throw new ArgumentException("Quiz not found");

            if (!quiz.IsActive)
                throw new ArgumentException("Quiz is not active");

            // Check if user already has an active attempt
            var existingAttempt = await _attemptRepository.GetActiveAttemptAsync(userId, request.QuizId);
            if (existingAttempt != null)
            {
                if (request.Restart)
                {
                    // User wants to restart - mark the existing attempt as abandoned
                    existingAttempt.IsCompleted = true;
                    existingAttempt.CompletedAt = DateTime.UtcNow;
                    var timeElapsed = (DateTime.UtcNow - existingAttempt.StartedAt).TotalSeconds;
                    existingAttempt.TimeSpentInSeconds = (int)timeElapsed;
                    await _attemptRepository.UpdateAsync(existingAttempt);
                }
                else
                {
                    // Check if the existing attempt has timed out
                    var timeElapsed = (DateTime.UtcNow - existingAttempt.StartedAt).TotalMinutes;
                    if (timeElapsed >= quiz.TimeLimitInMinutes)
                    {
                        // Time limit exceeded, complete the old attempt
                        existingAttempt.IsCompleted = true;
                        existingAttempt.CompletedAt = DateTime.UtcNow;
                        existingAttempt.TimeSpentInSeconds = (int)timeElapsed * 60;
                        await _attemptRepository.UpdateAsync(existingAttempt);
                    }
                    else
                    {
                        // Return the existing active attempt
                        return MapToQuizSessionResponse(existingAttempt);
                    }
                }
            }

            // Create new attempt
            var attempt = new QuizAttempt
            {
                QuizId = request.QuizId,
                UserId = userId,
                MaxScore = quiz.TotalPoints,
                StartedAt = DateTime.UtcNow
            };

            await _attemptRepository.AddAsync(attempt);

            // Get the created attempt with details
            var createdAttempt = await _attemptRepository.GetByIdWithDetailsAsync(attempt.Id);
            return MapToQuizSessionResponse(createdAttempt!);
        }

        public async Task<QuizAttemptResponse> SubmitAnswerAsync(int attemptId, SubmitAnswerRequest request, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null)
                throw new ArgumentException("Quiz attempt not found");

            if (attempt.UserId != userId)
                throw new UnauthorizedAccessException("Not authorized to submit answers for this attempt");

            if (attempt.IsCompleted)
                throw new InvalidOperationException("Quiz attempt is already completed");

            // Check if time limit exceeded
            var timeElapsed = (DateTime.UtcNow - attempt.StartedAt).TotalMinutes;
            if (timeElapsed > attempt.Quiz.TimeLimitInMinutes)
            {
                await CompleteQuizAsync(attemptId, userId);
                throw new InvalidOperationException("Time limit exceeded");
            }

            // Find the question
            var question = attempt.Quiz.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
            if (question == null)
                throw new ArgumentException("Question not found in this quiz");

            // Check if answer already exists
            var existingAnswer = attempt.Answers.FirstOrDefault(a => a.QuestionId == request.QuestionId);
            if (existingAnswer != null)
            {
                // Update existing answer
                existingAnswer.UserAnswer = request.UserAnswer;
                existingAnswer.SelectedOptionIds = request.SelectedOptionIds;
                existingAnswer.AnsweredAt = DateTime.UtcNow;
                await EvaluateAnswer(existingAnswer, question);
            }
            else
            {
                // Create new answer
                var answer = new QuizAnswer
                {
                    QuizAttemptId = attemptId,
                    QuestionId = request.QuestionId,
                    UserAnswer = request.UserAnswer,
                    SelectedOptionIds = request.SelectedOptionIds,
                    AnsweredAt = DateTime.UtcNow
                };

                await EvaluateAnswer(answer, question);
                attempt.Answers.Add(answer);
            }

            await _attemptRepository.UpdateAsync(attempt);
            return MapToQuizAttemptResponse(attempt);
        }

        public async Task<QuizAttemptResponse> CompleteQuizAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null)
                throw new ArgumentException("Quiz attempt not found");

            if (attempt.UserId != userId)
                throw new UnauthorizedAccessException("Not authorized to complete this attempt");

            if (attempt.IsCompleted)
                return MapToQuizAttemptResponse(attempt);

            // Calculate final score and completion
            attempt.IsCompleted = true;
            attempt.CompletedAt = DateTime.UtcNow;
            attempt.TimeSpentInSeconds = (int)(attempt.CompletedAt.Value - attempt.StartedAt).TotalSeconds;
            attempt.Score = attempt.Answers.Sum(a => a.PointsEarned);
            attempt.Percentage = attempt.MaxScore > 0 ? (double)attempt.Score / attempt.MaxScore * 100 : 0;

            await _attemptRepository.UpdateAsync(attempt);
            return MapToQuizAttemptResponse(attempt);
        }

        public async Task<QuizSessionResponse?> GetActiveSessionAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null || attempt.UserId != userId)
                return null;

            if (attempt.IsCompleted)
                return null;

            return MapToQuizSessionResponse(attempt);
        }

        public async Task<IEnumerable<QuizAttemptResponse>> GetUserAttemptsAsync(int userId)
        {
            var attempts = await _attemptRepository.GetByUserIdAsync(userId);
            return attempts.Select(MapToQuizAttemptResponse);
        }

        public async Task<QuizAttemptResponse?> GetAttemptResultsAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null || attempt.UserId != userId)
                return null;

            return MapToQuizAttemptResponse(attempt);
        }

        private async Task EvaluateAnswer(QuizAnswer answer, Question question)
        {
            bool isCorrect = false;

            switch (question.Type)
            {
                case QuestionType.SingleChoice:
                    if (answer.SelectedOptionIds.Count == 1)
                    {
                        var selectedOption = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionIds.First());
                        isCorrect = selectedOption?.IsCorrect == true;
                    }
                    break;

                case QuestionType.MultipleChoice:
                    var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).OrderBy(x => x).ToList();
                    var selectedOptionIds = answer.SelectedOptionIds.OrderBy(x => x).ToList();
                    isCorrect = correctOptionIds.SequenceEqual(selectedOptionIds);
                    break;

                case QuestionType.TrueFalse:
                    if (answer.SelectedOptionIds.Count == 1)
                    {
                        var selectedOption = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionIds.First());
                        isCorrect = selectedOption?.IsCorrect == true;
                    }
                    break;

                case QuestionType.FillInTheBlank:
                    isCorrect = string.Equals(answer.UserAnswer?.Trim(), question.CorrectAnswer?.Trim(), StringComparison.OrdinalIgnoreCase);
                    break;
            }

            answer.IsCorrect = isCorrect;
            answer.PointsEarned = isCorrect ? question.Points : 0;
        }

        private static QuizSessionResponse MapToQuizSessionResponse(QuizAttempt attempt)
        {
            var timeElapsed = (DateTime.UtcNow - attempt.StartedAt).TotalSeconds;
            var timeLimit = attempt.Quiz.TimeLimitInMinutes * 60;
            var timeRemaining = Math.Max(0, timeLimit - timeElapsed);

            return new QuizSessionResponse
            {
                AttemptId = attempt.Id,
                Quiz = MapToQuizResponse(attempt.Quiz),
                StartedAt = attempt.StartedAt,
                TimeRemainingInSeconds = (int)timeRemaining,
                CurrentAnswers = attempt.Answers.Select(a => new QuizAnswerResponse
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question?.QuestionText ?? "",
                    UserAnswer = a.UserAnswer,
                    SelectedOptionIds = a.SelectedOptionIds.ToList(),
                    IsCorrect = a.IsCorrect,
                    PointsEarned = a.PointsEarned,
                    AnsweredAt = a.AnsweredAt
                }).ToList()
            };
        }

        private static QuizAttemptResponse MapToQuizAttemptResponse(QuizAttempt attempt)
        {
            return new QuizAttemptResponse
            {
                Id = attempt.Id,
                UserId = attempt.UserId,
                UserName = attempt.User?.Username ?? "Unknown User",
                QuizId = attempt.QuizId,
                QuizTitle = attempt.Quiz.Title,
                StartedAt = attempt.StartedAt,
                CompletedAt = attempt.CompletedAt,
                Score = attempt.Score,
                MaxScore = attempt.MaxScore,
                Percentage = attempt.Percentage,
                IsCompleted = attempt.IsCompleted,
                TimeSpentInSeconds = attempt.TimeSpentInSeconds,
                Answers = attempt.Answers.Select(a => new QuizAnswerResponse
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question?.QuestionText ?? "",
                    UserAnswer = a.UserAnswer,
                    SelectedOptionIds = a.SelectedOptionIds.ToList(),
                    IsCorrect = a.IsCorrect,
                    PointsEarned = a.PointsEarned,
                    AnsweredAt = a.AnsweredAt
                }).ToList()
            };
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

        public async Task<IEnumerable<RankingEntryResponse>> GetGlobalRankingsAsync(int? quizId, string? timePeriod)
        {
            // Get all completed quiz attempts
            var attempts = await _attemptRepository.GetCompletedAttemptsAsync();

            // Filter by quiz if specified
            if (quizId.HasValue)
            {
                attempts = attempts.Where(a => a.QuizId == quizId.Value);
            }

            // Filter by time period if specified
            if (!string.IsNullOrEmpty(timePeriod) && timePeriod != "all")
            {
                var cutoffDate = GetTimePeriodCutoff(timePeriod);
                if (cutoffDate.HasValue)
                {
                    attempts = attempts.Where(a => a.CompletedAt >= cutoffDate.Value);
                }
            }

            // Convert to ranking entries and sort
            var rankings = attempts.Select(a => new RankingEntryResponse
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User?.Username ?? "Unknown User",
                QuizId = a.QuizId,
                QuizTitle = a.Quiz?.Title ?? "Unknown Quiz",
                Score = a.Score,
                MaxScore = a.MaxScore,
                Percentage = a.MaxScore > 0 ? Math.Round((decimal)a.Score / a.MaxScore * 100, 1) : 0,
                TimeSpentInSeconds = a.TimeSpentInSeconds,
                CompletedAt = a.CompletedAt ?? DateTime.MinValue
            })
            .OrderByDescending(r => r.Score)
            .ThenBy(r => r.TimeSpentInSeconds)
            .ToList();

            return rankings;
        }

        public async Task<bool> DeleteAttemptAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null || attempt.UserId != userId)
                return false;

            // Only allow deletion of incomplete attempts
            if (attempt.IsCompleted)
                return false;

            await _attemptRepository.DeleteAsync(attemptId);
            return true;
        }

        public async Task<IEnumerable<QuizAttemptResponse>> GetAllAttemptsAsync()
        {
            var attempts = await _attemptRepository.GetAllAsync();
            return attempts
                .Where(a => a.IsCompleted) // Only return completed attempts
                .Select(MapToQuizAttemptResponse);
        }

        private DateTime? GetTimePeriodCutoff(string timePeriod)
        {
            var now = DateTime.UtcNow;
            return timePeriod?.ToLower() switch
            {
                "weekly" => now.AddDays(-7),
                "monthly" => now.AddMonths(-1),
                "yearly" => now.AddYears(-1),
                _ => null
            };
        }
    }
}