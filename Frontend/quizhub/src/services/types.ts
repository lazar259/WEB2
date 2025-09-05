// API Request and Response Types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: string; // Base64 encoded string
  profilePictureName: string; // Original filename
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}