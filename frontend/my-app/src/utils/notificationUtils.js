/**
 * Utility functions for handling browser notifications
 */

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

// Update the showNotification function
export const showNotification = (title, options = {}) => {
  // Get current permission directly from the API
  const currentPermission = 'Notification' in window ? Notification.permission : 'API not supported';
  
  // Check if notifications are enabled in user preferences
  const enabled = localStorage.getItem('notificationsEnabled') === 'true';
  const pageIsVisible = document.visibilityState === 'visible';
  
  // Only log in development, not in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Notification attempt: ${title}`, { 
      currentPermission,
      localStorageEnabled: enabled,
      pageVisibility: document.visibilityState
    });
  }
  
  if (!enabled) {
    console.log('Notifications disabled in user preferences');
    return null;
  }
  
  // Check if browser supports notifications and permission is granted
  if (!areBrowserNotificationsSupported()) {
    console.log('Browser notifications not supported');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.log(`Notification permission is ${Notification.permission}, not granted`);
    return null;
  }
  
  try {
    // Only show notification if page is not visible OR forceNotification is true
    const forceNotification = options.forceNotification === true;
    if (pageIsVisible && !forceNotification) {
      console.log('Page is visible, skipping browser notification');
      return null;
    }
    
    // Set default icon if not provided - only try the known working icon path
    const defaultOptions = {
      icon: options.icon || '/polyconLogo.png',  // Use the icon we verified is working
      badge: options.badge || '/polyconLogo.png',
      requireInteraction: !!options.requireInteraction,
      ...options
    };
    
    // Create and show the notification
    const notification = new Notification(title, defaultOptions);
    
    // Add click handler to focus the app window
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
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

export const areNotificationsEnabled = () => {
  return hasNotificationPermission() && 
         localStorage.getItem('notificationsEnabled') !== 'false';
};

// Call the debug function when the file loads
debugNotificationSupport();
