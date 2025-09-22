import { getUserInfoFromToken, getAuthToken } from '../utils/jwt';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7287/api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  profilePicture?: string; // Base64 encoded image
  userType: 'admin' | 'user';
}

class UserService {
  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  }

  /**
   * Get current user profile information from JWT token
   * This method extracts user info from the stored JWT token
   */
  getCurrentUserFromToken(): UserProfile | null {
    const token = getAuthToken();
    if (!token) return null;

    const userInfo = getUserInfoFromToken(token);
    if (!userInfo) return null;

    return {
      id: parseInt(userInfo.id),
      username: userInfo.username,
      email: userInfo.email,
      userType: userInfo.userType,
      // Note: ProfilePicture is not stored in JWT, needs to be fetched separately
    };
  }

  /**
   * Fetch complete user profile including profile picture from stored user data
   */
  async getUserProfile(userId?: number): Promise<UserProfile | null> {
    try {
      // First try to get user data from localStorage (stored during login)
      const storedUserData = authService.getUserData();

      if (storedUserData) {
        // Convert UserType enum to string
        const userTypeString = storedUserData.userType === 0 ? 'user' : 'admin';

        return {
          id: storedUserData.id,
          username: storedUserData.username,
          email: storedUserData.email,
          userType: userTypeString as 'admin' | 'user',
          profilePicture: storedUserData.profilePicture
        };
      }

      // Fallback to token-based user info (without profile picture)
      const tokenUser = this.getCurrentUserFromToken();
      if (!tokenUser) return null;

      return {
        ...tokenUser,
        profilePicture: undefined
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get profile picture as data URL for display
   * This method converts base64 to data URL format for img src
   */
  getProfilePictureUrl(base64Data?: string): string | null {
    if (!base64Data) return null;

    // If it's already a data URL, return it
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }

    // Convert base64 to data URL (assuming JPEG format)
    return `data:image/jpeg;base64,${base64Data}`;
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;