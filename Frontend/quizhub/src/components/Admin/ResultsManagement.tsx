import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizSummaryResponse, QuizAttemptResponse } from '../../services/types';
import quizService from '../../services/quizService';
import quizAttemptService from '../../services/quizAttemptService';
import './ResultsManagement.css';

const ResultsManagement = () => {
  const navigate = useNavigate();
  const [allAttempts, setAllAttempts] = useState<QuizAttemptResponse[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttemptResponse[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedQuiz, setSelectedQuiz] = useState<number | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedQuiz, selectedUser, selectedDateRange, allAttempts]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all completed attempts using admin endpoint
      const attemptsResponse = await quizAttemptService.getAllAttempts();

      if ('success' in attemptsResponse && !attemptsResponse.success) {
        setError(attemptsResponse.message);
      } else {
        const attempts = attemptsResponse as QuizAttemptResponse[];
        setAllAttempts(attempts);
      }

      // Load available quizzes
      const quizzesResponse = await quizService.getAllQuizzes();
      if (!('success' in quizzesResponse)) {
        setQuizzes(quizzesResponse as QuizSummaryResponse[]);
      }
    } catch (err) {
      setError('Failed to load results data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allAttempts];

    // Filter by quiz
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(attempt => attempt.quizId === selectedQuiz);
    }

    // Filter by user (search in username)
    if (selectedUser.trim()) {
      const searchTerm = selectedUser.toLowerCase().trim();
      filtered = filtered.filter(attempt =>
        attempt.userName.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (selectedDateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(attempt =>
        attempt.completedAt && new Date(attempt.completedAt) >= cutoffDate
      );
    }

    // Sort by completion date (most recent first)
    filtered.sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

    setFilteredAttempts(filtered);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  };

  const handleViewDetails = (quizId: number, attemptId: number) => {
    navigate(`/quiz/${quizId}/results/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="results-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading results data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-management-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          Try Again
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="results-management">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <h1>QuizHub Admin</h1>
            <span className="admin-badge">Results Management</span>
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn nav-btn"
              onClick={() => navigate('/admin/quiz-management')}
            >
              Quiz Management
            </button>
            <button className="admin-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="results-management-header">
          <h2>Results Management</h2>
          <p>View and analyze all user quiz results</p>
        </div>
        {/* Filters */}
        <div className="results-filters">
          <div className="filter-group">
            <label htmlFor="quiz-filter">Filter by Quiz:</label>
            <select
              id="quiz-filter"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            >
              <option value="all">All Quizzes</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="user-filter">Filter by User:</label>
            <input
              type="text"
              id="user-filter"
              placeholder="Enter username..."
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Date Range:</label>
            <select
              id="date-filter"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <div className="summary-card">
            <h3>{filteredAttempts.length}</h3>
            <p>Total Attempts</p>
          </div>
          <div className="summary-card">
            <h3>{Math.round(filteredAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / filteredAttempts.length) || 0}%</h3>
            <p>Average Score</p>
          </div>
          <div className="summary-card">
            <h3>{filteredAttempts.filter(attempt => attempt.percentage >= 80).length}</h3>
            <p>High Scorers (80%+)</p>
          </div>
        </div>

        {/* Results Table */}
        {filteredAttempts.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📊</div>
            <h3>No Results Found</h3>
            <p>No quiz attempts match the selected filters.</p>
          </div>
        ) : (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Quiz</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Spent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="user-cell">
                      <span className="user-name">{attempt.userName}</span>
                    </td>
                    <td className="quiz-cell">
                      <span className="quiz-title">{attempt.quizTitle}</span>
                    </td>
                    <td className="date-cell">
                      {attempt.completedAt ? formatDate(attempt.completedAt) : 'In Progress'}
                    </td>
                    <td className="score-cell">
                      <span className="score-value">
                        {attempt.score} / {attempt.maxScore}
                      </span>
                    </td>
                    <td className="percentage-cell">
                      <span className={`percentage-badge ${getScoreColor(attempt.percentage)}`}>
                        {attempt.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="time-cell">
                      {formatTime(attempt.timeSpentInSeconds)}
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleViewDetails(attempt.quizId, attempt.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsManagement;