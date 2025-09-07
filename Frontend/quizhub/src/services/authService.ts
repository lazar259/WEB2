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

      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          return {
            success: false,
            message: "Invalid username or password",
            errors: undefined,
          };
        }

        let errorMessage;
        let errors;
        try {
          // First try to parse as JSON
          const data = await response.json();
          errorMessage = data.message || data.title || data.error || `HTTP ${response.status}: ${response.statusText}`;
          errors = data.errors;
        } catch {
          // If not JSON, get as plain text
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
        };
      }

      const data = await response.json();

      // Success case: wrap the API response with success flag
      return {
        success: true,
        message: 'Request successful',
        token: data.token,
        user: data.user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse | ApiError> {
    console.log('Login attempt:', credentials);
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('Login response:', response);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse | ApiError> {
    console.log('Registration attempt:', userData);
    // Send as JSON since .NET Core API expects [FromBody]
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log('Registration response:', response);
    return response;
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

// Create and export singleton instance
const authService = new AuthService();
export default authService;