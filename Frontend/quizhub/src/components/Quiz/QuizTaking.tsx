import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QuizSessionResponse,
  QuizResponse,
  QuestionResponse,
  QuestionType,
  SubmitAnswerRequest,
  QuizAttemptResponse
} from '../../services/types';
import quizAttemptService from '../../services/quizAttemptService';
import './QuizTaking.css';

interface QuizAnswer {
  questionId: number;
  userAnswer?: string;
  selectedOptionIds: number[];
}

const QuizTaking = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const [session, setSession] = useState<QuizSessionResponse | null>(null);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, QuizAnswer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || !session) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, session]);

  // Load quiz info and check for existing attempt
  useEffect(() => {
    if (quizId) {
      checkForExistingAttempt(parseInt(quizId));
    }

    // Cleanup function to reset state when component unmounts or quizId changes
    return () => {
      setSession(null);
      setQuiz(null);
      setCurrentQuestionIndex(0);
      setAnswers(new Map());
      setTimeRemaining(0);
      setIsSubmitting(false);
      setError(null);
      setLoading(true);
    };
  }, [quizId]);

  const checkForExistingAttempt = async (quizIdNum: number) => {
    try {
      setLoading(true);
      setError(null);

      // Try to start without restart to check for existing attempt
      const response = await quizAttemptService.startQuiz({ quizId: quizIdNum, restart: false });

      if ('success' in response && !response.success) {
        // No existing attempt, just set loading to false so user can start
        setLoading(false);
      } else {
        // Existing attempt found, continue with it
        const sessionData = response as QuizSessionResponse;
        setSession(sessionData);
        setQuiz(sessionData.quiz);
        setTimeRemaining(sessionData.timeRemainingInSeconds);

        // Initialize answers map with existing answers
        const existingAnswers = new Map<number, QuizAnswer>();
        sessionData.currentAnswers.forEach(answer => {
          existingAnswers.set(answer.questionId, {
            questionId: answer.questionId,
            userAnswer: answer.userAnswer,
            selectedOptionIds: answer.selectedOptionIds || []
          });
        });
        setAnswers(existingAnswers);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load quiz');
      setLoading(false);
    }
  };

  const startQuiz = async (quizIdNum: number) => {
    try {
      setLoading(true);
      setError(null);

      // Reset all state when starting a new quiz
      setSession(null);
      setQuiz(null);
      setCurrentQuestionIndex(0);
      setAnswers(new Map());
      setTimeRemaining(0);
      setIsSubmitting(false);

      const response = await quizAttemptService.startQuiz({ quizId: quizIdNum, restart: true });

      if ('success' in response && !response.success) {
        setError(response.message);
      } else {
        const sessionData = response as QuizSessionResponse;
        setSession(sessionData);
        setQuiz(sessionData.quiz);
        setTimeRemaining(sessionData.timeRemainingInSeconds);

        // Initialize answers map
        const initialAnswers = new Map<number, QuizAnswer>();
        sessionData.currentAnswers.forEach(answer => {
          initialAnswers.set(answer.questionId, {
            questionId: answer.questionId,
            userAnswer: answer.userAnswer,
            selectedOptionIds: answer.selectedOptionIds
          });
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      setError('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = useCallback(async () => {
    if (!session) return;

    try {
      const result = await quizAttemptService.completeQuiz(session.attemptId);
      if ('success' in result && !result.success) {
        setError(result.message);
      } else {
        navigate(`/quiz/${session.quiz.id}/results/${session.attemptId}`);
      }
    } catch (err) {
      setError('Failed to submit quiz when time ran out');
    }
  }, [session, navigate]);

  const handleAnswerChange = (questionId: number, answer: Partial<QuizAnswer>) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const currentAnswer = newAnswers.get(questionId) || {
        questionId,
        userAnswer: '',
        selectedOptionIds: []
      };

      newAnswers.set(questionId, { ...currentAnswer, ...answer });
      return newAnswers;
    });
  };

  const handleSubmitAnswer = async (questionId: number) => {
    if (!session) return;

    const answer = answers.get(questionId);
    if (!answer) return;

    try {
      const request: SubmitAnswerRequest = {
        questionId,
        userAnswer: answer.userAnswer,
        selectedOptionIds: answer.selectedOptionIds
      };

      const response = await quizAttemptService.submitAnswer(session.attemptId, request);
      if ('success' in response && !response.success) {
        setError(response.message);
      }
      // Note: We don't update anything here as answers are stored on backend
    } catch (err) {
      setError('Failed to submit answer');
    }
  };

  const handleCompleteQuiz = async () => {
    if (!session || isSubmitting) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit your quiz? You cannot change your answers after submission.'
    );

    if (!confirmSubmit) return;

    setIsSubmitting(true);

    try {
      // Submit any unsaved answers
      const answersArray = Array.from(answers.entries());
      for (const [questionId, answer] of answersArray) {
        await handleSubmitAnswer(questionId);
      }

      // Complete the quiz
      const result = await quizAttemptService.completeQuiz(session.attemptId);

      if ('success' in result && !result.success) {
        setError(result.message);
      } else {
        navigate(`/quiz/${quiz!.id}/results/${session.attemptId}`);
      }
    } catch (err) {
      setError('Failed to complete quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelQuiz = async () => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this quiz? Your progress will be lost.'
    );

    if (confirmCancel && session) {
      try {
        // Delete the incomplete quiz attempt
        const response = await quizAttemptService.deleteAttempt(session.attemptId);

        // Navigate away regardless of delete success/failure
        navigate('/user/dashboard');
      } catch (err) {
        // Still navigate away even if delete fails
        navigate('/user/dashboard');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: QuestionResponse) => {
    const answer = answers.get(question.id) || {
      questionId: question.id,
      userAnswer: '',
      selectedOptionIds: []
    };

    const renderOptions = () => {
      switch (question.type) {
        case QuestionType.SingleChoice:
          return question.options.map((option) => (
            <label key={option.id} className="option-label">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={answer.selectedOptionIds.includes(option.id)}
                onChange={() => handleAnswerChange(question.id, {
                  selectedOptionIds: [option.id]
                })}
              />
              <span className="option-text">{option.optionText}</span>
            </label>
          ));

        case QuestionType.MultipleChoice:
          return question.options.map((option) => (
            <label key={option.id} className="option-label">
              <input
                type="checkbox"
                value={option.id}
                checked={answer.selectedOptionIds.includes(option.id)}
                onChange={(e) => {
                  const optionId = option.id;
                  let newSelected = [...answer.selectedOptionIds];

                  if (e.target.checked) {
                    if (!newSelected.includes(optionId)) {
                      newSelected.push(optionId);
                    }
                  } else {
                    newSelected = newSelected.filter(id => id !== optionId);
                  }

                  handleAnswerChange(question.id, {
                    selectedOptionIds: newSelected
                  });
                }}
              />
              <span className="option-text">{option.optionText}</span>
            </label>
          ));

        case QuestionType.TrueFalse:
          return question.options.map((option) => (
            <label key={option.id} className="option-label">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={answer.selectedOptionIds.includes(option.id)}
                onChange={() => handleAnswerChange(question.id, {
                  selectedOptionIds: [option.id]
                })}
              />
              <span className="option-text">{option.optionText}</span>
            </label>
          ));

        case QuestionType.FillInTheBlank:
          return (
            <input
              type="text"
              className="text-answer-input"
              value={answer.userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, {
                userAnswer: e.target.value
              })}
              placeholder="Enter your answer..."
            />
          );

        default:
          return <div>Unsupported question type</div>;
      }
    };

    return (
      <div key={question.id} className="question-container">
        <div className="question-header">
          <h3 className="question-text">{question.questionText}</h3>
          <span className="question-points">{question.points} point{question.points !== 1 ? 's' : ''}</span>
        </div>

        <div className="question-options">
          {renderOptions()}
        </div>

        {question.type !== QuestionType.FillInTheBlank && question.options.length === 0 && (
          <div className="no-options">No options available for this question.</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="quiz-taking-loading">
        <div className="loading-spinner"></div>
        <p>Starting quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-taking-error">
        <div className="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/user/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!session) {
    // No active session - show start quiz button
    return (
      <div className="quiz-start-screen">
        <div className="start-quiz-container">
          <h2>Ready to start the quiz?</h2>
          <p>Click the button below to begin your quiz attempt.</p>
          <div className="start-quiz-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={() => startQuiz(parseInt(quizId!))}
              disabled={loading}
            >
              {loading ? 'Starting Quiz...' : 'Start Quiz'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/user/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-taking-error">
        <div className="error-icon">❌</div>
        <h3>Quiz not found</h3>
        <p>The quiz could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => navigate('/user/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="quiz-taking">
      {/* Quiz Header */}
      <header className="quiz-header">
        <div className="quiz-header-content">
          <div className="quiz-info">
            <h1 className="quiz-title">{quiz.title}</h1>
            <div className="quiz-progress">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>

          <div className="quiz-header-actions">
            <button
              className="btn btn-cancel"
              onClick={handleCancelQuiz}
              title="Cancel Quiz"
            >
              Cancel Quiz
            </button>

            <div className="quiz-timer">
              <div className={`timer ${timeRemaining <= 300 ? 'timer-warning' : ''} ${timeRemaining <= 60 ? 'timer-danger' : ''}`}>
                <span className="timer-icon">⏱️</span>
                <span className="timer-text">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <main className="quiz-main">
        <div className="quiz-container">
          {/* Question Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Current Question */}
          {renderQuestion(currentQuestion)}

          {/* Navigation */}
          <div className="quiz-navigation">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            <div className="nav-center">
              <span className="question-counter">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
            </div>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleCompleteQuiz}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Quiz'}
              </button>
            )}
          </div>

          {/* Question Overview */}
          <div className="question-overview">
            <h4>Question Overview</h4>
            <div className="question-grid">
              {quiz.questions.map((q, index) => {
                const hasAnswer = answers.has(q.id) && (
                  answers.get(q.id)?.selectedOptionIds.length! > 0 ||
                  answers.get(q.id)?.userAnswer?.trim()
                );

                return (
                  <button
                    key={q.id}
                    className={`question-nav-btn ${index === currentQuestionIndex ? 'active' : ''} ${hasAnswer ? 'answered' : ''}`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizTaking;