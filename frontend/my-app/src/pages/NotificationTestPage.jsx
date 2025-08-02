import React, { useState, useEffect } from 'react';
import { 
  showNotification, 
  isMobileDevice, 
  requestNotificationPermissionWithInstructions,
  hasNotificationPermission 
} from '../utils/notificationUtils';

const NotificationTestPage = () => {
  const [deviceType, setDeviceType] = useState('unknown');
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Detect device type
    const mobile = isMobileDevice();
    setDeviceType(mobile ? 'mobile' : 'desktop');
    
    // Check initial permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('not-supported');
    }
  }, []);

  const addTestResult = (test, success, details = '') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      details,
      timestamp,
      deviceType
    }]);
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermissionWithInstructions(true);
      setPermissionStatus(Notification.permission);
      addTestResult(
        'Permission Request', 
        granted, 
        granted ? 'User granted permission' : 'User denied permission'
      );
    } catch (error) {
      addTestResult('Permission Request', false, `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBasicNotification = async () => {
    if (!hasNotificationPermission()) {
      addTestResult('Basic Notification', false, 'No permission granted');
      return;
    }

    try {
      await showNotification('Basic Test', {
        body: 'This is a basic notification test',
        icon: '/logo192.png'
      });
      addTestResult('Basic Notification', true, 'Standard notification sent');
    } catch (error) {
      addTestResult('Basic Notification', false, `Error: ${error.message}`);
    }
  };

  const testMobileNotification = async () => {
    if (!hasNotificationPermission()) {
      addTestResult('Mobile Notification', false, 'No permission granted');
      return;
    }

    try {
      await showNotification('Mobile Test', {
        body: 'Mobile notification with vibration and actions',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'mobile-test',
        requireInteraction: true,
        actions: [
          { action: 'view', title: '👀 View' },
          { action: 'dismiss', title: '✖️ Dismiss' }
        ],
        vibrate: [200, 100, 200]
      });
      addTestResult('Mobile Notification', true, 'Mobile notification with actions and vibration');
    } catch (error) {
      addTestResult('Mobile Notification', false, `Error: ${error.message}`);
    }
  };

  const testPersistentNotification = async () => {
    if (!hasNotificationPermission()) {
      addTestResult('Persistent Notification', false, 'No permission granted');
      return;
    }

    try {
      await showNotification('Persistent Test', {
        body: 'This notification requires interaction to dismiss',
        icon: '/logo192.png',
        requireInteraction: true,
        tag: 'persistent-test'
      });
      addTestResult('Persistent Notification', true, 'Notification requires user interaction');
    } catch (error) {
      addTestResult('Persistent Notification', false, `Error: ${error.message}`);
    }
  };

  const testAppointmentNotification = async () => {
    if (!hasNotificationPermission()) {
      addTestResult('Appointment Notification', false, 'No permission granted');
      return;
    }

    try {
      const isOnMobile = isMobileDevice();
      await showNotification('POLYCON Appointment Reminder', {
        body: '📅 Meeting with Dr. Smith in 5 minutes\n📍 Room 101, Building A',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'appointment-reminder',
        requireInteraction: isOnMobile,
        actions: isOnMobile ? [
          { action: 'view', title: '👀 View Details' },
          { action: 'snooze', title: '⏰ Snooze 5min' }
        ] : undefined,
        vibrate: isOnMobile ? [300, 200, 300] : undefined
      });
      addTestResult('Appointment Notification', true, 'POLYCON-style appointment reminder');
    } catch (error) {
      addTestResult('Appointment Notification', false, `Error: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✅ Granted</span>;
      case 'denied':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">❌ Denied</span>;
      case 'default':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">⚠️ Not Asked</span>;
      case 'not-supported':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">❌ Not Supported</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">❓ Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">📱 Mobile Notification Test Center</h1>
          
          {/* Device Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Device Type</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                deviceType === 'mobile' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {deviceType === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
              </span>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Permission Status</h3>
              {getPermissionBadge()}
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Browser Support</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                'Notification' in window
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {'Notification' in window ? '✅ Supported' : '❌ Not Supported'}
              </span>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {permissionStatus !== 'granted' && (
                <button
                  onClick={requestPermission}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  {isLoading ? 'Requesting...' : '🔐 Request Permission'}
                </button>
              )}
              
              <button
                onClick={testBasicNotification}
                disabled={permissionStatus !== 'granted'}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                🔔 Basic Test
              </button>
              
              <button
                onClick={testMobileNotification}
                disabled={permissionStatus !== 'granted'}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                📱 Mobile Features
              </button>
              
              <button
                onClick={testPersistentNotification}
                disabled={permissionStatus !== 'granted'}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                📌 Persistent
              </button>
              
              <button
                onClick={testAppointmentNotification}
                disabled={permissionStatus !== 'granted'}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                📅 Appointment
              </button>
              
              <button
                onClick={clearResults}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {testResults.length} tests run
              </span>
            </div>
            
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tests run yet. Click a test button above to begin.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.slice().reverse().map(result => (
                  <div 
                    key={result.id}
                    className={`border rounded-lg p-4 ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? '✅' : '❌'}
                        </span>
                        <span className="font-medium text-gray-900">{result.test}</span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {result.deviceType}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    {result.details && (
                      <p className="text-sm text-gray-600 ml-6">{result.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTestPage;
