import React, { useState, useEffect } from 'react';
import { QuizSummaryResponse, DifficultyLevel } from '../../services/types';
import quizService from '../../services/quizService';
import './UserQuizList.css';

interface UserQuizListProps {
  onTakeQuiz?: (quizId: number) => void;
}

const UserQuizList = ({ onTakeQuiz }: UserQuizListProps) => {
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    difficulty: undefined as DifficultyLevel | undefined,
    topic: undefined as string | undefined,
    searchKeyword: ''
  });

  useEffect(() => {
    loadActiveQuizzes();
  }, [filters.difficulty, filters.topic]);

  useEffect(() => {
    applyFilters();
  }, [quizzes, filters]);

  const loadActiveQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (filters.difficulty !== undefined || filters.topic !== undefined) {
        response = await quizService.getQuizzesByFilters(filters.difficulty, filters.topic, true);
      } else {
        response = await quizService.getActiveQuizzes();
      }

      if ('success' in response && !response.success) {
        setError(response.message);
        setQuizzes([]);
      } else {
        setQuizzes(response as QuizSummaryResponse[]);
      }
    } catch (err) {
      setError('Failed to load quizzes');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quizzes];

    // Apply keyword search
    if (filters.searchKeyword.trim()) {
      const keyword = filters.searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(keyword) ||
        quiz.description?.toLowerCase().includes(keyword) ||
        quiz.topic.toLowerCase().includes(keyword) ||
        quiz.createdByUser.username.toLowerCase().includes(keyword)
      );
    }

    setFilteredQuizzes(filtered);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: undefined,
      topic: undefined,
      searchKeyword: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyBadgeClass = (difficulty: number) => {
    switch (difficulty) {
      case 0: return 'difficulty-easy';
      case 1: return 'difficulty-medium';
      case 2: return 'difficulty-hard';
      default: return 'difficulty-unknown';
    }
  };

  const handleTakeQuiz = (quizId: number) => {
    if (onTakeQuiz) {
      onTakeQuiz(quizId);
    }
  };

  if (loading) {
    return (
      <div className="user-quiz-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-quiz-list-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Quizzes</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadActiveQuizzes}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-quiz-list">
      <div className="quiz-list-header">
        <div className="header-left">
          <h2>Available Quizzes</h2>
          <span className="quiz-count">
            {filteredQuizzes.length} of {quizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
          </span>
        </div>
        <button className="btn btn-outline refresh-btn" onClick={loadActiveQuizzes}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="quiz-filters">
        <div className="search-group">
          <label htmlFor="search-input">Search:</label>
          <input
            type="text"
            id="search-input"
            value={filters.searchKeyword}
            onChange={(e) => handleFilterChange({ searchKeyword: e.target.value })}
            placeholder="Search by title, description, topic, or creator..."
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="difficulty-filter">Difficulty:</label>
          <select
            id="difficulty-filter"
            value={filters.difficulty ?? ''}
            onChange={(e) => handleFilterChange({
              difficulty: e.target.value ? Number(e.target.value) as DifficultyLevel : undefined
            })}
          >
            <option value="">All Difficulties</option>
            <option value={DifficultyLevel.Easy}>Easy</option>
            <option value={DifficultyLevel.Medium}>Medium</option>
            <option value={DifficultyLevel.Hard}>Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="topic-filter">Topic:</label>
          <input
            type="text"
            id="topic-filter"
            value={filters.topic ?? ''}
            onChange={(e) => handleFilterChange({
              topic: e.target.value || undefined
            })}
            placeholder="Filter by topic..."
          />
        </div>

        <button className="btn btn-outline clear-filters" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      {/* Content Area */}
      {filteredQuizzes.length === 0 && !loading ? (
        <div className="user-quiz-list-empty">
          <div className="empty-icon">📝</div>
          <h3>{quizzes.length === 0 ? 'No Active Quizzes Available' : 'No Quizzes Match Your Search'}</h3>
          <p>{quizzes.length === 0 ? 'There are no active quizzes available at the moment. Check back later!' : 'Try adjusting your search criteria or filters.'}</p>
          <button className="btn btn-outline" onClick={loadActiveQuizzes}>
            Refresh
          </button>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="user-quiz-card">
            <div className="quiz-card-header">
              <h3 className="quiz-title">{quiz.title}</h3>
              <div className="quiz-meta">
                <span className={`difficulty-badge ${getDifficultyBadgeClass(quiz.difficulty)}`}>
                  {quizService.getDifficultyDisplayName(quiz.difficulty)}
                </span>
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
                <span className="stat-icon">❓</span>
                <span className="stat-value">{quiz.questionCount} questions</span>
              </div>
              <div className="stat">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">{quiz.totalPoints} points</span>
              </div>
              <div className="stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">{quiz.timeLimitInMinutes} min</span>
              </div>
            </div>

            <div className="quiz-footer">
              <div className="creator-info">
                <span className="creator-label">Created by:</span>
                <span className="creator-name">{quiz.createdByUser.username}</span>
              </div>
              <div className="date-info">
                <span className="date-label">Created:</span>
                <span className="date-value">{formatDate(quiz.createdAt)}</span>
              </div>
            </div>

            <div className="quiz-actions">
              <button
                className="btn btn-primary take-quiz-btn"
                onClick={() => handleTakeQuiz(quiz.id)}
              >
                Take Quiz
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default UserQuizList;