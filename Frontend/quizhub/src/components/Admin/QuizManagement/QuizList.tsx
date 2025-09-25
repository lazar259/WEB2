import React from 'react';
import { QuizSummaryResponse } from '../../../services/types';
import QuizService from '../../../services/quizService';
import { formatDateWithTime } from '../../../utils/dateUtils';

interface QuizListProps {
  quizService: QuizService;
  quizzes: QuizSummaryResponse[];
  loading: boolean;
  onEdit: (quizId: number) => void;
  onDelete: (quizId: number) => void;
  onToggleStatus: (quizId: number) => void;
  onRefresh: () => void;
}

const QuizList = ({
  quizService,
  quizzes,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onRefresh
}: QuizListProps) => {

  const getDifficultyBadgeClass = (difficulty: number) => {
    switch (difficulty) {
      case 0: return 'difficulty-easy';
      case 1: return 'difficulty-medium';
      case 2: return 'difficulty-hard';
      default: return 'difficulty-unknown';
    }
  };

  if (loading) {
    return (
      <div className="quiz-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="quiz-list-empty">
        <h3>No quizzes found</h3>
        <p>No quizzes match your current filters. Try adjusting the filters or create a new quiz.</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-list">
      <div className="quiz-list-controls">
        <button className="btn btn-outline refresh-btn" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className={`quiz-card ${!quiz.isActive ? 'quiz-card-inactive' : ''}`}>
            <div className="quiz-card-header">
              <div className="quiz-title-section">
                <h3 className="quiz-title">{quiz.title}</h3>
                <div className="quiz-meta">
                  <span className={`difficulty-badge ${getDifficultyBadgeClass(quiz.difficulty)}`}>
                    {quizService.getDifficultyDisplayName(quiz.difficulty)}
                  </span>
                  <span className={`status-badge ${quiz.isActive ? 'status-active' : 'status-inactive'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="quiz-actions">
                <button
                  className="btn-icon edit-btn"
                  onClick={() => onEdit(quiz.id)}
                  title="Edit quiz"
                >
                  ✏️
                </button>
                <button
                  className={`btn-icon toggle-btn ${quiz.isActive ? 'toggle-active' : 'toggle-inactive'}`}
                  onClick={() => onToggleStatus(quiz.id)}
                  title={quiz.isActive ? 'Deactivate quiz' : 'Activate quiz'}
                >
                  {quiz.isActive ? '⏸️' : '▶️'}
                </button>
                <button
                  className="btn-icon delete-btn"
                  onClick={() => onDelete(quiz.id)}
                  title="Delete quiz"
                >
                  🗑️
                </button>
              </div>
            </div>

            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}

            <div className="quiz-topic">
              <span className="topic-label">Topic:</span>
              <span className="topic-value">{quiz.topic}</span>
            </div>

            <div className="quiz-stats">
              <div className="stat">
                <span className="stat-label">Questions:</span>
                <span className="stat-value">{quiz.questionCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Points:</span>
                <span className="stat-value">{quiz.totalPoints}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time Limit:</span>
                <span className="stat-value">{quiz.timeLimitInMinutes} min</span>
              </div>
            </div>

            <div className="quiz-footer">
              <div className="creator-info">
                <span className="creator-label">Created by:</span>
                <span className="creator-name">{quiz.createdByUser.username}</span>
              </div>
              <div className="date-info">
                <div className="date-created">
                  <span className="date-label">Created:</span>
                  <span className="date-value">{formatDateWithTime(quiz.createdAt)}</span>
                </div>
                {quiz.updatedAt !== quiz.createdAt && (
                  <div className="date-updated">
                    <span className="date-label">Updated:</span>
                    <span className="date-value">{formatDateWithTime(quiz.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;