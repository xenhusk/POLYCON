import React, { useState, useEffect } from 'react';
import { debugBrowserNotification } from '../utils/notificationUtils';

const NotificationDebugger = () => {
  const [permission, setPermission] = useState('unknown');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [supportsNotifications, setSupportsNotifications] = useState(false);
  
  useEffect(() => {
    // Check notification support
    const hasSupport = 'Notification' in window;
    setSupportsNotifications(hasSupport);
    
    if (hasSupport) {
      setPermission(Notification.permission);
      setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
    }
  }, []);
  
  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        localStorage.setItem('notificationsEnabled', 'true');
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };
  
  const testNotification = () => {
    debugBrowserNotification('Test Notification', 'This is a direct browser notification test.');
  };
  
  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    localStorage.setItem('notificationsEnabled', newValue.toString());
    setNotificationsEnabled(newValue);
  };

  if (!supportsNotifications) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        Browser notifications are not supported in this browser.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-bold mb-4">Notification Debugger</h2>
      
      <div className="mb-4">
        <p>
          <span className="font-medium">Permission status:</span> 
          <span className={`ml-2 ${
            permission === 'granted' ? 'text-green-600' : 
            permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {permission}
          </span>
        </p>
        <p>
          <span className="font-medium">Notifications enabled in localStorage:</span> 
          <span className={`ml-2 ${notificationsEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {notificationsEnabled ? 'Yes' : 'No'}
          </span>
        </p>
        <p>
          <span className="font-medium">Page visibility:</span> 
          <span className="ml-2">
            {document.visibilityState}
          </span>
        </p>
      </div>
      
      <div className="flex flex-col space-y-2">
        {permission !== 'granted' && (
          <button 
            onClick={requestPermission}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Request Permission
          </button>
        )}
        
        {permission === 'granted' && (
          <>
            <button 
              onClick={testNotification}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Test Direct Notification
            </button>
            
            <button 
              onClick={toggleNotifications}
              className={`${notificationsEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white py-2 px-4 rounded mt-2`}
            >
              {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDebugger;
