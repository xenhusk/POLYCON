/**
 * Utility functions for handling browser notifications
 */

// Add this function at the top of the file to fix notification preferences
export const fixNotificationPreferences = () => {
  const currentPermission = 'Notification' in window ? Notification.permission : 'API not supported';
  console.log("Fixing notification preferences. Current permission:", currentPermission);
  
  // If permission is granted but localStorage doesn't reflect it, fix it
  if (currentPermission === 'granted') {
    localStorage.setItem('notificationsEnabled', 'true');
    console.log("Fixed notification preferences: set to 'true'");
    return true;
  }
  
  return false;
};

// Add this debugging function
export const debugNotificationSupport = () => {
  const debug = {
    supported: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'API not supported',
    visibility: document.visibilityState,
    localStorage: {
      notificationsEnabled: localStorage.getItem('notificationsEnabled'),
      notificationRequestDismissed: localStorage.getItem('notificationRequestDismissed')
    }
  };
  
  console.table(debug);
  return debug;
};

// Add this diagnostic logging function
export const debugNotificationPermissionStatus = () => {
  // Check browser support
  const isSupported = 'Notification' in window;
  
  // Get permission state
  const permissionState = isSupported ? Notification.permission : 'API not supported';
  
  // Get localStorage values
  const localStorageEnabled = localStorage.getItem('notificationsEnabled') === 'true';
  const dismissedRequest = localStorage.getItem('notificationRequestDismissed') === 'true';
  
  // Check visibility state
  const visibilityState = document.visibilityState;
  
  // Log comprehensive debug info
  console.log('🔔 Notification System Status:', {
    browserSupport: isSupported ? '✅ Supported' : '❌ Not supported',
    permission: permissionState,
    localStorage: {
      enabled: localStorageEnabled ? '✅ Enabled' : '❌ Disabled',
      requestDismissed: dismissedRequest ? 'Yes' : 'No'
    },
    pageVisibility: visibilityState,
    userAgent: navigator.userAgent,
    now: new Date().toISOString()
  });
  
  // Fix any inconsistencies
  if (permissionState === 'granted' && !localStorageEnabled) {
    console.log('🔧 Fixing localStorage permissions to match browser permission');
    localStorage.setItem('notificationsEnabled', 'true');
    return true; // Changes made
  }
  
  return false; // No changes made
};

export const areBrowserNotificationsSupported = () => {
  return 'Notification' in window;
};

export const hasNotificationPermission = () => {
  if (!areBrowserNotificationsSupported()) return false;
  return Notification.permission === 'granted';
};

