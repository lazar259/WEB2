# QuizHub Entity Relationship Diagram

This diagram shows the database structure and relationships between entities in the QuizHub system.

```mermaid
erDiagram
    User {
        int Id
        string Username
        string Password
        string Email
        string UserType
        string ProfilePicture
    }

    Quiz {
        int Id
        string Title
        string Description
        string Topic
        int CreatedByUserId
        string Difficulty
        int TimeLimitInMinutes
        int TotalPoints
        datetime CreatedAt
        datetime UpdatedAt
        boolean IsActive
    }

    Question {
        int Id
        int QuizId
        string QuestionText
        string Type
        int Points
        int Order
        string Explanation
        string CorrectAnswer
    }

    QuestionOption {
        int Id
        int QuestionId
        string OptionText
        boolean IsCorrect
        int Order
    }

    QuizAttempt {
        int Id
        int QuizId
        int UserId
        datetime StartedAt
        datetime CompletedAt
        int Score
        int MaxScore
        float Percentage
        boolean IsCompleted
        int TimeSpentInSeconds
    }

    QuizAnswer {
        int Id
        int QuizAttemptId
        int QuestionId
        string UserAnswer
        string SelectedOptionIds
        boolean IsCorrect
        int PointsEarned
        datetime AnsweredAt
    }

    User ||--o{ Quiz : creates
    User ||--o{ QuizAttempt : takes
    Quiz ||--o{ Question : contains
    Quiz ||--o{ QuizAttempt : attempted
    Question ||--o{ QuestionOption : has
    Question ||--o{ QuizAnswer : answered
    QuizAttempt ||--o{ QuizAnswer : includes
```

## Key Relationships

- **User to Quiz**: One-to-many (A user can create multiple quizzes)
- **User to QuizAttempt**: One-to-many (A user can attempt multiple quizzes)
- **Quiz to Question**: One-to-many (A quiz contains multiple questions)
- **Quiz to QuizAttempt**: One-to-many (A quiz can be attempted multiple times)
- **Question to QuestionOption**: One-to-many (A question can have multiple options)
- **Question to QuizAnswer**: One-to-many (A question can be answered multiple times)
- **QuizAttempt to QuizAnswer**: One-to-many (An attempt includes multiple answers)