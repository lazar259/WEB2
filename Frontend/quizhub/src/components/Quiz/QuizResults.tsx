import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QuizAttemptResponse,
  QuizAnswerResponse,
  QuestionType
} from '../../services/types';
import quizAttemptService from '../../services/quizAttemptService';
import quizService from '../../services/quizService';
import { getUserTypeFromToken, getAuthToken } from '../../utils/jwt';
import './QuizResults.css';

const QuizResults = () => {
  const navigate = useNavigate();
  const { quizId, attemptId } = useParams<{ quizId: string; attemptId: string }>();

  const [result, setResult] = useState<QuizAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullQuiz, setFullQuiz] = useState<any>(null);

  // Helper function to get the appropriate dashboard based on user type
  const getDashboardUrl = () => {
    const token = getAuthToken();
    if (!token) return '/';

    const userType = getUserTypeFromToken(token);
    return userType === 'admin' ? '/admin/results-management' : '/user/dashboard';
  };

  const loadResults = async (attemptIdNum: number) => {
    try {
      setLoading(true);
      setError(null);

      // Use admin endpoint if user is admin, regular endpoint if user
      const token = getAuthToken();
      const userType = token ? getUserTypeFromToken(token) : null;

      let response;
      if (userType === 'admin') {
        response = await quizAttemptService.getAttemptResultsAdmin(attemptIdNum);
      } else {
        response = await quizAttemptService.getAttemptResults(attemptIdNum);
      }

      if ('success' in response && !response.success) {
        setError(response.message);
      } else {
        setResult(response as QuizAttemptResponse);
      }
    } catch (err) {
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      loadResults(parseInt(attemptId));
    }
  }, [attemptId]);

  useEffect(() => {
    if (result && quizId) {
      const loadQuizData = async () => {
        const quizResponse = await quizService.getQuizById(parseInt(quizId));
        if (!('success' in quizResponse)) {
          setFullQuiz(quizResponse);
        }
      };
      loadQuizData();
    }
  }, [result, quizId]);

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

  const renderUserAnswer = (answer: QuizAnswerResponse, question: any) => {
    if (!question) return 'N/A';

    switch (question.type) {
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
      case QuestionType.TrueFalse:
        if (answer.selectedOptionIds.length === 0) {
          return <span className="no-answer">No answer selected</span>;
        }

        const selectedOptions = question.options.filter((opt: any) =>
          answer.selectedOptionIds.includes(opt.id)
        );

        return (
          <div className="selected-options">
            {selectedOptions.map((option: any, index: number) => (
              <div key={option.id} className="selected-option">
                {selectedOptions.length > 1 && `${index + 1}. `}{option.optionText}
              </div>
            ))}
          </div>
        );

      case QuestionType.FillInTheBlank:
        return answer.userAnswer ? (
          <span className="text-answer">"{answer.userAnswer}"</span>
        ) : (
          <span className="no-answer">No answer provided</span>
        );

      default:
        return 'Unknown question type';
    }
  };

  const renderCorrectAnswer = (question: any) => {
    switch (question.type) {
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
      case QuestionType.TrueFalse:
        const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
        return (
          <div className="correct-options">
            {correctOptions.map((option: any, index: number) => (
              <div key={option.id} className="correct-option">
                {correctOptions.length > 1 && `${index + 1}. `}{option.optionText}
              </div>
            ))}
          </div>
        );

      case QuestionType.FillInTheBlank:
        return question.correctAnswer ? (
          <span className="correct-text-answer">"{question.correctAnswer}"</span>
        ) : (
          <span className="no-answer">No correct answer defined</span>
        );

      default:
        return 'Unknown question type';
    }
  };

  if (loading) {
    return (
      <div className="quiz-results-loading">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-results-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate(getDashboardUrl())}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="quiz-results-error">
        <div className="error-icon">❌</div>
        <h3>Results Not Found</h3>
        <p>The quiz results could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => navigate(getDashboardUrl())}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const correctAnswers = result?.answers.filter(answer => answer.isCorrect).length ?? 0;

  return (
    <div className="quiz-results">
      {/* Results Header */}
      <header className="results-header">
        <div className="results-header-content">
          <h1 className="quiz-title">{result.quizTitle}</h1>
          <p className="completion-date">
            Completed on {new Date(result.completedAt!).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </header>

      <main className="results-main">
        <div className="results-container">
          {/* Score Overview */}
          <section className="score-overview">
            <div className="score-cards">
              <div className={`score-card main-score ${getScoreColor(result.percentage)}`}>
                <div className="score-value">{result.percentage.toFixed(1)}%</div>
                <div className="score-label">Final Score</div>
              </div>

              <div className="score-card">
                <div className="score-value">{result.score}</div>
                <div className="score-label">Points Earned</div>
              </div>

              <div className="score-card">
                <div className="score-value">{result.maxScore}</div>
                <div className="score-label">Total Points</div>
              </div>

              <div className="score-card">
                <div className="score-value">{correctAnswers}</div>
                <div className="score-label">Correct Answers</div>
              </div>

              <div className="score-card">
                <div className="score-value">{result.answers.length}</div>
                <div className="score-label">Total Questions</div>
              </div>

              <div className="score-card">
                <div className="score-value">{formatTime(result.timeSpentInSeconds)}</div>
                <div className="score-label">Time Spent</div>
              </div>
            </div>
          </section>

          {/* Performance Summary */}
          <section className="performance-summary">
            <h2>Performance Summary</h2>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-icon correct">✓</span>
                <span className="stat-text">
                  {correctAnswers} correct answer{correctAnswers !== 1 ? 's' : ''}
                  ({((correctAnswers / result.answers.length) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-icon incorrect">✗</span>
                <span className="stat-text">
                  {result.answers.length - correctAnswers} incorrect answer{(result.answers.length - correctAnswers) !== 1 ? 's' : ''}
                  ({(((result.answers.length - correctAnswers) / result.answers.length) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </section>

          {/* Detailed Answer Review */}
          <section className="answer-review">
            <h2>Answer Review</h2>
            <div className="answers-list">
              {result.answers.map((answer, index) => {
                const question = fullQuiz?.questions.find((q: any) => q.id === answer.questionId);

                return (
                  <div key={answer.questionId} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="answer-header">
                      <div className="question-info">
                        <h3 className="question-number">Question {index + 1}</h3>
                        <div className="answer-status">
                          {answer.isCorrect ? (
                            <span className="status-correct">
                              <span className="status-icon">✓</span>
                              Correct (+{answer.pointsEarned} pts)
                            </span>
                          ) : (
                            <span className="status-incorrect">
                              <span className="status-icon">✗</span>
                              Incorrect (0 pts)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="question-content">
                      <p className="question-text">{answer.questionText}</p>

                      <div className="answer-comparison">
                        <div className="answer-section your-answer">
                          <h4>Your Answer:</h4>
                          <div className={`answer-content ${answer.isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
                            {renderUserAnswer(answer, question)}
                          </div>
                        </div>

                        {!answer.isCorrect && fullQuiz && (
                          <div className="answer-section correct-answer-section">
                            <h4>Correct Answer:</h4>
                            <div className="answer-content correct-answer">
                              {renderCorrectAnswer(question)}
                            </div>
                          </div>
                        )}
                      </div>

                      {question?.explanation && (
                        <div className="explanation">
                          <h4>Explanation:</h4>
                          <p className="explanation-text">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Buttons */}
          <section className="result-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(getDashboardUrl())}
            >
              Back to Dashboard
            </button>

            {getUserTypeFromToken(getAuthToken() || '') === 'user' && (
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/quiz/${quizId}/take`)}
              >
                Retake Quiz
              </button>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default QuizResults;