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
    const response = await this.makeRequest<QuizSessionResponse>('/quizattempt/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  // Submit an answer for a question
  async submitAnswer(
    attemptId: number,
    request: SubmitAnswerRequest
  ): Promise<QuizAttemptResponse | ApiError> {
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  // Complete the quiz attempt
  async completeQuiz(attemptId: number): Promise<QuizAttemptResponse | ApiError> {
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/${attemptId}/complete`, {
      method: 'POST',
    });
    return response;
  }

  // Get active quiz session
  async getActiveSession(attemptId: number): Promise<QuizSessionResponse | ApiError> {
    const response = await this.makeRequest<QuizSessionResponse>(`/quizattempt/${attemptId}/session`);
    return response;
  }

  // Get user's quiz attempts
  async getMyAttempts(): Promise<QuizAttemptResponse[] | ApiError> {
    const response = await this.makeRequest<QuizAttemptResponse[]>('/quizattempt/my-attempts');
    return response;
  }

  // Get quiz attempt results
  async getAttemptResults(attemptId: number): Promise<QuizAttemptResponse | ApiError> {
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/${attemptId}/results`);
    return response;
  }

  // Get global rankings
  async getGlobalRankings(quizId?: number, timePeriod?: string): Promise<RankingEntryResponse[] | ApiError> {
    const params = new URLSearchParams();
    if (quizId) params.append('quizId', quizId.toString());
    if (timePeriod) params.append('timePeriod', timePeriod);

    const endpoint = `/quizattempt/rankings${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.makeRequest<RankingEntryResponse[]>(endpoint);
    return response;
  }

  // Delete quiz attempt
  async deleteAttempt(attemptId: number): Promise<{} | ApiError> {
    const response = await this.makeRequest<{}>(`/quizattempt/${attemptId}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Get all attempts (admin only)
  async getAllAttempts(): Promise<QuizAttemptResponse[] | ApiError> {
    const response = await this.makeRequest<QuizAttemptResponse[]>('/quizattempt/admin/all-attempts');
    return response;
  }

  // Get quiz attempt results (admin only - no ownership check)
  async getAttemptResultsAdmin(attemptId: number): Promise<QuizAttemptResponse | ApiError> {
    const response = await this.makeRequest<QuizAttemptResponse>(`/quizattempt/admin/${attemptId}/results`);
    return response;
  }
}

// Create and export singleton instance
const quizAttemptService = new QuizAttemptService();
export default quizAttemptService;