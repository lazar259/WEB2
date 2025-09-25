import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserTypeFromToken, getAuthToken } from '../../utils/jwt';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const GuestRoute = ({
  children,
  redirectTo
}: GuestRouteProps) => {
  // Check if user is authenticated
  if (isAuthenticated()) {
    // If user is authenticated, redirect them to their appropriate dashboard
    const token = getAuthToken();
    if (token) {
      const userType = getUserTypeFromToken(token);
      if (userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userType === 'user') {
        return <Navigate to="/user/dashboard" replace />;
      }
    }

    // Fallback redirect if provided, otherwise to home
    return <Navigate to={redirectTo || "/"} replace />;
  }

  // User is not authenticated, show the guest content (login/register)
  return <>{children}</>;
};

export default GuestRoute;