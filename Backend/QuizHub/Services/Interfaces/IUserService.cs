using QuizHub.Models;
using QuizHub.DTOs;

namespace QuizHub.Services.Interfaces
{
    public interface IUserService
    {
        Task<User> RegisterAsync(RegisterRequest request);
        Task<User?> LoginAsync(LoginRequest request);
    }
}