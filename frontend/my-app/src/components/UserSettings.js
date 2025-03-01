import React, { useState, useEffect } from 'react';
import { 
  areBrowserNotificationsSupported, 
  hasNotificationPermission, 
  requestNotificationPermission,
  toggleNotifications,
  areNotificationsEnabled
} from '../utils/notificationUtils';

const UserSettings = () => {
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    setNotificationsSupported(areBrowserNotificationsSupported());
    
    // Check current notification status
    setNotificationsEnabled(areNotificationsEnabled());
  }, []);

  const handleToggleNotifications = async () => {
    const newStatus = !notificationsEnabled;
    
    // If turning on notifications and don't have permission, request it
    if (newStatus && !hasNotificationPermission()) {
      const permission = await requestNotificationPermission();
      
      // Update UI based on permission result
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Show confirmation notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive notifications from POLYCON.',
          icon: '/favicon.ico'
        });
      } else {
        setNotificationsEnabled(false);
      }
    } else {
      // If already have permission or turning off, just toggle
      const enabled = await toggleNotifications(newStatus);
      setNotificationsEnabled(enabled);
    }
  };

  if (!notificationsSupported) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium">Notifications</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your browser does not support notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Browser Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">
            Receive notifications even when browser is in background
          </p>
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={notificationsEnabled}
            onChange={handleToggleNotifications}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};

export default UserSettings;
