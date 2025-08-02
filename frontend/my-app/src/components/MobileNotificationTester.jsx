import React, { useState } from 'react';
import { 
  requestNotificationPermissionWithInstructions, 
  showNotification, 
  isMobileDevice,
  hasNotificationPermission,
  areBrowserNotificationsSupported 
} from '../utils/notificationUtils';

const MobileNotificationTester = () => {
  const [permissionStatus, setPermissionStatus] = useState(
    areBrowserNotificationsSupported() ? Notification.permission : 'not-supported'
  );
  const [testResults, setTestResults] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  const addTestResult = (test, success, details = '') => {
    const result = {
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString(),
      device: isMobileDevice() ? 'Mobile' : 'Desktop'
    };
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const handleRequestPermission = async () => {
    try {
      // Show instructions first on mobile
      if (isMobileDevice() && permissionStatus === 'default') {
        setShowInstructions(true);
        return;
      }
      
      const granted = await requestNotificationPermissionWithInstructions(true);
      setPermissionStatus(Notification.permission);
      addTestResult(
        'Permission Request', 
        granted, 
        granted ? 'Permission granted successfully' : 'Permission denied or failed'
      );
      setShowInstructions(false);
    } catch (error) {
      addTestResult('Permission Request', false, `Error: ${error.message}`);
      setShowInstructions(false);
    }
  };

  const handleProceedWithPermission = async () => {
    try {
      const permission = await requestNotificationPermissionWithInstructions(false);
      setPermissionStatus(Notification.permission);
      addTestResult(
        'Permission Request', 
        permission, 
        permission ? 'Permission granted successfully' : 'Permission denied or failed'
      );
      setShowInstructions(false);
    } catch (error) {
      addTestResult('Permission Request', false, `Error: ${error.message}`);
      setShowInstructions(false);
    }
  };

  const getMobileInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'In Safari: Tap "Allow" when prompted, or go to Settings > Safari > Notifications to enable.';
    } else if (userAgent.includes('chrome')) {
      return 'In Chrome: Tap "Allow" when prompted, or tap the 🔒 icon in the address bar > Notifications > Allow.';
    } else if (userAgent.includes('firefox')) {
      return 'In Firefox: Tap "Allow" when prompted, or go to Settings > Site Settings > Notifications.';
    } else {
      return 'Please allow notifications when prompted to receive appointment reminders and booking updates.';
    }
  };

  const handleTestBasicNotification = () => {
    try {
      const notification = showNotification(
        'Test Notification',
        {
          body: `This is a test notification on ${isMobileDevice() ? 'mobile' : 'desktop'} device.`,
          tag: 'test-notification',
          requireInteraction: false
        },
        'message'
      );
      
      addTestResult(
        'Basic Notification', 
        !!notification, 
        notification ? 'Notification sent successfully' : 'Failed to create notification'
      );
    } catch (error) {
      addTestResult('Basic Notification', false, `Error: ${error.message}`);
    }
  };

  const handleTestAppointmentNotification = () => {
    try {
      const notification = showNotification(
        'Appointment Reminder',
        {
          body: 'Your consultation with Dr. Smith starts in 15 minutes.',
          tag: 'appointment-test',
          requireInteraction: true,
          actions: isMobileDevice() ? [
            { action: 'view', title: '👁️ View', icon: '/favicon.ico' },
            { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
          ] : undefined
        },
        'appointment'
      );
      
      addTestResult(
        'Appointment Notification', 
        !!notification, 
        notification ? 'Appointment notification sent successfully' : 'Failed to create appointment notification'
      );
    } catch (error) {
      addTestResult('Appointment Notification', false, `Error: ${error.message}`);
    }
  };

  const handleTestBookingNotification = () => {
    try {
      const notification = showNotification(
        'New Booking',
        {
          body: 'You have a new consultation booking for tomorrow at 2:00 PM with Student John Doe.',
          tag: 'booking-test',
          requireInteraction: false,
          actions: isMobileDevice() ? [
            { action: 'view', title: '👁️ View', icon: '/favicon.ico' },
            { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
          ] : undefined
        },
        'booking'
      );
      
      addTestResult(
        'Booking Notification', 
        !!notification, 
        notification ? 'Booking notification sent successfully' : 'Failed to create booking notification'
      );
    } catch (error) {
      addTestResult('Booking Notification', false, `Error: ${error.message}`);
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return 'text-green-600 bg-green-50 border-green-200';
      case 'denied': return 'text-red-600 bg-red-50 border-red-200';
      case 'default': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-[#0065A8]">
        📱 Mobile Notification Tester
      </h3>
      
      {/* Device & Permission Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Device Information</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Device Type:</span> {isMobileDevice() ? '📱 Mobile' : '🖥️ Desktop'}</p>
            <p><span className="font-medium">Browser Support:</span> {areBrowserNotificationsSupported() ? '✅ Supported' : '❌ Not Supported'}</p>
            <p><span className="font-medium">User Agent:</span> <span className="text-xs">{navigator.userAgent}</span></p>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Permission Status</h4>
          <div className={`px-3 py-2 rounded-md border text-sm font-medium ${getPermissionStatusColor()}`}>
            {permissionStatus === 'granted' && '✅ Granted'}
            {permissionStatus === 'denied' && '❌ Denied'}
            {permissionStatus === 'default' && '⏳ Not Requested'}
            {permissionStatus === 'not-supported' && '❌ Not Supported'}
          </div>
        </div>
      </div>

      {/* Mobile Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              📱 Enable Notifications
            </h4>
            <p className="text-gray-600 mb-4">
              Enable notifications to receive appointment reminders and booking updates.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Instructions:</strong> {getMobileInstructions()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleProceedWithPermission}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleRequestPermission}
          disabled={permissionStatus === 'granted' || permissionStatus === 'not-supported'}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {permissionStatus === 'granted' ? '✅ Permission Already Granted' : '🔔 Request Notification Permission'}
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleTestBasicNotification}
            disabled={!hasNotificationPermission()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            🔔 Test Basic
          </button>
          
          <button
            onClick={handleTestAppointmentNotification}
            disabled={!hasNotificationPermission()}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ⏰ Test Appointment
          </button>
          
          <button
            onClick={handleTestBookingNotification}
            disabled={!hasNotificationPermission()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            📅 Test Booking
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Test Results</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-sm ${
                  result.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">
                    {result.success ? '✅' : '❌'} {result.test}
                  </span>
                  <span className="text-xs opacity-75">
                    {result.timestamp} • {result.device}
                  </span>
                </div>
                {result.details && (
                  <p className="text-xs opacity-90">{result.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">📱 Mobile Testing Instructions</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• First request notification permission</li>
          <li>• Test different notification types to verify mobile functionality</li>
          <li>• On mobile devices, notifications should include vibration and action buttons</li>
          <li>• Check that notifications appear in the device's notification center</li>
          <li>• Verify clicking notifications brings the app to focus</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileNotificationTester;
