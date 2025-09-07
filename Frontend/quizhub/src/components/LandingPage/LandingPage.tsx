import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import Navbar from '../Navbar/Navbar';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate('/login');
  const handleRegisterClick = () => navigate('/register');
  return (
    <div className="landing-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Test Your Knowledge with <span className="gradient-text">QuizHub</span>
            </h1>
            <p className="hero-subtitle">
              Challenge yourself with interactive quizzes across various topics. 
              Track your progress, compete with friends, and expand your learning journey.
            </p>
            <div className="hero-actions">
              <button className="cta-button primary" onClick={handleRegisterClick}>
                Start Learning Today
              </button>
              <button className="cta-button secondary" onClick={handleLoginClick}>
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="quiz-card-demo">
              <div className="demo-card">
                <h3>Sample Quiz Question</h3>
                <p>What is the capital of France?</p>
                <div className="demo-options">
                  <div className="demo-option">A) London</div>
                  <div className="demo-option correct">B) Paris</div>
                  <div className="demo-option">C) Berlin</div>
                  <div className="demo-option">D) Rome</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose QuizHub?</h2>
            <p className="section-subtitle">Discover the features that make learning engaging and effective</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Diverse Topics</h3>
              <p className="feature-description">
                Explore quizzes across multiple categories including science, history, 
                technology, arts, and more.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">
                Monitor your learning journey with detailed analytics and 
                performance insights.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Interactive Experience</h3>
              <p className="feature-description">
                Engage with dynamic quizzes featuring multiple question types 
                and instant feedback.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Social Learning</h3>
              <p className="feature-description">
                Connect with other learners, share achievements, and 
                participate in challenges.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Personalized Content</h3>
              <p className="feature-description">
                Get quiz recommendations tailored to your interests and 
                skill level.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">
                Learn on the go with our responsive design that works 
                perfectly on any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Quiz Categories</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About QuizHub</h2>
              <p className="about-description">
                QuizHub is designed to make learning fun and accessible for everyone. 
                Whether you're a student preparing for exams, a professional looking to 
                expand your knowledge, or simply someone who loves trivia, our platform 
                provides engaging quizzes that adapt to your learning style.
              </p>
              <p className="about-description">
                Our mission is to create a community where knowledge sharing and learning 
                happen naturally through interactive challenges and friendly competition.
              </p>
              <div className="about-features">
                <div className="about-feature">✅ Instant feedback on answers</div>
                <div className="about-feature">✅ Detailed explanations for learning</div>
                <div className="about-feature">✅ Customizable difficulty levels</div>
                <div className="about-feature">✅ Regular content updates</div>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-card">
                <div className="card-header">
                  <div className="user-avatar">👨‍🎓</div>
                  <div className="user-info">
                    <div className="user-name">Alex Student</div>
                    <div className="user-level">Level 15</div>
                  </div>
                </div>
                <div className="progress-section">
                  <div className="progress-item">
                    <span>Science</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <span>History</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '72%'}}></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <span>Technology</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '91%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Learning Journey?</h2>
            <p className="cta-subtitle">
              Join thousands of learners who are already expanding their knowledge with QuizHub
            </p>
            <div className="cta-actions">
              <button className="cta-button primary large" onClick={handleRegisterClick}>
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-text">QuizHub</span>
            </div>
            <div className="footer-text">
              <p>&copy; 2025 QuizHub. Making learning fun and accessible for everyone.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;