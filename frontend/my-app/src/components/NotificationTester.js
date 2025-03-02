import React, { useState } from 'react';
import {
  debugNotificationSupport,
  showNotification,
  requestNotificationPermission,
  areNotificationsEnabled,
  toggleNotifications
} from '../utils/notificationUtils';

const testImageUrl = () => {
  const paths = [
    '/polyconLogo.png', 
    '/logo192.png',  // Default React logo
    '/favicon.ico'   // Default favicon
  ];
  
  const results = [];
  
  for (const path of paths) {
    const img = new Image();
    img.onload = () => {
      results.push({ path, status: 'loaded', width: img.width, height: img.height });
      console.log(`Image loaded: ${path}`, { width: img.width, height: img.height });
    };
    img.onerror = () => {
      results.push({ path, status: 'error' });
      console.log(`Failed to load image: ${path}`);
    };
    img.src = path;
  }
  
  return results;
};

const NotificationTester = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(areNotificationsEnabled());
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification from POLYCON');

  const runDebug = () => {
    const info = debugNotificationSupport();
    setDebugInfo(info);
  };

  const requestPermission = async () => {
    const result = await requestNotificationPermission();
    runDebug();
    alert(`Permission request result: ${result}`);
  };

  const sendTestNotification = () => {
    // Test if images load without creating notifications
    testImageUrl();
    
    // Default to only sending one notification
    const options = {
      body: testBody,
      requireInteraction: true,
      forceNotification: true,
      icon: '/polyconLogo.png' // Use the confirmed working icon
    };
    
    console.log('Sending notification with options:', options);
    
    const notification = showNotification(testTitle, options);
    
    if (!notification) {
      console.error('Failed to show notification');
      alert('Failed to show notification. Check console for details.');
    } else {
      console.log('Notification sent successfully');
    }
  };

  // Add a new advanced testing function
  const sendMultipleTestNotifications = () => {
    // For advanced testing only
    const iconOptions = [
      { icon: '/polyconLogo.png' },
      { icon: '/favicon.ico' },
      { icon: null } // Default
    ];
    
    alert('Sending multiple test notifications with different icons...');
    
    // Send multiple notifications with different options
    iconOptions.forEach((iconOption, index) => {
      setTimeout(() => {
        const options = {
          body: `${testBody} (Test ${index + 1})`,
          requireInteraction: true,
          forceNotification: true,
          ...iconOption
        };
        
        showNotification(`${testTitle} ${index + 1}`, options);
      }, index * 1000); // Stagger the notifications
    });
  };

  const handleToggleNotifications = async () => {
    const newStatus = !notificationEnabled;
    const result = await toggleNotifications(newStatus);
    setNotificationEnabled(result);
    runDebug();
  };

  const resetNotificationSettings = () => {
    localStorage.removeItem('notificationsEnabled');
    localStorage.removeItem('notificationRequestDismissed');
    runDebug();
    alert('Notification settings reset. Refresh the page to see changes.');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">Notification Troubleshooter</h2>
      
      <div className="mb-4">
        <button 
          onClick={runDebug}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full"
        >
          Debug Notification Support
        </button>
        
        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono overflow-auto">
            <h3 className="font-bold">Debug Info:</h3>
            <div>Supported: {debugInfo.supported ? 'Yes' : 'No'}</div>
            <div>Permission: {debugInfo.permission}</div>
            <div>Page Visibility: {debugInfo.visibility}</div>
            <div>Notifications Enabled: {debugInfo.localStorage.notificationsEnabled}</div>
            <div>Request Dismissed: {debugInfo.localStorage.notificationRequestDismissed}</div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={requestPermission}
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Request Notification Permission
          </button>
        </div>
        
        <div>
          <button 
            onClick={handleToggleNotifications}
            className={`${notificationEnabled ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded w-full`}
          >
            {notificationEnabled ? 'Disable' : 'Enable'} Notifications
          </button>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">Test Notification</h3>
          
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Title:</label>
            <input 
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Message:</label>
            <textarea
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              className="w-full border rounded p-2"
              rows="2"
            />
          </div>
          
          <button 
            onClick={sendTestNotification}
            className="bg-purple-500 text-white px-4 py-2 rounded w-full"
          >
            Send Test Notification
          </button>
        </div>
        
        <div className="mt-2">
          <button 
            onClick={sendMultipleTestNotifications}
            className="bg-yellow-500 text-white px-4 py-2 rounded w-full"
          >
            Advanced: Test Multiple Notifications
          </button>
        </div>
        
        <div className="border-t pt-4">
          <button 
            onClick={resetNotificationSettings}
            className="bg-gray-500 text-white px-4 py-2 rounded w-full"
          >
            Reset Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationTester;
