
/**
 * Notification system diagnostic utility
 */

import { showNotification } from './notificationUtils';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:5001";

/**
 * Run a complete diagnostic of the notification system
 */
export const runNotificationDiagnostic = async () => {
  const results = {
    browserSupport: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'API not supported',
    localStorageSettings: {
      notificationsEnabled: localStorage.getItem('notificationsEnabled'),
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      userEmail: localStorage.getItem('userEmail'),
      userId: localStorage.getItem('userId'),
      teacherId: localStorage.getItem('teacherId') || localStorage.getItem('teacherID'),
      studentId: localStorage.getItem('studentId') || localStorage.getItem('studentID'),
      userRole: localStorage.getItem('userRole'),
    },
    socketConnected: false,
    socketError: null,
    testNotificationSent: false,
    testNotificationError: null
  };

  console.log('🔍 Running notification diagnostic...');

  // Step 1: Check if permissions are properly set
  if (results.permission === 'granted' && results.localStorageSettings.notificationsEnabled !== 'true') {
    console.log('⚠️ Permission granted but localStorage setting is not enabled. Fixing...');
    localStorage.setItem('notificationsEnabled', 'true');
    results.localStorageSettings.notificationsEnabled = 'true';
  }

  // Step 2: Test if direct notifications work
  try {
    const testNotification = showNotification('Diagnostic Test', {
      body: 'This is a test notification from the diagnostic tool',
      icon: '/polyconLogo.png',
      forceNotification: true
    });
    
    results.directNotificationWorks = !!testNotification;
    console.log('📲 Direct notification test:', results.directNotificationWorks ? 'PASSED' : 'FAILED');
  } catch (error) {
    results.directNotificationWorks = false;
    results.directNotificationError = error.message;
    console.error('📲 Direct notification test error:', error);
  }

  // Step 3: Test socket connection
  try {
    console.log('🔌 Testing Socket.IO connection...');
    const socket = io(SOCKET_SERVER_URL, { timeout: 5000 });
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timed out'));
      }, 5000);
      
      socket.on('connect', () => {
        clearTimeout(timeout);
        results.socketConnected = true;
        console.log('🔌 Socket connection test: PASSED');
        resolve();
      });
      
      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        results.socketError = error.message;
        console.error('🔌 Socket connection error:', error);
        reject(error);
      });
    }).catch(error => {
      results.socketError = error.message;
    }).finally(() => {
      socket.disconnect();
    });
  } catch (error) {
    results.socketError = error.message;
    console.error('🔌 Socket test error:', error);
  }

  // Step 4: Test server notification API
  if (results.localStorageSettings.userId) {
    try {
      const response = await fetch('http://localhost:5001/reminder/test_notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: results.localStorageSettings.userId,
          userRole: results.localStorageSettings.userRole || 'student',
          actionType: 'reminder_1h'
        })
      });
      
      if (response.ok) {
        results.testNotificationSent = true;
        console.log('🔔 Server notification test: PASSED');
      } else {
        results.testNotificationError = `Server returned ${response.status}`;
        console.error('🔔 Server notification test failed:', await response.text());
      }
    } catch (error) {
      results.testNotificationError = error.message;
      console.error('🔔 Server notification test error:', error);
    }
  } else {
    results.testNotificationError = 'No user ID available for testing';
    console.warn('🔔 Server notification test skipped: No user ID available');
  }

  // Step 5: Summary and fixes
  const issues = [];
  const fixes = [];
  
  if (results.permission !== 'granted') {
    issues.push('Browser permission not granted');
    fixes.push('Request notification permission from the user');
  }
  
  if (results.localStorageSettings.notificationsEnabled !== 'true') {
    issues.push('Notifications not enabled in localStorage');
    fixes.push('Set localStorage.notificationsEnabled to "true"');
  }
  
  if (results.socketError) {
    issues.push(`Socket connection error: ${results.socketError}`);
    fixes.push('Check backend server is running and accessible');
  }
  
  if (issues.length === 0) {
    console.log('✅ No issues found with notification system!');
  } else {
    console.log(`⚠️ Found ${issues.length} issues with notification system`);
    console.log('Issues:', issues);
    console.log('Suggested fixes:', fixes);
  }
  
  return {
    results,
    issues,
    fixes,
    timestamp: new Date().toISOString()
  };
};

/**
 * Force send a local notification bypassing all checks 
 * @param {string} title Notification title
 * @param {string} body Notification body
 */
export const forceSendNotification = (title, body) => {
  try {
    if (!('Notification' in window)) {
      console.error('Notifications not supported in this browser');
      return false;
    }
    
    // Force request permission if needed
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Create notification after permission granted
          createNotification(title, body);
        }
      });
      return false;
    }
    
    return createNotification(title, body);
  } catch (error) {
    console.error('Error in forceSendNotification:', error);
    return false;
  }
};

// Helper function to create the actual notification
function createNotification(title, body) {
  try {
    const notification = new Notification(title, {
      body: body || 'This is a test notification',
      icon: '/polyconLogo.png',
      requireInteraction: true
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Fix common notification issues automatically
 */
export const autoFixNotifications = () => {
  // 1. Fix localStorage if permission is granted
  if (Notification.permission === 'granted') {
    localStorage.setItem('notificationsEnabled', 'true');
  }
  
  // 2. Clear any notification request dismissed flag
  localStorage.removeItem('notificationRequestDismissed');
  
  // 3. Force permission request if not determined yet
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      localStorage.setItem('notificationsEnabled', permission === 'granted' ? 'true' : 'false');
    });
  }
  
  return {
    fixesApplied: [
      'Updated localStorage settings',
      'Cleared dismissal flag',
      'Requested permission if needed'
    ]
  };
};
