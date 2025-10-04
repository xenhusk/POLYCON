import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { isAuthenticated, getUserRole, getUserEmail, hasRole } from '../utils/authUtils';

/**
 * Component for testing authentication functionality
 * This can be used during development to verify auth is working correctly
 */
const AuthTest = () => {
  const { isAuthenticated: hookAuth, userRole, userEmail, isLoading } = useAuth();

  const handleTestAuth = () => {
    console.log('=== Authentication Test Results ===');
    console.log('Hook - isAuthenticated:', hookAuth);
    console.log('Hook - userRole:', userRole);
    console.log('Hook - userEmail:', userEmail);
    console.log('Hook - isLoading:', isLoading);
    
    console.log('Utility - isAuthenticated():', isAuthenticated());
    console.log('Utility - getUserRole():', getUserRole());
    console.log('Utility - getUserEmail():', getUserEmail());
    console.log('Utility - hasRole("student"):', hasRole('student'));
    console.log('Utility - hasRole("faculty"):', hasRole('faculty'));
    console.log('Utility - hasRole("admin"):', hasRole('admin'));
    
    console.log('localStorage keys:');
    console.log('- userEmail:', localStorage.getItem('userEmail'));
    console.log('- userRole:', localStorage.getItem('userRole'));
    console.log('- isAuthenticated:', localStorage.getItem('isAuthenticated'));
    console.log('================================');
  };

  if (!isAuthenticated()) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Test</h3>
        <p className="text-yellow-700">User is not authenticated. Please log in to test authentication features.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Authentication Test</h3>
      <div className="space-y-2 text-green-700">
        <p><strong>Status:</strong> Authenticated ✓</p>
        <p><strong>Role:</strong> {userRole || 'Unknown'}</p>
        <p><strong>Email:</strong> {userEmail || 'Unknown'}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      </div>
      <button
        onClick={handleTestAuth}
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Test Authentication (Check Console)
      </button>
    </div>
  );
};

export default AuthTest;
