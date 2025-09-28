using AutoMapper;
using QuizHub.Database.Interfaces;
using QuizHub.Models;
using QuizHub.Services.Interfaces;
using QuizHub.DTOs;
using BCrypt.Net;

namespace QuizHub.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<User> RegisterAsync(RegisterRequest request)
        {
            // Validate unique constraints
            if (await _userRepository.UsernameExistsAsync(request.Username))
            {
                throw new InvalidOperationException($"Username '{request.Username}' already exists.");
            }

            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException($"Email '{request.Email}' already exists.");
            }

            // Hash password using BCrypt
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user using AutoMapper
            var user = _mapper.Map<User>(request);
            user.Password = hashedPassword;

            return await _userRepository.AddAsync(user);
        }

        public async Task<User?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            
            if (user == null)
            {
                return null;
            }

            // Verify password using BCrypt
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return null;
            }

            return user;
        }
    }
}