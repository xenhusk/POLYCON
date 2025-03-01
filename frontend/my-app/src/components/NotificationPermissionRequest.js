import React, { useState, useEffect } from 'react';
import { 
  areBrowserNotificationsSupported, 
  hasNotificationPermission, 
  requestNotificationPermission 
} from '../utils/notificationUtils';
import { motion } from 'framer-motion';

const NotificationPermissionRequest = ({ onClose }) => {
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    // Check if we should show notification permission request
    const shouldShowRequest = () => {
      // Don't show if browser doesn't support notifications
      if (!areBrowserNotificationsSupported()) return false;
      
      // Don't show if permission already granted
      if (hasNotificationPermission()) return false;
      
      // Don't show if user has explicitly declined before
      if (localStorage.getItem('notificationRequestDismissed') === 'true') return false;
      
      // Don't show if user has previously denied via browser
      if (Notification.permission === 'denied') return false;
      
      return true;
    };

    // Set initial state
    setShowRequest(shouldShowRequest());
  }, []);

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      // Show a test notification
      new Notification('Notifications enabled!', {
        body: 'You will now receive notifications from POLYCON.',
        icon: '/favicon.ico'
      });
    }
    
    setShowRequest(false);
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationRequestDismissed', 'true');
    setShowRequest(false);
    if (onClose) onClose();
  };

  if (!showRequest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white rounded-lg shadow-lg p-4 z-50"
    >
      <h3 className="text-lg font-semibold mb-2">Enable Notifications</h3>
      <p className="text-gray-600 text-sm mb-4">
        Get notified about new appointments, confirmations, and other important updates.
      </p>
      <div className="flex space-x-2">
        <button
          onClick={handleRequestPermission}
          className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
        >
          Not Now
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationPermissionRequest;
