import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAttemptResponse } from '../../services/types';
import QuizAttemptService from '../../services/quizAttemptService';
import ProgressionChart from './ProgressionChart';
import './MyResults.css';

interface MyResultsProps {
  quizAttemptService: QuizAttemptService;
}

const MyResults = ({ quizAttemptService }: MyResultsProps) => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<QuizAttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyAttempts();
  }, []);

  const loadMyAttempts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await quizAttemptService.getMyAttempts();

      if ('success' in response && !response.success) {
        setError(response.message);
      } else {
        setAttempts(response as QuizAttemptResponse[]);
      }
    } catch (err) {
      setError('Failed to load quiz attempts');
    } finally {
      setLoading(false);
    }
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
      <div className="my-results-loading">
        <div className="loading-spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-results-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadMyAttempts}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-results">
      <header className="my-results-header">
        <div className="header-navigation">
          <button
            className="nav-link"
            onClick={() => navigate('/user/dashboard')}
          >
            ← Dashboard
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/rankings')}
          >
            Global Rankings
          </button>
        </div>
        <h1>My Quiz Results</h1>
        <p>View your quiz attempt history and performance</p>
      </header>

      <main className="my-results-main">
        {attempts.length === 0 ? (
          <div className="no-attempts">
            <div className="no-attempts-icon">📊</div>
            <h3>No Quiz Attempts Yet</h3>
            <p>You haven't taken any quizzes yet. Start taking quizzes to see your results here.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/user/dashboard')}
            >
              Browse Quizzes
            </button>
          </div>
        ) : (
          <>
            {/* Progression Chart */}
            <ProgressionChart attempts={attempts} />

            {/* Results Table */}
            <div className="results-table-container">
              <table className="results-table">
              <thead>
                <tr>
                  <th>Quiz Name</th>
                  <th>Date Attempted</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Spent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="quiz-name">
                      <div className="quiz-info">
                        <span className="quiz-title">{attempt.quizTitle}</span>
                      </div>
                    </td>
                    <td className="attempt-date">
                      {attempt.completedAt ? formatDate(attempt.completedAt) : 'In Progress'}
                    </td>
                    <td className="score">
                      <span className="score-value">
                        {attempt.score} / {attempt.maxScore}
                      </span>
                    </td>
                    <td className="percentage">
                      <span className={`percentage-badge ${getScoreColor(attempt.percentage)}`}>
                        {attempt.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="time-spent">
                      {formatTime(attempt.timeSpentInSeconds)}
                    </td>
                    <td className="action">
                      {attempt.completedAt ? (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewDetails(attempt.quizId, attempt.id)}
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/quiz/${attempt.quizId}/take`)}
                        >
                          Continue
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MyResults;