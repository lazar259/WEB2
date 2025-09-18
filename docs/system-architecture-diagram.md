# QuizHub System Architecture

This diagram illustrates the overall application architecture and component relationships.

```mermaid
graph TB
    subgraph "Frontend - React App"
        A[React Components] --> B[Authentication Service]
        A --> C[API Service]
        B --> D[JWT Token Storage]
        C --> E[HTTP Client]
    end

    subgraph "Backend - ASP.NET Core API"
        F[Controllers] --> G[Services Layer]
        G --> H[Repository Pattern]
        H --> I[Entity Framework Core]
        F --> J[JWT Authentication]
        F --> K[Authorization Middleware]
    end

    subgraph "Database"
        L[(SQL Server)]
    end

    subgraph "Key Components"
        M[User Management]
        N[Quiz Management]
        O[Question Management]
        P[Quiz Attempt Tracking]
        Q[Results & Analytics]
    end

    E --> F
    I --> L

    G --> M
    G --> N
    G --> O
    G --> P
    G --> Q

    style A fill:#61dafb,stroke:#000,color:#000
    style F fill:#512bd4,stroke:#000,color:#fff
    style L fill:#ffd43b,stroke:#000,color:#000
```

## Architecture Overview

### Frontend (React)
- **React Components**: User interface components for admin and student views
- **Authentication Service**: Handles login/logout and token management
- **API Service**: Manages all HTTP requests to the backend
- **JWT Token Storage**: Secure storage for authentication tokens

### Backend (ASP.NET Core)
- **Controllers**: API endpoints for handling HTTP requests
- **Services Layer**: Business logic and data processing
- **Repository Pattern**: Data access abstraction layer
- **Entity Framework Core**: ORM for database operations
- **JWT Authentication**: Token-based authentication system
- **Authorization Middleware**: Role-based access control

### Database
- **SQL Server**: Persistent data storage for all application data

### Core Features
- **User Management**: Authentication, authorization, and user profiles
- **Quiz Management**: Creating, editing, and managing quizzes
- **Question Management**: Question creation with various types and options
- **Quiz Attempt Tracking**: Recording and monitoring quiz attempts
- **Results & Analytics**: Performance tracking and progress visualization