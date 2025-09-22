import {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizResponse,
  QuizSummaryResponse,
  DifficultyLevel,
  QuestionType,
  ApiError
} from './types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7287/api';

class QuizService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | ApiError> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage;
        let errors;
        try {
          const data = await response.json();
          errorMessage = data.message || data.title || data.error || `HTTP ${response.status}: ${response.statusText}`;
          errors = data.errors;
        } catch {
          try {
            const textResponse = await response.text();
            errorMessage = textResponse.trim() || `HTTP ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }

        return {
          success: false,
          message: errorMessage,
          errors: errors,
        } as ApiError;
      }

      // Handle no-content responses (like DELETE)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      } as ApiError;
    }
  }

  // Create a new quiz
  async createQuiz(quizData: CreateQuizRequest): Promise<QuizResponse | ApiError> {
    const response = await this.makeRequest<QuizResponse>('/quiz', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
    return response;
  }

  // Get all quizzes (for admin overview)
  async getAllQuizzes(): Promise<QuizSummaryResponse[] | ApiError> {
    const response = await this.makeRequest<QuizSummaryResponse[]>('/quiz');
    return response;
  }

  // Get active quizzes only
  async getActiveQuizzes(): Promise<QuizSummaryResponse[] | ApiError> {
    const response = await this.makeRequest<QuizSummaryResponse[]>('/quiz/active');
    return response;
  }

  // Get quizzes created by current user
  async getMyQuizzes(): Promise<QuizSummaryResponse[] | ApiError> {
    const response = await this.makeRequest<QuizSummaryResponse[]>('/quiz/my-quizzes');
    return response;
  }

  // Get quizzes with filters
  async getQuizzesByFilters(
    difficulty?: DifficultyLevel,
    topic?: string,
    isActive?: boolean
  ): Promise<QuizSummaryResponse[] | ApiError> {
    const params = new URLSearchParams();

    if (difficulty !== undefined) {
      params.append('difficulty', difficulty.toString());
    }
    if (topic !== undefined && topic.trim()) {
      params.append('topic', topic.trim());
    }
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }

    const queryString = params.toString();
    const endpoint = `/quiz/filter${queryString ? '?' + queryString : ''}`;

    const response = await this.makeRequest<QuizSummaryResponse[]>(endpoint);
    return response;
  }

  // Get a specific quiz by ID
  async getQuizById(id: number): Promise<QuizResponse | ApiError> {
    const response = await this.makeRequest<QuizResponse>(`/quiz/${id}`);
    return response;
  }

  // Update an existing quiz
  async updateQuiz(id: number, quizData: UpdateQuizRequest): Promise<QuizResponse | ApiError> {
    const response = await this.makeRequest<QuizResponse>(`/quiz/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
    return response;
  }

  // Delete a quiz
  async deleteQuiz(id: number): Promise<boolean | ApiError> {
    const response = await this.makeRequest<{}>(`/quiz/${id}`, {
      method: 'DELETE',
    });

    if ('success' in response && !response.success) {
      return response;
    }

    return true;
  }

  // Toggle quiz status (active/inactive)
  async toggleQuizStatus(id: number): Promise<boolean | ApiError> {
    const response = await this.makeRequest<{}>(`/quiz/${id}/toggle-status`, {
      method: 'PATCH',
    });

    if ('success' in response && !response.success) {
      return response;
    }

    return true;
  }

  // Helper method to get difficulty level display name
  getDifficultyDisplayName(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case DifficultyLevel.Easy:
        return 'Easy';
      case DifficultyLevel.Medium:
        return 'Medium';
      case DifficultyLevel.Hard:
        return 'Hard';
      default:
        return 'Unknown';
    }
  }

  // Helper method to get question type display name
  getQuestionTypeDisplayName(type: QuestionType): string {
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
  }

  // Helper method to validate quiz data before submission
  validateQuizData(quizData: CreateQuizRequest | UpdateQuizRequest): string[] {
    const errors: string[] = [];

    if (!quizData.title?.trim()) {
      errors.push('Quiz title is required');
    }

    if (!quizData.topic?.trim()) {
      errors.push('Quiz topic is required');
    }

    if (quizData.timeLimitInMinutes < 1) {
      errors.push('Time limit must be at least 1 minute');
    }

    if (!quizData.questions || quizData.questions.length === 0) {
      errors.push('At least one question is required');
    }

    quizData.questions?.forEach((question, index) => {
      if (!question.questionText?.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      if (question.points < 1) {
        errors.push(`Question ${index + 1}: Points must be at least 1`);
      }

      if (question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) {
        if (!question.options || question.options.length < 2) {
          errors.push(`Question ${index + 1}: At least 2 options are required for multiple choice questions`);
        }

        const correctOptions = question.options?.filter(opt => opt.isCorrect) || [];
        if (question.type === QuestionType.SingleChoice && correctOptions.length !== 1) {
          errors.push(`Question ${index + 1}: Exactly one correct option is required for single choice questions`);
        } else if (question.type === QuestionType.MultipleChoice && correctOptions.length === 0) {
          errors.push(`Question ${index + 1}: At least one correct option is required for multiple choice questions`);
        }
      }

      if (question.type === QuestionType.TrueFalse) {
        if (!question.options || question.options.length !== 2) {
          errors.push(`Question ${index + 1}: True/False questions must have exactly 2 options`);
        }
      }

      if (question.type === QuestionType.FillInTheBlank) {
        if (!question.correctAnswer?.trim()) {
          errors.push(`Question ${index + 1}: Correct answer is required for fill-in-the-blank questions`);
        }
      }
    });

    return errors;
  }
}

// Create and export singleton instance
const quizService = new QuizService();
export default quizService;