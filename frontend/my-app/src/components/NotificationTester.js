import React, { useState, useEffect } from 'react';
import {
  debugNotificationSupport,
  showNotification,
  requestNotificationPermission,
  areNotificationsEnabled,
  toggleNotifications,
  fixNotificationPreferences
} from '../utils/notificationUtils';
import { 
  runNotificationDiagnostic, 
  forceSendNotification,
  autoFixNotifications
} from '../utils/notificationDiagnostic';
import { createReminderTestBooking } from '../utils/reminderTestUtils';

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
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [userId, setUserId] = useState(() => {
    // Try to find the correct user ID from multiple possible localStorage keys
    const possibleIds = [
      localStorage.getItem('userId'),
      localStorage.getItem('userID'),
      localStorage.getItem('teacherId'),
      localStorage.getItem('teacherID'),
      localStorage.getItem('studentId'),
      localStorage.getItem('studentID'),
      localStorage.getItem('firebaseAuthId'), // Add this if you store it
      localStorage.getItem('userEmail') // Email as fallback
    ];
    
    // Use the first non-null value
    return possibleIds.find(id => id) || '';
  });
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'student');
  const [loading, setLoading] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  
  useEffect(() => {
    // Fix notification preferences on component mount
    fixNotificationPreferences();
    runDebug();
  }, []);

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
    const options = {
      body: testBody,
      requireInteraction: true,
      forceNotification: true,
      icon: '/polyconLogo.png'
    };
    
    const notification = showNotification(testTitle, options);
    
    if (!notification) {
      console.error('Failed to show notification');
      alert('Failed to show notification! Try using the "Force Browser Notification" option below.');
    } else {
      console.log('Notification sent successfully');
    }
  };

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const results = await runNotificationDiagnostic();
      setDiagnosticResults(results);
      console.log('Diagnostic complete:', results);
    } catch (error) {
      console.error('Error running diagnostic:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const testServerNotification = async () => {
    if (!userId && !userEmail) {
      alert('Please enter a user ID or email');
      return;
    }
    
    setLoading(true);
    setTestResponse(null);
    
    try {
      const response = await fetch('http://localhost:5001/reminder/test_notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId || userEmail, // Use email as fallback
          userEmail: userEmail, // Add email explicitly 
          userRole,
          actionType: 'reminder_1h'
        })
      });
      
      const data = await response.json();
      setTestResponse(data);
      console.log('Server notification test response:', data);
      
      if (response.ok) {
        alert(`Test notification sent to ${data.email || 'user'}! Check if you received it.`);
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResponse({ error: error.message });
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const applyAutoFixes = () => {
    const result = autoFixNotifications();
    alert(`Applied fixes: ${result.fixesApplied.join(', ')}`);
    runDebug();
  };

  const forceBrowserNotification = () => {
    const success = forceSendNotification(testTitle, testBody);
    if (success) {
      alert('Notification sent bypassing all checks!');
    } else {
      alert('Failed to force notification. Check console for errors.');
    }
  };

  const createTestBooking = async (reminderType) => {
    setLoading(true);
    try {
      const result = await createReminderTestBooking({
        type: reminderType
      });
      
      if (result.success) {
        alert(`Test booking created successfully!\n\nBooking ID: ${result.bookingId}\n\nThis booking is scheduled for ${result.localTime} (UTC time: ${result.schedule}) and will trigger a ${reminderType} reminder.`);
        setTestResponse(result);
      } else {
        alert(`Error: ${result.error}`);
        setTestResponse({ error: result.error });
      }
    } catch (error) {
      console.error("Error creating test booking:", error);
      setTestResponse({ error: error.message });
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Notification Troubleshooter</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debug section */}
        <div className="bg-gray-50 p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">Notification System Status</h3>
          
          <button 
            onClick={runDebug}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full"
          >
            Debug Notification Support
          </button>
          
          {debugInfo && (
            <div className="mt-2 p-4 bg-white rounded text-sm font-mono overflow-auto border border-gray-200">
              <h4 className="font-bold">Debug Info:</h4>
              <div>Supported: {debugInfo.supported ? 'Yes ✅' : 'No ❌'}</div>
              <div>Permission: {debugInfo.permission === 'granted' ? `${debugInfo.permission} ✅` : `${debugInfo.permission} ⚠️`}</div>
              <div>Page Visibility: {debugInfo.visibility}</div>
              <div>Notifications Enabled: {debugInfo.localStorage.notificationsEnabled === 'true' ? 'Yes ✅' : 'No ❌'}</div>
              <div>Request Dismissed: {debugInfo.localStorage.notificationRequestDismissed === 'true' ? 'Yes' : 'No'}</div>
            </div>
          )}
          
          <div className="mt-4 space-y-3">
            <button 
              onClick={requestPermission}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Request Notification Permission
            </button>
            
            <button 
              onClick={handleToggleNotifications}
              className={`${notificationEnabled ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded w-full`}
            >
              {notificationEnabled ? 'Disable' : 'Enable'} Notifications
            </button>
            
            <button 
              onClick={applyAutoFixes}
              className="bg-yellow-500 text-white px-4 py-2 rounded w-full"
            >
              Auto-Fix Common Issues
            </button>
            
            <button 
              onClick={resetNotificationSettings}
              className="bg-gray-500 text-white px-4 py-2 rounded w-full"
            >
              Reset Notification Settings
            </button>
          </div>
        </div>
        
        {/* Test Notification section */}
        <div className="bg-gray-50 p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">Send Test Notifications</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Title:</label>
            <input 
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Message:</label>
            <textarea
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              className="w-full border rounded p-2"
              rows="2"
            />
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={sendTestNotification}
              className="bg-purple-500 text-white px-4 py-2 rounded w-full"
            >
              Send Local Notification
            </button>
            
            <button
              onClick={forceBrowserNotification}
              className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
            >
              Force Browser Notification
            </button>
            
            <div className="flex space-x-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">User ID:</label>
                <input 
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="Your user ID"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Email:</label>
                <input 
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role:</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={testServerNotification}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : "Send Server Test Notification"}
            </button>
          </div>
          
          {testResponse && (
            <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto border border-gray-300 max-h-48">
              <pre>{JSON.stringify(testResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced diagnostics */}
      <div className="mt-6 bg-gray-50 p-4 rounded shadow-sm">
        <h3 className="text-xl font-bold mb-4">Advanced Diagnostics</h3>
        
        <button 
          onClick={runDiagnostic}
          disabled={isRunningDiagnostic}
          className="bg-blue-700 text-white px-4 py-2 rounded w-full mb-4 flex items-center justify-center"
        >
          {isRunningDiagnostic ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Diagnostics...
            </>
          ) : "Run Complete Diagnostic"}
        </button>
        
        {diagnosticResults && (
          <div>
            {/* Issues and fixes section */}
            {diagnosticResults.issues.length > 0 ? (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                <h4 className="font-bold text-yellow-700">Issues Found: {diagnosticResults.issues.length}</h4>
                <ul className="list-disc pl-5 mt-1">
                  {diagnosticResults.issues.map((issue, index) => (
                    <li key={index} className="text-yellow-700">{issue}</li>
                  ))}
                </ul>
                
                <h4 className="font-bold text-green-700 mt-3">Recommended Fixes:</h4>
                <ul className="list-disc pl-5 mt-1">
                  {diagnosticResults.fixes.map((fix, index) => (
                    <li key={index} className="text-green-700">{fix}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-4 bg-green-50 border border-green-200 rounded p-3">
                <h4 className="font-bold text-green-700">✅ All checks passed!</h4>
                <p className="text-green-700">Your notification system appears to be working correctly.</p>
              </div>
            )}
            
            {/* Detailed results */}
            <div className="bg-white rounded border border-gray-200 p-3 text-xs font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(diagnosticResults.results, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Reminder Testing */}
      <div className="mt-6 bg-gray-50 p-4 rounded shadow-sm">
        <h3 className="text-xl font-bold mb-4">Reminder Testing</h3>
        <p className="text-sm text-gray-600 mb-3">
          Create special test bookings that will trigger reminder notifications.
          These bookings will be scheduled in UTC time to match the scheduler.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => createTestBooking('1h')}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded flex-1 flex justify-center items-center"
          >
            {loading ? "Creating..." : "Create 1-hour Reminder Test"}
          </button>
          
          <button 
            onClick={() => createTestBooking('24h')}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded flex-1 flex justify-center items-center"
          >
            {loading ? "Creating..." : "Create 24-hour Reminder Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationTester;
