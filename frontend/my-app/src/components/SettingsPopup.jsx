import React from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPopup = ({ isVisible, onClose, position }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    
    // Close the settings popup
    onClose();
    
    // Navigate to home page
    navigate('/');
    
    // Force a page refresh to clear any remaining state
    window.location.reload();
  };

  const handleChangePassword = () => {
    // Implement password change logic
    console.log('Change password clicked');
  };

  const handle2FA = () => {
    // Implement 2FA logic
    console.log('2FA clicked');
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
            onClick={handleChangePassword}
            className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Change Password
          </button>
          <button 
            onClick={handle2FA}
            className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Enable 2FA
          </button>
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
    </>
  );
};

export default SettingsPopup;
