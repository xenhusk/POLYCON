import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordResetModal from './PasswordResetModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  areBrowserNotificationsSupported, 
  hasNotificationPermission,
  requestNotificationPermission,
  areNotificationsEnabled,
  toggleNotifications,
  areSoundNotificationsEnabled,
  toggleSoundNotifications,
  showAppointmentReminder
} from '../utils/notificationUtils';

const SettingsPopup = ({ isVisible, onClose, position, userEmail, onLogout }) => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Notification states
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize notification states
  useEffect(() => {
    if (isVisible) {
      setNotificationsSupported(areBrowserNotificationsSupported());
      setNotificationsEnabled(areNotificationsEnabled());
      setSoundEnabled(areSoundNotificationsEnabled());
    }
  }, [isVisible]);

  // Effect to prevent background scrolling when modal is open
  useEffect(() => {
    if (isVisible || showPasswordModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible, showPasswordModal]);

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
  };

  // New handler for Change Password click
  const handleChangePasswordClick = () => {
    setShowPasswordModal(true); // Show password modal first
    onClose(); // Then close settings popup
  };
  
  // Handle close for password modal
  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  // Notification handlers
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // User wants to enable notifications
      if (!hasNotificationPermission()) {
        // Need to request permission first
        const permission = await requestNotificationPermission();
        
        if (permission === 'granted') {
          const result = toggleNotifications(true);
          setNotificationsEnabled(result);
        } else {
          setNotificationsEnabled(false);
        }
      } else {
        // Already have permission, just enable
        const result = toggleNotifications(true);
        setNotificationsEnabled(result);
      }
    } else {
      // User wants to disable notifications
      const result = toggleNotifications(false);
      setNotificationsEnabled(result);
    }
  };

  const handleToggleSounds = () => {
    const newStatus = !soundEnabled;
    toggleSoundNotifications(newStatus);
    setSoundEnabled(newStatus);
  };

  const testNotification = () => {
    showAppointmentReminder({
      teacher: 'Dr. John Smith',
      student: 'You',
      timeUntil: '5 minutes',
      venue: 'Room 101'
    });
  };

  if (!isVisible && !showPasswordModal) return null;

  return (
    <>
      {/* Backdrop - only apply darkening and blur on mobile */}
      <div 
        className={`fixed inset-0 z-[999] ${isMobile ? "bg-black bg-opacity-60 backdrop-blur-sm" : ""}`}
        onClick={showPasswordModal ? handleClosePasswordModal : onClose}
        style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
      />
      
      {/* Settings Popup - Only shown when isVisible is true */}
      {isVisible && (isMobile ? (
        // Mobile: Bottom sheet style popup
        <div className="fixed inset-x-0 bottom-0 z-[1000]">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white rounded-t-xl shadow-lg w-full py-4"
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Settings Options */}
            <div className="py-2">
              {/* Security Section */}
              <div className="px-6 py-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Security</p>
                <button 
                  onClick={handleChangePasswordClick}
                  className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-gray-200 my-2" />

              {/* Notifications Section */}
              {notificationsSupported && (
                <>
                  <div className="px-6 py-2">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Notifications</p>
                    
                    {/* Browser Notifications Toggle */}
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6z" />
                        </svg>
                        <div>
                          <span className="text-base text-gray-700">Desktop Alerts</span>
                          <p className="text-xs text-gray-500">System tray notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsEnabled}
                          onChange={handleToggleNotifications}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0065A8]"></div>
                      </label>
                    </div>

                    {/* Sound Notifications Toggle */}
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 11.293a3 3 0 010 4.414m2.828-7.071a7 7 0 010 9.899M9 9a3 3 0 015.196 2M9 9V7a1 1 0 011-1h4a1 1 0 011 1v2M9 9H7a1 1 0 00-1 1v6a1 1 0 001 1h2m2-8a3 3 0 115.196 2m-5.196-2H9" />
                        </svg>
                        <div>
                          <span className="text-base text-gray-700">Sound Alerts</span>
                          <p className="text-xs text-gray-500">Play notification sounds</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={soundEnabled}
                          onChange={handleToggleSounds}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0065A8]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-gray-200 my-2" />
                </>
              )}

              {/* Logout Section */}
              <div className="px-6 py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base text-red-600 hover:bg-red-50 active:bg-red-100 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // Desktop: Small dropdown at the specified position
        <div 
          className="fixed bg-white rounded-lg shadow-lg w-64 py-2 z-[1000]"
          style={{ 
            top: Math.max(20, Math.min(position.top, window.innerHeight - 320)), 
            left: Math.max(20, Math.min(position.left, window.innerWidth - 280))
          }}
        >
          {/* Security Section */}
          <div className="px-4 py-2">
            <p className="text-sm font-semibold text-gray-500">Security</p>
            <button 
              onClick={handleChangePasswordClick}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </button>
          </div>

          {/* Notifications Section */}
          {notificationsSupported && (
            <>
              {/* Divider */}
              <div className="h-[1px] bg-gray-200 my-2" />
              
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-gray-500">Notifications</p>
                
                {/* Browser Notifications Toggle */}
                <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6z" />
                    </svg>
                    <span className="text-sm text-gray-700">Desktop</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={handleToggleNotifications}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0065A8]"></div>
                  </label>
                </div>

                {/* Sound Notifications Toggle */}
                <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 11.293a3 3 0 010 4.414m2.828-7.071a7 7 0 010 9.899M9 9a3 3 0 015.196 2M9 9V7a1 1 0 011-1h4a1 1 0 011 1v2M9 9H7a1 1 0 00-1 1v6a1 1 0 001 1h2m2-8a3 3 0 115.196 2m-5.196-2H9" />
                    </svg>
                    <span className="text-sm text-gray-700">Sound</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={handleToggleSounds}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0065A8]"></div>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="h-[1px] bg-gray-200 my-2" />

          {/* Logout Section */}
          <button 
            onClick={handleLogout}
            className="w-full text-left px-7 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      ))}      {/* Password Reset Modal - No separate backdrop needed */}
      {showPasswordModal && (
        <PasswordResetModal
          isVisible={showPasswordModal}
          onClose={handleClosePasswordModal}
          userEmail={userEmail}
        />
      )}
    </>
  );
};

export default SettingsPopup;
