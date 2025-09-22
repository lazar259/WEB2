import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserQuizList from './UserQuizList';
import UserProfilePicture from './UserProfilePicture';
import QuizService from '../../services/quizService';
import UserService from '../../services/userService';
import './UserDashboard.css';

interface UserDashboardProps {
  quizService: QuizService;
  userService: UserService;
}

const UserDashboard = ({ quizService, userService }: UserDashboardProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleTakeQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}/take`);
  };

  return (
    <div className="user-dashboard">
      {/* User Header */}
      <header className="user-header">
        <div className="user-header-content">
          <div className="user-brand">
            <div className="brand-with-profile">
              <UserProfilePicture userService={userService} size="medium" showZoom={true} />
              <div className="brand-content">
                <h1>QuizHub</h1>
                <span className="user-badge">User</span>
              </div>
            </div>
          </div>
          <div className="user-actions">
            <button
              className="user-btn nav-btn"
              onClick={() => navigate('/user/my-results')}
            >
              My Results
            </button>
            <button
              className="user-btn nav-btn"
              onClick={() => navigate('/rankings')}
            >
              Rankings
            </button>
            <button className="user-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="user-main">
        <div className="user-container">

          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Welcome back, User!</h2>
            <p className="welcome-subtitle">
              Continue your learning journey and test your knowledge with our interactive quizzes
            </p>
          </section>

          {/* Quiz List Section */}
          <section className="quiz-section">
            <UserQuizList quizService={quizService} onTakeQuiz={handleTakeQuiz} />
          </section>

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;