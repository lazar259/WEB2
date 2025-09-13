import React, { useState, useEffect } from 'react';
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionType,
  CreateQuestionOptionRequest,
  UpdateQuestionOptionRequest
} from '../../../services/types';

interface QuestionEditorProps {
  question: CreateQuestionRequest | UpdateQuestionRequest;
  index: number;
  onUpdate: (question: CreateQuestionRequest | UpdateQuestionRequest) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
}

const QuestionEditor = ({
  question,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  canDelete
}: QuestionEditorProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const updateQuestion = (updates: Partial<CreateQuestionRequest | UpdateQuestionRequest>) => {
    const updatedQuestion = { ...question, ...updates };

    // If question type changes, reset options and correct answer
    if (updates.type !== undefined && updates.type !== question.type) {
      updatedQuestion.options = [];
      updatedQuestion.correctAnswer = '';

      // Initialize default options for multiple choice questions
      if (updates.type === QuestionType.SingleChoice || updates.type === QuestionType.MultipleChoice) {
        updatedQuestion.options = [
          { optionText: '', isCorrect: true, order: 1 } as CreateQuestionOptionRequest | UpdateQuestionOptionRequest,
          { optionText: '', isCorrect: false, order: 2 } as CreateQuestionOptionRequest | UpdateQuestionOptionRequest
        ];
      } else if (updates.type === QuestionType.TrueFalse) {
        updatedQuestion.options = [
          { optionText: 'True', isCorrect: true, order: 1 } as CreateQuestionOptionRequest | UpdateQuestionOptionRequest,
          { optionText: 'False', isCorrect: false, order: 2 } as CreateQuestionOptionRequest | UpdateQuestionOptionRequest
        ];
      }
    }

    onUpdate(updatedQuestion);
  };

  const addOption = () => {
    const newOption: CreateQuestionOptionRequest | UpdateQuestionOptionRequest = {
      optionText: '',
      isCorrect: false,
      order: question.options.length + 1
    };

    updateQuestion({
      options: [...question.options, newOption]
    });
  };

  const updateOption = (optionIndex: number, updates: Partial<CreateQuestionOptionRequest | UpdateQuestionOptionRequest>) => {
    const updatedOptions = [...question.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], ...updates };

    // For single choice questions, ensure only one option is correct
    if (question.type === QuestionType.SingleChoice && updates.isCorrect === true) {
      updatedOptions.forEach((option, index) => {
        if (index !== optionIndex) {
          option.isCorrect = false;
        }
      });
    }

    updateQuestion({ options: updatedOptions });
  };

  const deleteOption = (optionIndex: number) => {
    if (question.options.length <= 2) {
      return; // Don't allow deletion if only 2 options remain
    }

    const updatedOptions = question.options.filter((_, index) => index !== optionIndex);
    // Reorder remaining options
    updatedOptions.forEach((option, index) => {
      option.order = index + 1;
    });

    updateQuestion({ options: updatedOptions });
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SingleChoice:
        return 'Single Choice';
      case QuestionType.MultipleChoice:
        return 'Multiple Choice';
      case QuestionType.TrueFalse:
        return 'True/False';
      case QuestionType.FillInTheBlank:
        return 'Fill in the Blank';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="question-editor">
      <div className="question-header">
        <div className="question-info">
          <h4>
            Question {index + 1}
            <span className="question-type-label">
              ({getQuestionTypeLabel(question.type)})
            </span>
          </h4>
        </div>

        <div className="question-controls">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▼' : '▲'}
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="Move up"
          >
            ↑
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="Move down"
          >
            ↓
          </button>

          <button
            type="button"
            className="btn-icon delete-question-btn"
            onClick={onDelete}
            disabled={!canDelete}
            title="Delete question"
          >
            🗑️
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="question-content">
          {/* Question Text */}
          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              value={question.questionText}
              onChange={(e) => updateQuestion({ questionText: e.target.value })}
              placeholder="Enter your question"
              required
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Question Settings */}
          <div className="form-row">
            <div className="form-group">
              <label>Question Type *</label>
              <select
                value={question.type}
                onChange={(e) => updateQuestion({ type: Number(e.target.value) as QuestionType })}
                required
              >
                <option value={QuestionType.SingleChoice}>Single Choice</option>
                <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                <option value={QuestionType.TrueFalse}>True/False</option>
                <option value={QuestionType.FillInTheBlank}>Fill in the Blank</option>
              </select>
            </div>

            <div className="form-group">
              <label>Points *</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => updateQuestion({ points: Number(e.target.value) })}
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="form-group">
            <label>Explanation (optional)</label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion({ explanation: e.target.value })}
              placeholder="Provide an explanation for the correct answer"
              rows={2}
            />
          </div>

          {/* Fill in the Blank - Correct Answer */}
          {question.type === QuestionType.FillInTheBlank && (
            <div className="form-group">
              <label>Correct Answer *</label>
              <input
                type="text"
                value={question.correctAnswer || ''}
                onChange={(e) => updateQuestion({ correctAnswer: e.target.value })}
                placeholder="Enter the correct answer"
                required
              />
            </div>
          )}

          {/* Multiple Choice Options */}
          {(question.type === QuestionType.SingleChoice ||
            question.type === QuestionType.MultipleChoice ||
            question.type === QuestionType.TrueFalse) && (
            <div className="options-section">
              <div className="options-header">
                <label>Options</label>
                {question.type !== QuestionType.TrueFalse && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={addOption}>
                    Add Option
                  </button>
                )}
              </div>

              <div className="options-list">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-editor">
                    <div className="option-input-group">
                      <input
                        type={question.type === QuestionType.SingleChoice ? 'radio' : 'checkbox'}
                        name={`question-${index}-correct`}
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(optionIndex, { isCorrect: e.target.checked })}
                      />

                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => updateOption(optionIndex, { optionText: e.target.value })}
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                        maxLength={500}
                        className="option-text-input"
                      />

                      {question.type !== QuestionType.TrueFalse && question.options.length > 2 && (
                        <button
                          type="button"
                          className="btn-icon delete-option-btn"
                          onClick={() => deleteOption(optionIndex)}
                          title="Delete option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {question.type === QuestionType.SingleChoice && (
                <p className="help-text">Select exactly one correct option.</p>
              )}
              {question.type === QuestionType.MultipleChoice && (
                <p className="help-text">Select one or more correct options.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;