export const requestNotificationPermission = async () => {
  if (!areBrowserNotificationsSupported()) {
    console.log('Browser notifications not supported');
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    
    // Store the user's preference in localStorage
    localStorage.setItem('notificationsEnabled', permission === 'granted' ? 'true' : 'false');
    
    // Log permission for debugging
    console.log(`Notification permission result: ${permission}`);
    
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Add these debugging functions to help understand why notifications aren't showing
export const debugBrowserNotification = (title, body) => {
  console.log('🔔 Attempting direct browser notification with:', { title, body });
  
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.error('❌ Browser notifications not supported');
    return false;
  }
  
  // Check permission
  if (Notification.permission !== 'granted') {
    console.error('❌ Notification permission not granted:', Notification.permission);
    return false;
  }
  
  // Create notification with minimal options
  try {
    const notification = new Notification(title, {
      body: body || 'Test notification',
      requireInteraction: true
    });
    
    console.log('✅ Browser notification created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating direct browser notification:', error);
    return false;
  }
};

// CONSOLIDATED: A single notification tracker using Set for tags and Map for timestamps
const recentNotifications = {
  tags: new Set(),    // For tracking notification tags
  timestamps: new Map() // For tracking notification timestamps
};

// Add this function to fix the error - place it before showNotification()
export const canShowNotifications = () => {
  // Check three things:
  // 1. Browser supports Notifications API
  // 2. User has granted permission
  // 3. Notifications are enabled in localStorage settings
  return areBrowserNotificationsSupported() && 
         hasNotificationPermission() && 
         areNotificationsEnabled();
};

/**
 * Shows a browser notification with enhanced content based on notification type
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Notification|null} - The notification object or null if not supported/permitted
 */
export const showNotification = (title, options = {}) => {
  if (!canShowNotifications()) {
    console.warn("Browser notifications not supported or permission not granted");
    return null;
  }
  
  console.log("Showing notification with data:", options);
  
  // Get action from options for specialized formatting
  const action = options.action || "";
  
  // Create an enhanced notification title and body based on action type
  let enhancedTitle = title;
  let enhancedBody = options.body || "";
  
  // Format reminder notifications with richer content
  if (action === 'reminder_1h' || action === 'reminder_24h') {
    const timeframe = action === 'reminder_1h' ? '1 hour' : 'tomorrow';
    const timeLabel = action === 'reminder_1h' ? '1-HOUR REMINDER' : '24-HOUR REMINDER';
    
    // Create a more descriptive title
    if (options.summary) {
      enhancedTitle = `${timeLabel}: ${options.summary}`;
    } else {
      enhancedTitle = `${timeLabel}: Upcoming Appointment`;
    }
    
    // Build a rich notification body
    let bodyParts = [];
    
    // Add appointment details
    if (options.targetStudentId) {
      // For student notifications
      const teacherName = options.teacherName || 'your teacher';
      bodyParts.push(`Appointment with ${teacherName}`);
    } else {
      // For teacher notifications 
      const students = options.studentNames || 'students';
      bodyParts.push(`Appointment with ${students}`);
    }
    
    // Format schedule time
    let timeInfo = '';
    if (options.schedulePretty) {
      timeInfo = options.schedulePretty;
    } else if (options.schedule) {
      try {
        const scheduleDate = new Date(options.schedule);
        timeInfo = scheduleDate.toLocaleString();
      } catch (e) {
        timeInfo = options.schedule;
      }
    }
    
    if (timeInfo) {
      bodyParts.push(`Time: ${timeInfo}`);
    }
    
    // Add venue
    if (options.venue) {
      bodyParts.push(`Location: ${options.venue}`);
    }
    
    // Add subject if available
    if (options.subject) {
      bodyParts.push(`Subject: ${options.subject}`);
    }
    
    // Add description if available (truncated)
    if (options.description) {
      const maxLength = 50;
      const description = options.description.length > maxLength 
        ? options.description.substring(0, maxLength) + '...' 
        : options.description;
      bodyParts.push(`Notes: ${description}`);
    }
    
    // Put it all together
    enhancedBody = bodyParts.join('\n');
  }
  
  console.log("Showing notification:", { enhancedTitle, enhancedBody });
  
  // Create enhanced options
  const enhancedOptions = {
    // Default icon
    icon: '/polyconLogo.png',
    // Default badge
    badge: '/favicon.ico',
    // Make notifications sticky by default
    requireInteraction: true,
    // Include all original options
    ...options,
    // Override with enhanced body
    body: enhancedBody
  };
  
  try {
    // Create and show the notification
    const notification = new Notification(enhancedTitle, enhancedOptions);
    
    // Add click handler if not already defined
    if (!options.onclick && options.bookingID) {
      notification.onclick = () => {
        // Open appointment details
        window.open(`/appointments?id=${options.bookingID}`, '_blank');
        notification.close();
      };
    }
    
    return notification;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return null;
  }
};

export const toggleNotifications = async (enabled) => {
  if (enabled && !hasNotificationPermission()) {
    const permission = await requestNotificationPermission();
    const isEnabled = permission === 'granted';
    localStorage.setItem('notificationsEnabled', isEnabled ? 'true' : 'false');
    return isEnabled;
  }
  
  localStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false');
  return enabled;
};

// Update the areNotificationsEnabled function to handle this bug
export const areNotificationsEnabled = () => {
  const permissionGranted = hasNotificationPermission();
  const localStorageValue = localStorage.getItem('notificationsEnabled');
  
  // If permission is granted but localStorage says disabled, fix it
  if (permissionGranted && localStorageValue === 'false') {
    console.log("Permission granted but localStorage says disabled. Fixing...");
    localStorage.setItem('notificationsEnabled', 'true');
    return true;
  }
  
  return permissionGranted && localStorageValue !== 'false';
};

// Call the debug function when the file loads
debugNotificationSupport();

// Call this at the top level to fix preferences when the file loads
fixNotificationPreferences();

// Call the debug function when the file loads
debugNotificationPermissionStatus();
