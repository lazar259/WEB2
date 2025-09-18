# QuizHub Class Diagram

This diagram shows the domain models and their relationships in the QuizHub system.

```mermaid
classDiagram
    class UserType {
        <<enumeration>>
        User
        Admin
    }

    class DifficultyLevel {
        <<enumeration>>
        Easy
        Medium
        Hard
    }

    class QuestionType {
        <<enumeration>>
        SingleChoice
        MultipleChoice
        TrueFalse
        FillInTheBlank
    }

    class User {
        +int Id
        +string Username
        +string Password
        +string Email
        +UserType UserType
        +string ProfilePicture
        +ICollection~Quiz~ CreatedQuizzes
        +ICollection~QuizAttempt~ QuizAttempts
    }

    class Quiz {
        +int Id
        +string Title
        +string Description
        +string Topic
        +int CreatedByUserId
        +User CreatedByUser
        +DifficultyLevel Difficulty
        +int TimeLimitInMinutes
        +int TotalPoints
        +DateTime CreatedAt
        +DateTime UpdatedAt
        +bool IsActive
        +ICollection~Question~ Questions
    }

    class Question {
        +int Id
        +int QuizId
        +Quiz Quiz
        +string QuestionText
        +QuestionType Type
        +int Points
        +int Order
        +string Explanation
        +string CorrectAnswer
        +ICollection~QuestionOption~ Options
    }

    class QuestionOption {
        +int Id
        +int QuestionId
        +Question Question
        +string OptionText
        +bool IsCorrect
        +int Order
    }

    class QuizAttempt {
        +int Id
        +int QuizId
        +Quiz Quiz
        +int UserId
        +User User
        +DateTime StartedAt
        +DateTime CompletedAt
        +int Score
        +int MaxScore
        +double Percentage
        +bool IsCompleted
        +int TimeSpentInSeconds
        +ICollection~QuizAnswer~ Answers
    }

    class QuizAnswer {
        +int Id
        +int QuizAttemptId
        +QuizAttempt QuizAttempt
        +int QuestionId
        +Question Question
        +string UserAnswer
        +ICollection~int~ SelectedOptionIds
        +bool IsCorrect
        +int PointsEarned
        +DateTime AnsweredAt
    }

    User ||--o{ Quiz : creates
    User ||--o{ QuizAttempt : takes
    Quiz ||--o{ Question : contains
    Quiz ||--o{ QuizAttempt : attempted
    Question ||--o{ QuestionOption : has
    Question ||--o{ QuizAnswer : answered
    QuizAttempt ||--o{ QuizAnswer : includes

    User --> UserType
    Quiz --> DifficultyLevel
    Question --> QuestionType
```

## Model Descriptions

- **User**: Represents both admin and regular users with authentication data
- **Quiz**: Contains quiz metadata, difficulty, and timing information
- **Question**: Individual questions within a quiz with various types and scoring
- **QuestionOption**: Multiple choice options for questions (when applicable)
- **QuizAttempt**: Records of user attempts at quizzes with scoring and timing
- **QuizAnswer**: Individual answers within an attempt with correctness tracking