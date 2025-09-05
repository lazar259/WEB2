using QuizHub.Models;

namespace QuizHub.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}