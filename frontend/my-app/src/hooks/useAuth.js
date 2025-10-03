import { useState, useEffect } from 'react';
import { isAuthenticated, getUserRole, getUserEmail, hasRole, logout } from '../utils/authUtils';

/**
 * Custom hook for authentication state management
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null,
    userEmail: null,
    isLoading: true
  });

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const role = getUserRole();
      const email = getUserEmail();

      setAuthState({
        isAuthenticated: authenticated,
        userRole: role,
        userEmail: email,
        isLoading: false
      });
    };

    checkAuth();
  }, []);

  const checkRole = (roles) => {
    return hasRole(roles);
  };

  const handleLogout = () => {
    logout();
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userEmail: null,
      isLoading: false
    });
  };

  return {
    ...authState,
    checkRole,
    logout: handleLogout
  };
};
