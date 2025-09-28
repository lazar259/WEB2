using AutoMapper;
using QuizHub.DTOs;
using QuizHub.Models;

namespace QuizHub.Mapping
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            // User mappings
            CreateMap<User, UserInfo>();

            CreateMap<RegisterRequest, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Password, opt => opt.Ignore()); // Handled separately for hashing
        }
    }
}