import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizSummaryResponse, RankingEntryResponse } from '../../services/types';
import quizService from '../../services/quizService';
import quizAttemptService from '../../services/quizAttemptService';
import './GlobalRankings.css';

type TimePeriod = 'weekly' | 'monthly' | 'yearly' | 'all';

const GlobalRankings = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingEntryResponse[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedQuiz, setSelectedQuiz] = useState<number | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (quizzes.length > 0) {
      loadRankings();
    }
  }, [selectedQuiz, selectedPeriod, quizzes]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load available quizzes for filter dropdown
      const quizzesResponse = await quizService.getAllQuizzes();
      if (!('success' in quizzesResponse)) {
        setQuizzes(quizzesResponse as QuizSummaryResponse[]);
      }

      await loadRankings();
    } catch (err) {
      setError('Failed to load rankings data');
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async () => {
    try {
      const quizIdParam = selectedQuiz !== 'all' ? selectedQuiz : undefined;
      const response = await quizAttemptService.getGlobalRankings(quizIdParam, selectedPeriod);

      if ('success' in response && !response.success) {
        setError(response.message);
      } else {
        setRankings(response as RankingEntryResponse[]);
      }
    } catch (err) {
      setError('Failed to load rankings');
    }
  };

  const getFilteredRankings = (): RankingEntryResponse[] => {
    // Rankings are already filtered and sorted by the backend
    return rankings;
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRankBadge = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'very-good';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="rankings-loading">
        <div className="loading-spinner"></div>
        <p>Loading rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rankings-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Rankings</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          Try Again
        </button>
      </div>
    );
  }

  const filteredRankings = getFilteredRankings();

  return (
    <div className="global-rankings">
      <header className="rankings-header">
        <div className="header-navigation">
          <button
            className="nav-link"
            onClick={() => navigate('/user/dashboard')}
          >
            ← Dashboard
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/user/my-results')}
          >
            My Results
          </button>
        </div>
        <h1>Global Rankings</h1>
        <p>See how you stack up against other quiz takers</p>
      </header>

      <main className="rankings-main">
        {/* Filters */}
        <div className="rankings-filters">
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
            <label htmlFor="period-filter">Time Period:</label>
            <select
              id="period-filter"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
          </div>
        </div>

        {/* Rankings Table */}
        {filteredRankings.length === 0 ? (
          <div className="no-rankings">
            <div className="no-rankings-icon">🏆</div>
            <h3>No Rankings Available</h3>
            <p>No quiz attempts found for the selected filters.</p>
          </div>
        ) : (
          <div className="rankings-table-container">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.map((entry, index) => (
                  <tr key={entry.id} className={`rank-${index + 1}`}>
                    <td className="rank-cell">
                      <span className="rank-badge">
                        {getRankBadge(index + 1)}
                      </span>
                    </td>
                    <td className="user-cell">
                      <div className="user-info">
                        <span className="user-name">{entry.userName}</span>
                      </div>
                    </td>
                    <td className="quiz-cell">
                      <span className="quiz-title">{entry.quizTitle}</span>
                    </td>
                    <td className="score-cell">
                      <span className="score-value">
                        {entry.score} / {entry.maxScore}
                      </span>
                    </td>
                    <td className="percentage-cell">
                      <span className={`percentage-badge ${getScoreColor(entry.percentage)}`}>
                        {entry.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="time-cell">
                      {formatTime(entry.timeSpentInSeconds)}
                    </td>
                    <td className="date-cell">
                      {formatDate(entry.completedAt)}
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

export default GlobalRankings;