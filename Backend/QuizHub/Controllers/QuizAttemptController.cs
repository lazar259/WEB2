using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizHub.DTOs;
using QuizHub.Services.Interfaces;
using System.Security.Claims;

namespace QuizHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuizAttemptController : ControllerBase
    {
        private readonly IQuizAttemptService _quizAttemptService;

        public QuizAttemptController(IQuizAttemptService quizAttemptService)
        {
            _quizAttemptService = quizAttemptService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        [HttpPost("start")]
        public async Task<ActionResult<QuizSessionResponse>> StartQuiz([FromBody] StartQuizRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _quizAttemptService.StartQuizAsync(request, userId);
                return Ok(session);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{attemptId}/answer")]
        public async Task<ActionResult<QuizAttemptResponse>> SubmitAnswer(
            int attemptId,
            [FromBody] SubmitAnswerRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _quizAttemptService.SubmitAnswerAsync(attemptId, request, userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{attemptId}/complete")]
        public async Task<ActionResult<QuizAttemptResponse>> CompleteQuiz(int attemptId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _quizAttemptService.CompleteQuizAsync(attemptId, userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{attemptId}/session")]
        public async Task<ActionResult<QuizSessionResponse>> GetActiveSession(int attemptId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _quizAttemptService.GetActiveSessionAsync(attemptId, userId);

                if (session == null)
                    return NotFound("Active session not found");

                return Ok(session);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("my-attempts")]
        public async Task<ActionResult<IEnumerable<QuizAttemptResponse>>> GetMyAttempts()
        {
            try
            {
                var userId = GetCurrentUserId();
                var attempts = await _quizAttemptService.GetUserAttemptsAsync(userId);
                return Ok(attempts);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{attemptId}/results")]
        public async Task<ActionResult<QuizAttemptResponse>> GetAttemptResults(int attemptId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _quizAttemptService.GetAttemptResultsAsync(attemptId, userId);

                if (result == null)
                    return NotFound("Quiz attempt not found");

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("rankings")]
        public async Task<ActionResult<IEnumerable<RankingEntryResponse>>> GetGlobalRankings(
            [FromQuery] int? quizId = null,
            [FromQuery] string? timePeriod = "all")
        {
            try
            {
                var rankings = await _quizAttemptService.GetGlobalRankingsAsync(quizId, timePeriod);
                return Ok(rankings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{attemptId}")]
        public async Task<ActionResult> DeleteAttempt(int attemptId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _quizAttemptService.DeleteAttemptAsync(attemptId, userId);

                if (!success)
                    return NotFound("Quiz attempt not found or not authorized to delete");

                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("admin/all-attempts")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<QuizAttemptResponse>>> GetAllAttempts()
        {
            try
            {
                var attempts = await _quizAttemptService.GetAllAttemptsAsync();
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}