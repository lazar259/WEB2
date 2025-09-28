using AutoMapper;
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
        private readonly IMapper _mapper;

        public QuizAttemptService(
            IQuizAttemptRepository attemptRepository,
            IQuizRepository quizRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _attemptRepository = attemptRepository;
            _quizRepository = quizRepository;
            _userRepository = userRepository;
            _mapper = mapper;
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
                        return CreateQuizSessionResponse(existingAttempt);
                    }
                }
            }

            // If this is a check-only request and no active attempt exists, return null/error
            if (request.CheckOnly)
            {
                throw new ArgumentException("No active attempt found");
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
            return CreateQuizSessionResponse(createdAttempt!);
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
                EvaluateAnswer(existingAnswer, question);
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

                EvaluateAnswer(answer, question);
                attempt.Answers.Add(answer);
            }

            await _attemptRepository.UpdateAsync(attempt);
            return _mapper.Map<QuizAttemptResponse>(attempt);
        }

        public async Task<QuizAttemptResponse> CompleteQuizAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null)
                throw new ArgumentException("Quiz attempt not found");

            if (attempt.UserId != userId)
                throw new UnauthorizedAccessException("Not authorized to complete this attempt");

            if (attempt.IsCompleted)
                return _mapper.Map<QuizAttemptResponse>(attempt);

            // Calculate final score and completion
            attempt.IsCompleted = true;
            attempt.CompletedAt = DateTime.UtcNow;
            attempt.TimeSpentInSeconds = (int)(attempt.CompletedAt.Value - attempt.StartedAt).TotalSeconds;
            attempt.Score = attempt.Answers.Sum(a => a.PointsEarned);
            attempt.Percentage = attempt.MaxScore > 0 ? (double)attempt.Score / attempt.MaxScore * 100 : 0;

            await _attemptRepository.UpdateAsync(attempt);
            return _mapper.Map<QuizAttemptResponse>(attempt);
        }

        public async Task<QuizSessionResponse?> GetActiveSessionAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null || attempt.UserId != userId)
                return null;

            if (attempt.IsCompleted)
                return null;

            return CreateQuizSessionResponse(attempt);
        }

        public async Task<IEnumerable<QuizAttemptResponse>> GetUserAttemptsAsync(int userId)
        {
            var attempts = await _attemptRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<QuizAttemptResponse>>(attempts);
        }

        public async Task<QuizAttemptResponse?> GetAttemptResultsAsync(int attemptId, int userId)
        {
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null || attempt.UserId != userId)
                return null;

            return _mapper.Map<QuizAttemptResponse>(attempt);
        }

        private void EvaluateAnswer(QuizAnswer answer, Question question)
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

        private QuizSessionResponse CreateQuizSessionResponse(QuizAttempt attempt)
        {
            var timeElapsed = (DateTime.UtcNow - attempt.StartedAt).TotalSeconds;
            var timeLimit = attempt.Quiz.TimeLimitInMinutes * 60;
            var timeRemaining = Math.Max(0, timeLimit - timeElapsed);

            var response = _mapper.Map<QuizSessionResponse>(attempt);
            response.TimeRemainingInSeconds = (int)timeRemaining;

            return response;
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
            var rankingEntries = _mapper.Map<IEnumerable<RankingEntryResponse>>(attempts);
            var rankings = rankingEntries
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
            var completedAttempts = attempts.Where(a => a.IsCompleted);
            return _mapper.Map<IEnumerable<QuizAttemptResponse>>(completedAttempts);
        }

        public async Task<QuizAttemptResponse?> GetAttemptResultsByIdAsync(int attemptId)
        {
            // Admin method - no user ownership check
            var attempt = await _attemptRepository.GetByIdWithDetailsAsync(attemptId);
            if (attempt == null)
                return null;

            return _mapper.Map<QuizAttemptResponse>(attempt);
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