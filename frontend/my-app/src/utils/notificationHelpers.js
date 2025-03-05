/**
 * Utility functions for managing notifications outside of the context
 * These provide fallbacks in case context functions are unavailable
 */

/**
 * Marks all notifications as read in local storage
 * @returns {boolean} Success status
 */
export const markAllNotificationsAsRead = () => {
  try {
    console.log("Direct utility: markAllNotificationsAsRead called");
    
    // Get notifications from localStorage
    const storedNotifications = localStorage.getItem('notifications');
    if (!storedNotifications) {
      console.log("No stored notifications found");
      return true;
    }
    
    // Parse and update all notifications
    let notifications = JSON.parse(storedNotifications);
    if (!Array.isArray(notifications)) {
      console.error("Stored notifications is not an array:", notifications);
      return false;
    }
    
    // Mark all as read
    const updatedNotifications = notifications.map(n => ({
      ...n,
      isRead: true
    }));
    
    // Save back to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    console.log(`Marked ${notifications.length} notifications as read directly`);
    
    return true;
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return false;
  }
};

/**
 * Marks a specific notification as read
 * @param {string} id Notification ID to mark as read
 * @returns {boolean} Success status
 */
export const markNotificationReadById = (id) => {
  try {
    // Get notifications from localStorage
    const storedNotifications = localStorage.getItem('notifications');
    if (!storedNotifications) return false;
    
    // Parse and update the specific notification
    let notifications = JSON.parse(storedNotifications);
    if (!Array.isArray(notifications)) return false;
    
    // Find and mark the notification
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    
    // Save back to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    return true;
  } catch (error) {
    console.error("Error in markNotificationReadById:", error);
    return false;
  }
};

/**
 * Gets all notifications from localStorage
 * @returns {Array} The notifications array or empty array if error
 */
export const getStoredNotifications = () => {
  try {
    const storedNotifications = localStorage.getItem('notifications');
    if (!storedNotifications) return [];
    
    const notifications = JSON.parse(storedNotifications);
    return Array.isArray(notifications) ? notifications : [];
  } catch (error) {
    console.error("Error in getStoredNotifications:", error);
    return [];
  }
};

/**
 * Debug function to print the notification context to console
 */
export const debugNotificationContext = (context) => {
  console.log("Notification Context Debug:");
  console.log("  notifications:", context?.notifications?.length);
  console.log("  markAllAsRead:", typeof context?.markAllAsRead === 'function' ? '✅ Function' : '❌ Not a function');
  console.log("  addNotification:", typeof context?.addNotification === 'function' ? '✅ Function' : '❌ Not a function');
  console.log("  markNotificationRead:", typeof context?.markNotificationRead === 'function' ? '✅ Function' : '❌ Not a function');
};

/**
 * Inspect the notification system state
 * @returns {Object} Debug information
 */
export const inspectNotificationSystem = () => {
  // Get notifications from localStorage
  const storedNotifications = getStoredNotifications();
  
  // Get current permission status
  const permissionStatus = 'Notification' in window ? Notification.permission : 'unsupported';
  
  // Check if the app is wrapped with NotificationProvider
  const hasProvider = document.querySelector('[data-notification-provider="true"]') !== null;
  
  // Log detailed information about stored notifications
  if (storedNotifications.length > 0) {
    console.table(
      storedNotifications.map(n => ({
        id: n.id,
        message: n.message?.substring(0, 30) + (n.message?.length > 30 ? '...' : ''),
        type: n.type || 'unknown',
        action: n.action || '-',
        isRead: n.isRead ? 'Yes' : 'No',
        time: n.createdAt || n.created_at || 'unknown'
      }))
    );
  }
  
  const results = {
    status: {
      providerFound: hasProvider,
      notificationPermission: permissionStatus,
      notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true',
      storedNotificationCount: storedNotifications.length,
      latestNotification: storedNotifications.length > 0 ? 
        storedNotifications[0].message : 'No notifications'
    },
    notifications: storedNotifications
  };
  
  console.log("📝 Notification System Inspection:", results);
  return results;
};
