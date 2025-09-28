using AutoMapper;
using QuizHub.DTOs;
using QuizHub.Models;

namespace QuizHub.Mapping
{
    public class QuizAttemptMappingProfile : Profile
    {
        public QuizAttemptMappingProfile()
        {
            // QuizAttempt mappings
            CreateMap<QuizAttempt, QuizAttemptResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Username))
                .ForMember(dest => dest.QuizTitle, opt => opt.MapFrom(src => src.Quiz.Title));


            // QuizAnswer mappings
            CreateMap<QuizAnswer, QuizAnswerResponse>()
                .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question.QuestionText));


            // QuizSession mappings
            CreateMap<QuizAttempt, QuizSessionResponse>()
                .ForMember(dest => dest.AttemptId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CurrentAnswers, opt => opt.MapFrom(src => src.Answers))
                .ForMember(dest => dest.TimeRemainingInSeconds, opt => opt.Ignore()); // Calculated separately

            // Ranking mappings
            CreateMap<QuizAttempt, RankingEntryResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Username))
                .ForMember(dest => dest.QuizTitle, opt => opt.MapFrom(src => src.Quiz.Title))
                .ForMember(dest => dest.CompletedAt, opt => opt.MapFrom(src => src.CompletedAt!.Value));
        }
    }
}