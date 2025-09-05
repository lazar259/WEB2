import { LoginRequest, RegisterRequest, AuthResponse, ApiError } from './types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7287/api';

class AuthService {
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<AuthResponse | ApiError> {
    try {
      // Only set Content-Type header if body is a string (JSON)
      const headers: HeadersInit = {};
      if (typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred',
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse | ApiError> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse | ApiError> {
    // Send as JSON since .NET Core API expects [FromBody]
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Helper method to convert File to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }

  // Helper method to save token to localStorage
  saveAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Helper method to get token from localStorage
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Helper method to remove token from localStorage
  removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }
}

// Export singleton instance
export default new AuthService();