import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { requestNotificationPermission, canUseSystemNotifications } from '../components/Toast';

const NotificationSettings = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setSystemNotificationsEnabled(canUseSystemNotifications());
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(Notification.permission);
    setSystemNotificationsEnabled(granted);
    
    if (granted) {
      showSuccess('Permission Granted', 'System notifications are now enabled!', 5000, true, true);
    } else {
      showError('Permission Denied', 'System notifications are disabled. You can enable them in your browser settings.', 8000, true, false);
    }
  };

  const testNotifications = () => {
    // Test different types of notifications
    setTimeout(() => showSuccess('Success!', 'This is a success notification', 5000, true, systemNotificationsEnabled), 500);
    setTimeout(() => showInfo('Info', 'This is an info notification', 5000, true, systemNotificationsEnabled), 1000);
    setTimeout(() => showWarning('Warning', 'This is a warning notification', 6000, true, systemNotificationsEnabled), 1500);
    setTimeout(() => showError('Error', 'This is an error notification', 8000, true, systemNotificationsEnabled), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-[#0065A8]">Notification Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">System Notifications</p>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${
                notificationPermission === 'granted' ? 'text-green-600' : 
                notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {notificationPermission === 'granted' ? 'Enabled' : 
                 notificationPermission === 'denied' ? 'Blocked' : 'Not Requested'}
              </span>
            </p>
          </div>
          
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="bg-[#0065A8] text-white px-4 py-2 rounded-lg hover:bg-[#004a80] transition-colors"
            >
              Enable
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={testNotifications}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Test Notifications
          </button>
          
          <button
            onClick={() => showInfo('App Notification', 'This is an app-only notification', 5000, true, false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            App Only
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p className="mb-1">• <strong>App Notifications:</strong> Always visible within the app</p>
          <p className="mb-1">• <strong>System Notifications:</strong> Show even when app is in background</p>
          <p>• Booking/appointment notifications use system notifications by default</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
