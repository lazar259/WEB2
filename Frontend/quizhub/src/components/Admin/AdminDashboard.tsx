import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizService from '../../services/quizService';
import QuizAttemptService from '../../services/quizAttemptService';
import './AdminDashboard.css';

interface AdminDashboardProps {
  quizService: QuizService;
  quizAttemptService: QuizAttemptService;
}

const AdminDashboard = ({ quizService, quizAttemptService }: AdminDashboardProps) => {
  const navigate = useNavigate();

  // Redirect to quiz management by default
  useEffect(() => {
    navigate('/admin/quiz-management');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <h1>QuizHub Admin</h1>
            <span className="admin-badge">Administrator</span>
          </div>
          <div className="admin-actions">
            <button className="admin-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="admin-main">
        <div className="admin-container">

          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Welcome back, Admin!</h2>
            <p className="welcome-subtitle">
              Manage your QuizHub platform from this comprehensive dashboard
            </p>
          </section>

          {/* Dashboard Cards */}
          <section className="dashboard-cards">
            <div className="dashboard-card quiz-card" onClick={() => navigate('/admin/quiz-management')}>
              <div className="card-icon">📝</div>
              <div className="card-content">
                <h3>Quiz Management</h3>
                <p>Create, edit, and manage quizzes</p>
                <ul>
                  <li>Create new quizzes with multiple question types</li>
                  <li>Edit existing quizzes</li>
                  <li>Set difficulty levels and categories</li>
                  <li>Activate/deactivate quizzes</li>
                  <li>Delete unwanted quizzes</li>
                </ul>
              </div>
              <div className="card-action">
                <button className="card-btn">Manage Quizzes →</button>
              </div>
            </div>

            <div className="dashboard-card results-card" onClick={() => navigate('/admin/results-management')}>
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>Results Management</h3>
                <p>View and analyze all user quiz results</p>
                <ul>
                  <li>View all user quiz attempts</li>
                  <li>Filter results by user, quiz, or date</li>
                  <li>Monitor quiz performance metrics</li>
                  <li>Analyze user engagement patterns</li>
                  <li>Export detailed reports</li>
                </ul>
              </div>
              <div className="card-action">
                <button className="card-btn">Manage Results →</button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;