import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

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
            <button className="admin-btn profile-btn">Profile</button>
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

            <div className="dashboard-card users-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>User Management</h3>
                <p>Manage users and administrators</p>
                <ul>
                  <li>View all registered users</li>
                  <li>Assign roles and permissions</li>
                  <li>Monitor user activity</li>
                  <li>Handle user reports</li>
                </ul>
              </div>
              <div className="card-action">
                <button className="card-btn" disabled>Coming Soon</button>
              </div>
            </div>

            <div className="dashboard-card analytics-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>Analytics & Reports</h3>
                <p>View detailed statistics and insights</p>
                <ul>
                  <li>Quiz performance metrics</li>
                  <li>User engagement statistics</li>
                  <li>Popular quiz categories</li>
                  <li>Export detailed reports</li>
                </ul>
              </div>
              <div className="card-action">
                <button className="card-btn" disabled>Coming Soon</button>
              </div>
            </div>

            <div className="dashboard-card settings-card">
              <div className="card-icon">⚙️</div>
              <div className="card-content">
                <h3>System Settings</h3>
                <p>Configure platform settings</p>
                <ul>
                  <li>General system configuration</li>
                  <li>Security settings</li>
                  <li>Email notifications</li>
                  <li>Platform customization</li>
                </ul>
              </div>
              <div className="card-action">
                <button className="card-btn" disabled>Coming Soon</button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;