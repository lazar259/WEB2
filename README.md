# QuizHub

A quiz management system built with ASP.NET Core 8.0 and React. This application allows administrators to create and manage quizzes while providing students with a platform to take quizzes and track their progress.

## Features

### Student Features
- Take quizzes with multiple question types (Single Choice, Multiple Choice, True/False, Fill-in-the-blank)
- View progression charts showing score improvements over time
- Filter and select specific quizzes to display in progression charts
- View detailed quiz results and performance statistics
- Compare performance with other students through global rankings

### Administrator Features
- Create, edit, delete, and manage quizzes with various question types
- View and analyze all student quiz attempts with filtering options
- Monitor student performance and engagement
- Activate/deactivate quizzes and manage content visibility

### Technical Implementation
- JWT Authentication with role-based access control
- Responsive design that works on mobile devices
- Form validation and error handling
- Entity Framework Core integration with SQL Server
- RESTful API architecture

## Tech Stack

### Backend
- ASP.NET Core 8.0 - Web API framework
- Entity Framework Core 9.0 - ORM for database operations
- SQL Server - Database management system
- JWT Bearer Authentication - Token-based authentication
- BCrypt.Net - Password hashing
- Swagger/OpenAPI - API documentation

### Frontend
- React 19.1.1 - UI library
- TypeScript 4.9.5 - Type-safe JavaScript
- React Router DOM 7.8.2 - Client-side routing
- CSS3 - Custom styling with responsive design
- Create React App - Build tooling and development server

## Prerequisites

Before running this project, make sure you have the following installed:

