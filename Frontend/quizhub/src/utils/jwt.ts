// JWT token utilities for parsing and validating tokens

interface JWTPayload {
  sub?: string; // subject (user ID)
  email?: string;
  username?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string; // Microsoft ClaimTypes.Role
  iat?: number; // issued at
  exp?: number; // expires at
  // Allow any additional fields
  [key: string]: any;
}

/**
 * Decode JWT token payload without verification
 * Note: This is for client-side parsing only. Server should always verify tokens.
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode from base64
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    const parsed = JSON.parse(decodedPayload) as JWTPayload;
    
    return parsed;
  } catch (error) {
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Convert exp from seconds to milliseconds and compare with current time
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

/**
 * Get user type from JWT token
 */
export const getUserTypeFromToken = (token: string): 'admin' | 'user' | null => {
  const payload = decodeJWT(token);

  if (!payload) {
    return null;
  }

  // Get user type from Microsoft ClaimTypes.Role
  const userType = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  // Normalize the value to lowercase and check if it's valid
  if (typeof userType === 'string') {
    const normalizedType = userType.toLowerCase();
    if (normalizedType === 'admin' || normalizedType === 'user' || normalizedType === 'student') {
      // Map 'student' to 'user' for backward compatibility
      return normalizedType === 'student' ? 'user' : normalizedType as 'admin' | 'user';
    }
  }

  return null;
};

/**
 * Get user info from JWT token
 */
export const getUserInfoFromToken = (token: string): {
  id: string;
  email: string;
  username: string;
  userType: 'admin' | 'user'
} | null => {
  const payload = decodeJWT(token);
  if (!payload) return null;

  const userType = getUserTypeFromToken(token);
  
  // Check if all required fields are present
  if (!payload.sub || !payload.email || !payload.username || !userType) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
    userType: userType
  };
};

/**
 * Check if user is authenticated and token is valid
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Get the stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Clear the stored auth token
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Store auth token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};