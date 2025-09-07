import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="student-dashboard">
      {/* Student Header */}
      <header className="student-header">
        <div className="student-header-content">
          <div className="student-brand">
            <h1>QuizHub</h1>
            <span className="student-badge">Student</span>
          </div>
          <div className="student-actions">
            <button className="student-btn profile-btn">Profile</button>
            <button className="student-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="student-main">
        <div className="student-container">
          
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Welcome back, Student!</h2>
            <p className="welcome-subtitle">
              Continue your learning journey and test your knowledge with our interactive quizzes
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;