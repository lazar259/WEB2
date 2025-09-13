import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="user-dashboard">
      {/* User Header */}
      <header className="user-header">
        <div className="user-header-content">
          <div className="user-brand">
            <h1>QuizHub</h1>
            <span className="user-badge">User</span>
          </div>
          <div className="user-actions">
            <button className="user-btn profile-btn">Profile</button>
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

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;