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
        +CreatedQuizzes
        +QuizAttempts
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
        +Questions
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
        +Options
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
        +Answers
    }

    class QuizAnswer {
        +int Id
        +int QuizAttemptId
        +QuizAttempt QuizAttempt
        +int QuestionId
        +Question Question
        +string UserAnswer
        +SelectedOptionIds
        +bool IsCorrect
        +int PointsEarned
        +DateTime AnsweredAt
    }

    User --> Quiz : creates
    User --> QuizAttempt : takes
    Quiz --> Question : contains
    Quiz --> QuizAttempt : attempted
    Question --> QuestionOption : has
    Question --> QuizAnswer : answered
    QuizAttempt --> QuizAnswer : includes


    User --> UserType
    Quiz --> DifficultyLevel
    Question --> QuestionType


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
