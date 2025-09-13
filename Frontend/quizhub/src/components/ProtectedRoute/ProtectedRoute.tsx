import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserTypeFromToken, getAuthToken } from '../../utils/jwt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'admin' | 'user';
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  requiredUserType,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // If a specific user type is required, check it
  if (requiredUserType) {
    const token = getAuthToken();
    if (!token) {
      return <Navigate to={redirectTo} replace />;
    }

    const userType = getUserTypeFromToken(token);
    if (userType !== requiredUserType) {
      // Redirect to appropriate dashboard based on actual user type
      if (userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userType === 'user') {
        return <Navigate to="/user/dashboard" replace />;
      } else {
        // Unknown user type, redirect to home
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;