- .NET 8.0 SDK - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- Node.js 16+ - [Download here](https://nodejs.org/)
- SQL Server (LocalDB, Express, or full version) - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- Git - [Download here](https://git-scm.com/)

## Project Structure

```
WEB2/
├── Backend/
│   └── QuizHub/                 # ASP.NET Core Web API
│       ├── Controllers/         # API controllers
│       ├── Models/             # Data models
│       ├── Services/           # Business logic
│       ├── Database/           # Repository pattern & interfaces
│       ├── DTOs/               # Data transfer objects
│       ├── Migrations/         # EF Core database migrations
│       └── QuizHub.csproj      # Project file
├── Frontend/
│   └── quizhub/               # React application
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── services/      # API service layer
│       │   └── utils/         # Utility functions
│       ├── public/            # Static assets
│       └── package.json       # NPM dependencies
└── README.md                  # This file
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/WEB2.git
cd WEB2
```

### 2. Backend Setup (ASP.NET Core)

#### Step 1: Navigate to Backend Directory
```bash
cd Backend/QuizHub
```

#### Step 2: Configure Database Connection
1. Open `appsettings.json`
2. Update the `DefaultConnection` string to match your SQL Server instance:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=QuizHubDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

Common SQL Server connection strings:
- SQL Server LocalDB: `Server=(localdb)\\mssqllocaldb;Database=QuizHubDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true`
- SQL Server Express: `Server=.\\SQLEXPRESS;Database=QuizHubDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true`
- SQL Server with credentials: `Server=YOUR_SERVER;Database=QuizHubDb;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;MultipleActiveResultSets=true;TrustServerCertificate=true`

#### Step 3: Install Dependencies
```bash
dotnet restore
```

#### Step 4: Create and Apply Database Migrations
```bash
# Create the database and apply migrations
dotnet ef database update

# If you need to create a new migration (for development)
dotnet ef migrations add InitialCreate
```

#### Step 5: Run the Backend Server
```bash
dotnet run
```

The backend API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

### 3. Frontend Setup (React)

#### Step 1: Navigate to Frontend Directory
```bash
cd ../../Frontend/quizhub
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Start the Development Server
```bash
npm start
```

The frontend application will be available at:
- URL: `http://localhost:3000`

## Running Both Applications

### Option 1: Using Two Terminal Windows

Terminal 1 (Backend):
```bash
cd Backend/QuizHub
dotnet run
```

Terminal 2 (Frontend):
```bash
cd Frontend/quizhub
npm start
```

### Option 2: Using PowerShell/Command Prompt

Start Backend:
```bash
cd Backend/QuizHub && dotnet run
```

Start Frontend (in a new terminal):
```bash
cd Frontend/quizhub && npm start
```

## Default User Accounts

After running the application for the first time, you can create accounts through the registration page, or you can manually create users in the database:

### Admin Account (Manual Creation)
If you need an admin account, you can:
1. Register a regular user account
2. Manually update the `UserType` field in the database from `0` (User) to `1` (Admin)

### Student Account
- Register through the application's registration page
- Default user type is Student (UserType = 0)

## API Endpoints

The backend provides RESTful API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quiz Management (Admin)
- `GET /api/quiz` - Get all quizzes
- `POST /api/quiz` - Create new quiz
- `PUT /api/quiz/{id}` - Update quiz
- `DELETE /api/quiz/{id}` - Delete quiz
- `PATCH /api/quiz/{id}/toggle-status` - Toggle quiz status

### Quiz Taking (Student)
- `GET /api/quiz/available` - Get available quizzes
- `POST /api/quizattempt/start` - Start quiz attempt
- `POST /api/quizattempt/submit-answer` - Submit answer
- `POST /api/quizattempt/finish` - Finish quiz attempt

### Results & Analytics
- `GET /api/quizattempt/my-attempts` - Get user's attempts
- `GET /api/quizattempt/all` - Get all attempts (Admin)
- `GET /api/quizattempt/rankings` - Get global rankings

## Troubleshooting

### Common Backend Issues

#### Database Connection Issues
```bash
# Check if SQL Server is running
# For SQL Server LocalDB:
sqllocaldb info mssqllocaldb

# For SQL Server Express:
# Check Windows Services for "SQL Server (SQLEXPRESS)"
```

#### Migration Issues
```bash
# Reset database (WARNING: This will delete all data)
dotnet ef database drop
dotnet ef database update

# Create a new migration
dotnet ef migrations add YourMigrationName
```

#### Port Already in Use
```bash
# Kill process using port 5000/5001
netstat -ano | findstr :5000
taskkill /PID <ProcessID> /F
```

### Common Frontend Issues

#### Node.js/NPM Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### CORS Issues
- Ensure the backend CORS policy allows `http://localhost:3000`
- Check the CORS configuration in `Program.cs`

#### Build Issues
```bash
# Clear React build cache
npm start -- --reset-cache

# Or delete build folder and rebuild
rm -rf build
npm run build
```

## Development Commands

### Backend Development
```bash
# Watch for changes (hot reload)
dotnet watch run

# Run tests (if available)
dotnet test

# Build for production
dotnet build --configuration Release

# Publish for deployment
dotnet publish --configuration Release
```

### Frontend Development
```bash
# Start with specific port
npm start -- --port 3001

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run build
npx serve -s build
```

## Database Schema

The application uses Entity Framework Core with the following main entities:

- Users - User accounts (Students/Admins)
- Quizzes - Quiz definitions with metadata
- Questions - Individual questions within quizzes
- QuestionOptions - Multiple choice options for questions
- QuizAttempts - User quiz attempt records
- QuizAnswers - Individual answers within attempts

## Notes

This project was created as part of a web development course assignment. The main learning objectives included:

1. Building a full-stack web application
2. Implementing user authentication and authorization
3. Working with Entity Framework and database migrations
4. Creating a responsive React frontend
5. Developing RESTful APIs

## Known Issues

- Admin accounts need to be created manually in the database
- Some validation messages could be more user-friendly
- Mobile responsiveness could be improved in some areas

## Future Improvements

- Add email verification for user registration
- Implement quiz categories and tagging
- Add quiz time limits with countdown timers
- Create detailed analytics dashboard for administrators
- Add export functionality for quiz results

## Technologies Used

- ASP.NET Core 8.0
- Entity Framework Core 9.0
- React 19.1.1
- TypeScript 4.9.5
- SQL Server
- JWT Authentication
- CSS3 with Responsive Design
