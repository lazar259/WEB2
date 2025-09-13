using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizHub.DTOs;
using QuizHub.Models;
using QuizHub.Services.Interfaces;
using System.Security.Claims;

namespace QuizHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }

        [HttpPost]
        public async Task<ActionResult<QuizResponse>> CreateQuiz([FromBody] CreateQuizRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var quiz = await _quizService.CreateQuizAsync(request, userId);
                return Ok(quiz);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuizSummaryResponse>>> GetAllQuizzes()
        {
            try
            {
                var quizzes = await _quizService.GetAllQuizzesAsync();
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<QuizSummaryResponse>>> GetActiveQuizzes()
        {
            try
            {
                var quizzes = await _quizService.GetActiveQuizzesAsync();
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<QuizSummaryResponse>>> GetQuizzesByFilters(
            [FromQuery] DifficultyLevel? difficulty = null,
            [FromQuery] string? topic = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var quizzes = await _quizService.GetQuizzesByFiltersAsync(difficulty, topic, isActive);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("my-quizzes")]
        public async Task<ActionResult<IEnumerable<QuizSummaryResponse>>> GetMyQuizzes()
        {
            try
            {
                var userId = GetCurrentUserId();
                var quizzes = await _quizService.GetQuizzesByCreatorAsync(userId);
                return Ok(quizzes);
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

        [HttpGet("{id}")]
        public async Task<ActionResult<QuizResponse>> GetQuizById(int id)
        {
            try
            {
                var quiz = await _quizService.GetQuizByIdAsync(id);
                if (quiz == null)
                {
                    return NotFound("Quiz not found");
                }
                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<QuizResponse>> UpdateQuiz(int id, [FromBody] UpdateQuizRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var quiz = await _quizService.UpdateQuizAsync(id, request, userId);
                
                if (quiz == null)
                {
                    return NotFound("Quiz not found");
                }

                return Ok(quiz);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteQuiz(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _quizService.DeleteQuizAsync(id, userId);
                
                if (!result)
                {
                    return NotFound("Quiz not found");
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/toggle-status")]
        public async Task<ActionResult> ToggleQuizStatus(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _quizService.ToggleQuizStatusAsync(id, userId);
                
                if (!result)
                {
                    return NotFound("Quiz not found");
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}