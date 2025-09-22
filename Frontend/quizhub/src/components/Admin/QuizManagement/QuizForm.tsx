import React, { useState, useEffect } from 'react';
import {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizResponse,
  DifficultyLevel,
  QuestionType,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ApiError
} from '../../../services/types';
import QuizService from '../../../services/quizService';
import QuestionEditor from './QuestionEditor';

interface QuizFormProps {
  quizService: QuizService;
  quizId?: number | null;
  onSaved: () => void;
  onCancel: () => void;
}

const QuizForm = ({ quizService, quizId, onSaved, onCancel }: QuizFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty: DifficultyLevel.Easy,
    timeLimitInMinutes: 30,
    isActive: true
  });

  const [questions, setQuestions] = useState<(CreateQuestionRequest | UpdateQuestionRequest)[]>([]);

  const isEditMode = quizId !== null && quizId !== undefined;

  // Load quiz data for editing
  useEffect(() => {
    if (isEditMode) {
      loadQuizForEditing();
    } else {
      // Initialize with one empty question for new quiz
      addNewQuestion();
    }
  }, [quizId]);

  const loadQuizForEditing = async () => {
    if (!quizId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await quizService.getQuizById(quizId);

      if ('success' in response && !response.success) {
        setError(response.message);
      } else {
        const quiz = response as QuizResponse;
        setFormData({
          title: quiz.title,
          description: quiz.description || '',
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          timeLimitInMinutes: quiz.timeLimitInMinutes,
          isActive: quiz.isActive
        });

        // Convert questions to editable format
        const editableQuestions: UpdateQuestionRequest[] = quiz.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          points: q.points,
          order: q.order,
          explanation: q.explanation,
          correctAnswer: q.correctAnswer,
          options: q.options.map(opt => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            order: opt.order
          }))
        }));

        setQuestions(editableQuestions);
      }
    } catch (err) {
      setError('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const addNewQuestion = () => {
    const newQuestion: CreateQuestionRequest = {
      questionText: '',
      type: QuestionType.SingleChoice,
      points: 1,
      order: questions.length + 1,
      explanation: '',
      correctAnswer: '',
      options: []
    };

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updatedQuestion: CreateQuestionRequest | UpdateQuestionRequest) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }

    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    updatedQuestions.forEach((q, i) => {
      q.order = i + 1;
    });

    setQuestions(updatedQuestions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= questions.length) {
      return;
    }

    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];

    // Update order values
    updatedQuestions.forEach((q, i) => {
      q.order = i + 1;
    });

    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    // Validate form data
    if (isEditMode) {
      const updateRequest: UpdateQuizRequest = {
        title: formData.title,
        description: formData.description,
        topic: formData.topic,
        difficulty: formData.difficulty,
        timeLimitInMinutes: formData.timeLimitInMinutes,
        isActive: formData.isActive,
        questions: questions as UpdateQuestionRequest[]
      };

      const errors = quizService.validateQuizData(updateRequest);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
    } else {
      const createRequest: CreateQuizRequest = {
        title: formData.title,
        description: formData.description,
        topic: formData.topic,
        difficulty: formData.difficulty,
        timeLimitInMinutes: formData.timeLimitInMinutes,
        questions: questions as CreateQuestionRequest[]
      };

      const errors = quizService.validateQuizData(createRequest);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    setLoading(true);

    try {
      let response;

      if (isEditMode && quizId) {
        const updateRequest: UpdateQuizRequest = {
          title: formData.title,
          description: formData.description,
          topic: formData.topic,
          difficulty: formData.difficulty,
          timeLimitInMinutes: formData.timeLimitInMinutes,
          isActive: formData.isActive,
          questions: questions as UpdateQuestionRequest[]
        };
        response = await quizService.updateQuiz(quizId, updateRequest);
      } else {
        const createRequest: CreateQuizRequest = {
          title: formData.title,
          description: formData.description,
          topic: formData.topic,
          difficulty: formData.difficulty,
          timeLimitInMinutes: formData.timeLimitInMinutes,
          questions: questions as CreateQuestionRequest[]
        };
        response = await quizService.createQuiz(createRequest);
      }

      if ('success' in response && !response.success) {
        setError(response.message);
      } else {
        onSaved();
      }
    } catch (err) {
      setError('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="quiz-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz data...</p>
      </div>
    );
  }

  return (
    <div className="quiz-form">
      <form onSubmit={handleSubmit}>
        {/* Basic Quiz Information */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="title">Quiz Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter quiz title"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter quiz description (optional)"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic *</label>
            <input
              type="text"
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Enter quiz topic (e.g., Math, Geography, Science)"
              required
              maxLength={100}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level *</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) as DifficultyLevel })}
                required
              >
                <option value={DifficultyLevel.Easy}>Easy</option>
                <option value={DifficultyLevel.Medium}>Medium</option>
                <option value={DifficultyLevel.Hard}>Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeLimit">Time Limit (minutes) *</label>
              <input
                type="number"
                id="timeLimit"
                value={formData.timeLimitInMinutes}
                onChange={(e) => setFormData({ ...formData, timeLimitInMinutes: Number(e.target.value) })}
                min="1"
                max="480"
                required
              />
            </div>

            {isEditMode && (
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="form-section">
          <div className="questions-header">
            <h3>Questions ({questions.length})</h3>
            <button type="button" className="btn btn-outline" onClick={addNewQuestion}>
              Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              index={index}
              onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
              onDelete={() => deleteQuestion(index)}
              onMoveUp={() => moveQuestion(index, 'up')}
              onMoveDown={() => moveQuestion(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < questions.length - 1}
              canDelete={questions.length > 1}
            />
          ))}
        </div>

        {/* Error Display */}
        {(error || validationErrors.length > 0) && (
          <div className="error-section">
            {error && <div className="error-message">{error}</div>}
            {validationErrors.length > 0 && (
              <div className="validation-errors">
                <h4>Please fix the following errors:</h4>
                <ul>
                  {validationErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Quiz' : 'Create Quiz')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;