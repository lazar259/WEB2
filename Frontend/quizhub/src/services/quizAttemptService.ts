import {
  StartQuizRequest,
  SubmitAnswerRequest,
  QuizSessionResponse,
  QuizAttemptResponse,
  RankingEntryResponse,
  ApiError
} from './types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7287/api';

class QuizAttemptService {
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

      // Handle no-content responses
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

  // Start a new quiz attempt
  async startQuiz(request: StartQuizRequest): Promise<QuizSessionResponse | ApiError> {
    console.log('Starting quiz:', request);
    const response = await this.makeRequest<QuizSessionResponse>('/quizattempt/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    console.log('Start quiz response:', response);
    return response;
  }

  // Submit an answer for a question
  async submitAnswer(
    attemptId: number,
    request: SubmitAnswerRequest
  ): Promise<QuizAttemptResponse | ApiError> {
    console.log('Submitting answer:', { attemptId, request });
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    console.log('Submit answer response:', response);
    return response;
  }

  // Complete the quiz attempt
  async completeQuiz(attemptId: number): Promise<QuizAttemptResponse | ApiError> {
    console.log('Completing quiz:', attemptId);
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/${attemptId}/complete`, {
      method: 'POST',
    });
    console.log('Complete quiz response:', response);
    return response;
  }

  // Get active quiz session
  async getActiveSession(attemptId: number): Promise<QuizSessionResponse | ApiError> {
    console.log('Getting active session:', attemptId);
    const response = await this.makeRequest<QuizSessionResponse>(`/quizattempt/${attemptId}/session`);
    console.log('Get active session response:', response);
    return response;
  }

  // Get user's quiz attempts
  async getMyAttempts(): Promise<QuizAttemptResponse[] | ApiError> {
    console.log('Getting my attempts');
    const response = await this.makeRequest<QuizAttemptResponse[]>('/quizattempt/my-attempts');
    console.log('Get my attempts response:', response);
    return response;
  }

  // Get quiz attempt results
  async getAttemptResults(attemptId: number): Promise<QuizAttemptResponse | ApiError> {
    console.log('Getting attempt results:', attemptId);
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/${attemptId}/results`);
    console.log('Get attempt results response:', response);
    return response;
  }

  // Get global rankings
  async getGlobalRankings(quizId?: number, timePeriod?: string): Promise<RankingEntryResponse[] | ApiError> {
    console.log('Getting global rankings:', { quizId, timePeriod });
    const params = new URLSearchParams();
    if (quizId) params.append('quizId', quizId.toString());
    if (timePeriod) params.append('timePeriod', timePeriod);

    const endpoint = `/quizattempt/rankings${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.makeRequest<RankingEntryResponse[]>(endpoint);
    console.log('Get global rankings response:', response);
    return response;
  }

  // Delete quiz attempt
  async deleteAttempt(attemptId: number): Promise<{} | ApiError> {
    console.log('Deleting quiz attempt:', attemptId);
    const response = await this.makeRequest<{}>(`/quizattempt/${attemptId}`, {
      method: 'DELETE',
    });
    console.log('Delete attempt response:', response);
    return response;
  }

  // Get all attempts (admin only)
  async getAllAttempts(): Promise<QuizAttemptResponse[] | ApiError> {
    console.log('Getting all quiz attempts (admin)');
    const response = await this.makeRequest<QuizAttemptResponse[]>('/quizattempt/admin/all-attempts');
    console.log('Get all attempts response:', response);
    return response;
  }
}

// Create and export singleton instance
const quizAttemptService = new QuizAttemptService();
export default quizAttemptService;