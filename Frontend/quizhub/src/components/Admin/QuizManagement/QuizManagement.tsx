import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QuizSummaryResponse,
  DifficultyLevel,
  ApiError
} from '../../../services/types';
import quizService from '../../../services/quizService';
import QuizList from './QuizList';
import QuizForm from './QuizForm';
import './QuizManagement.css';

const QuizManagement = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    difficulty: undefined as DifficultyLevel | undefined,
    topic: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
    showMyQuizzes: false
  });

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (filters.showMyQuizzes) {
        response = await quizService.getMyQuizzes();
      } else if (filters.difficulty !== undefined || filters.topic !== undefined || filters.isActive !== undefined) {
        response = await quizService.getQuizzesByFilters(filters.difficulty, filters.topic, filters.isActive);
      } else {
        response = await quizService.getAllQuizzes();
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

  useEffect(() => {
    loadQuizzes();
  }, [filters]);

  const handleCreateQuiz = () => {
    setSelectedQuizId(null);
    setCurrentView('create');
  };

  const handleEditQuiz = (quizId: number) => {
    setSelectedQuizId(quizId);
    setCurrentView('edit');
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await quizService.deleteQuiz(quizId);

      if (typeof response === 'object' && 'success' in response && !response.success) {
        setError(response.message);
      } else {
        await loadQuizzes(); // Refresh the list
      }
    } catch (err) {
      setError('Failed to delete quiz');
    }
  };

  const handleToggleQuizStatus = async (quizId: number) => {
    try {
      const response = await quizService.toggleQuizStatus(quizId);

      if (typeof response === 'object' && 'success' in response && !response.success) {
        setError(response.message);
      } else {
        await loadQuizzes(); // Refresh the list
      }
    } catch (err) {
      setError('Failed to toggle quiz status');
    }
  };

  const handleQuizSaved = async () => {
    setCurrentView('list');
    await loadQuizzes(); // Refresh the list
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedQuizId(null);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: undefined,
      topic: undefined,
      isActive: undefined,
      showMyQuizzes: false
    });
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="quiz-management">
        {/* Admin Header */}
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-brand">
              <h1>QuizHub Admin</h1>
              <span className="admin-badge">Quiz Management</span>
            </div>
            <div className="admin-actions">
              <button
                className="admin-btn dashboard-btn"
                onClick={() => navigate('/admin/dashboard')}
              >
                Dashboard
              </button>
              <button className="admin-btn profile-btn">Profile</button>
              <button className="admin-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="quiz-management-header">
            <h2>{currentView === 'create' ? 'Create New Quiz' : 'Edit Quiz'}</h2>
            <button className="btn btn-secondary" onClick={handleBackToList}>
              Back to List
            </button>
          </div>

          <QuizForm
            quizId={selectedQuizId}
            onSaved={handleQuizSaved}
            onCancel={handleBackToList}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="quiz-management">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <h1>QuizHub Admin</h1>
            <span className="admin-badge">Quiz Management</span>
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn dashboard-btn"
              onClick={() => navigate('/admin/dashboard')}
            >
              Dashboard
            </button>
            <button className="admin-btn profile-btn">Profile</button>
            <button className="admin-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="quiz-management-header">
        <div className="header-left">
          <h2>Quiz Management</h2>
          <span className="quiz-count">
            {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''} found
          </span>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateQuiz}>
            Create Quiz
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="quiz-filters">
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
            placeholder="Filter by topic (e.g., Math, Science, History)"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(e) => handleFilterChange({
              isActive: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.showMyQuizzes}
              onChange={(e) => handleFilterChange({ showMyQuizzes: e.target.checked })}
            />
            My Quizzes Only
          </label>
        </div>

        <button className="btn btn-outline clear-filters" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <QuizList
        quizzes={quizzes}
        loading={loading}
        onEdit={handleEditQuiz}
        onDelete={handleDeleteQuiz}
        onToggleStatus={handleToggleQuizStatus}
        onRefresh={loadQuizzes}
      />
      </main>
    </div>
  );
};

export default QuizManagement;