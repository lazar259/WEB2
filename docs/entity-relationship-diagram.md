# QuizHub Entity Relationship Diagram

This diagram shows the database structure and relationships between entities in the QuizHub system.

```mermaid
erDiagram
    User {
        int Id PK
        string Username
        string Password
        string Email
        UserType UserType
        string ProfilePicture
    }

    Quiz {
        int Id PK
        string Title
        string Description
        string Topic
        int CreatedByUserId FK
        DifficultyLevel Difficulty
        int TimeLimitInMinutes
        int TotalPoints
        DateTime CreatedAt
        DateTime UpdatedAt
        bool IsActive
    }

    Question {
        int Id PK
        int QuizId FK
        string QuestionText
        QuestionType Type
        int Points
        int Order
        string Explanation
        string CorrectAnswer
    }

    QuestionOption {
        int Id PK
        int QuestionId FK
        string OptionText
        bool IsCorrect
        int Order
    }

    QuizAttempt {
        int Id PK
        int QuizId FK
        int UserId FK
        DateTime StartedAt
        DateTime CompletedAt
        int Score
        int MaxScore
        double Percentage
        bool IsCompleted
        int TimeSpentInSeconds
    }

    QuizAnswer {
        int Id PK
        int QuizAttemptId FK
        int QuestionId FK
        string UserAnswer
        int SelectedOptionIds
        bool IsCorrect
        int PointsEarned
        DateTime AnsweredAt
    }

    User ||--o{ Quiz : "creates"
    User ||--o{ QuizAttempt : "takes"
    Quiz ||--o{ Question : "contains"
    Quiz ||--o{ QuizAttempt : "attempted"
    Question ||--o{ QuestionOption : "has"
    Question ||--o{ QuizAnswer : "answered"
    QuizAttempt ||--o{ QuizAnswer : "includes"
```

## Key Relationships

- **User to Quiz**: One-to-many (A user can create multiple quizzes)
- **User to QuizAttempt**: One-to-many (A user can attempt multiple quizzes)
- **Quiz to Question**: One-to-many (A quiz contains multiple questions)
- **Quiz to QuizAttempt**: One-to-many (A quiz can be attempted multiple times)
- **Question to QuestionOption**: One-to-many (A question can have multiple options)
- **Question to QuizAnswer**: One-to-many (A question can be answered multiple times)
- **QuizAttempt to QuizAnswer**: One-to-many (An attempt includes multiple answers)