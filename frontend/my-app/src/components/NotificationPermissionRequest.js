import React, { useEffect, useState } from 'react';
import { requestNotificationPermission, areBrowserNotificationsSupported, fixNotificationPreferences } from '../utils/notificationUtils';

const NotificationPermissionRequest = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Create a debugging logger function for notification permissions
    const logNotificationState = () => {
      const permission = 'Notification' in window ? Notification.permission : 'API not supported';
      const enabled = localStorage.getItem('notificationsEnabled') === 'true';
      
      console.log('📱 Notification permission state:', {
        browserPermission: permission,
        localStorageEnabled: enabled,
        dismissed: localStorage.getItem('notificationRequestDismissed') === 'true'
      });
    };
    
    // Log current state and fix any inconsistencies
    logNotificationState();
    fixNotificationPreferences();
    
    const checkPermissions = async () => {
      if (!areBrowserNotificationsSupported()) return;
      
      const permission = Notification.permission;
      const dismissed = localStorage.getItem('notificationRequestDismissed') === 'true';
      
      if (permission !== 'granted' && permission !== 'denied' && !dismissed) {
        setShowPrompt(true);
      } else if (permission === 'granted') {
        localStorage.setItem('notificationsEnabled', 'true');
        console.log('📱 Permission is already granted, updated localStorage');
      }
    };
    
    // Add a small delay to let other components initialize
    setTimeout(checkPermissions, 1000);
  }, []);

  const handleAllow = async () => {
    const result = await requestNotificationPermission();
    setShowPrompt(false);
    if (result === 'granted') {
      // Force update localStorage to make sure it's correct
      localStorage.setItem('notificationsEnabled', 'true');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationRequestDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-medium text-lg text-gray-800">Enable Notifications</h3>
      <p className="text-gray-600 mb-3">
        Get notified about upcoming appointments and important updates.
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleDismiss}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Not Now
        </button>
        <button
          onClick={handleAllow}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Allow Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPermissionRequest;
