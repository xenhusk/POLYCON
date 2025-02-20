import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordResetModal from './PasswordResetModal';

const SettingsPopup = ({ isVisible, onClose, position, userEmail, onLogout }) => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Use fallback from localStorage in case userEmail prop is undefined
  const effectiveEmail = userEmail || localStorage.getItem('userEmail');

  const handleLogout = () => {
    // Clear localStorage and update global logout state if needed
    localStorage.clear();    
    onClose();
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/');
    // Removed window.location.reload();
  };

  const handleChangePassword = async (currentPassword) => {
    console.log("Using email:", effectiveEmail);
    if (!effectiveEmail) {
      alert("User email is missing.");
      return;
    }
    try {
      console.log('Attempting to send password reset request...'); // Debug log
      const response = await fetch('http://localhost:5001/account/reset_password', {  // Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: effectiveEmail, password: currentPassword })
      });
      
      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (response.ok) {
        alert('Password reset email sent successfully.');
        setShowPasswordModal(false);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password reset error:', error); // Debug log
      alert(`Error: ${error.message}`);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      
      {/* Settings Popup */}
      <div 
        className="absolute bg-white rounded-lg shadow-lg w-48 py-2 z-50"
        style={{
          top: position.top,
          left: position.left
        }}
      >
        {/* Security Section */}
        <div className="px-4 py-2">
          <p className="text-sm font-semibold text-gray-500">Security</p>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Change Password
          </button>
          {/* Removed 2FA button */}
          {/* 
          <button 
            onClick={handle2FA}
            className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Enable 2FA
          </button>
          */}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-200 my-2" />

        {/* Logout Section */}
        <button 
          onClick={handleLogout}
          className="w-full text-left px-6 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isVisible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={userEmail}
        onSubmit={handleChangePassword}
      />
    </>
  );
};

export default SettingsPopup;
