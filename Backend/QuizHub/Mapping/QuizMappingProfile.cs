using AutoMapper;
using QuizHub.DTOs;
using QuizHub.Models;

namespace QuizHub.Mapping
{
    public class QuizMappingProfile : Profile
    {
        public QuizMappingProfile()
        {
            // Quiz mappings
            CreateMap<Quiz, QuizResponse>();

            CreateMap<Quiz, QuizSummaryResponse>()
                .ForMember(dest => dest.QuestionCount, opt => opt.MapFrom(src => src.Questions.Count));

            CreateMap<CreateQuizRequest, Quiz>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.QuizAttempts, opt => opt.Ignore())
                .ForMember(dest => dest.TotalPoints, opt => opt.Ignore()) // Calculated separately
                .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions));

            // Question mappings
            CreateMap<Question, QuestionResponse>();

            CreateMap<CreateQuestionRequest, Question>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.QuizId, opt => opt.Ignore())
                .ForMember(dest => dest.Quiz, opt => opt.Ignore());

            CreateMap<UpdateQuestionRequest, Question>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Let EF assign new Id
                .ForMember(dest => dest.QuizId, opt => opt.Ignore())
                .ForMember(dest => dest.Quiz, opt => opt.Ignore());


            // Question Option mappings
            CreateMap<QuestionOption, QuestionOptionResponse>();

            CreateMap<CreateQuestionOptionRequest, QuestionOption>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionId, opt => opt.Ignore())
                .ForMember(dest => dest.Question, opt => opt.Ignore());

            CreateMap<UpdateQuestionOptionRequest, QuestionOption>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Let EF assign new Id
                .ForMember(dest => dest.QuestionId, opt => opt.Ignore())
                .ForMember(dest => dest.Question, opt => opt.Ignore());

        }
    }
}