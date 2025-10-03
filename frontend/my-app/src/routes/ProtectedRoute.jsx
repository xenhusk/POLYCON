import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, getUserRole, hasRole, getRoleBasedRedirect } from "../utils/authUtils";

/**
 * Centralized route guard.
 * - Checks authentication via localStorage flag or userEmail presence
 * - Optionally enforces role(s)
 * - Provides loading state during authentication check
 */
const ProtectedRoute = ({ roles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const role = getUserRole();
      
      setIsAuthed(authenticated);
      setUserRole(role);
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0 && !hasRole(roles)) {
    // If role mismatch, send to appropriate dashboard based on role
    const redirectPath = getRoleBasedRedirect();
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


