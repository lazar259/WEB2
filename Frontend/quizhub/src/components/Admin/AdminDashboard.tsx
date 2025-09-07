import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
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

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;