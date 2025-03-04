import React, { createContext, useState, useEffect } from 'react';
import { markAllNotificationsAsRead, markNotificationReadById } from '../utils/notificationHelpers';

// Create the context with a default value
export const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  markNotificationRead: () => {},
  markAllAsRead: markAllNotificationsAsRead, // Use the utility function as a fallback
  setNotifications: () => {},
  clearNotifications: () => {}
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Effect to load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      // If there's an error, try to clear and reset
      localStorage.removeItem('notifications');
    }
  }, []);
  
  // Effect to save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);

  const addNotification = (notification) => {
    // Log the incoming notification for debugging
    console.log("Adding notification to context:", notification);
    
    if (!notification) {
      console.error("Attempted to add null notification");
      return;
    }

    setNotifications(prev => {
      // Standardize the timestamp field (handle both created_at and createdAt)
      const timestamp = notification.createdAt || notification.created_at || new Date().toISOString();
      
      // Check if notification with same ID already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) {
        console.log("Notification already exists, skipping:", notification.id);
        return prev;
      }

      // Create a clean notification object with consistent properties
      const cleanNotification = {
        ...notification,
        id: notification.id || `notification-${Date.now()}`,
        isRead: false,
        createdAt: timestamp,
        created_at: timestamp, // Keep both for backward compatibility
        message: notification.message || "New notification" // Ensure there's always a message
      };
      
      console.log("Adding new notification:", cleanNotification);
      
      // Add new notification at the beginning of the array
      return [cleanNotification, ...prev];
    });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationRead = (id) => {
    console.log("Marking notification as read:", id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };
  
  // Make sure this function is properly defined and logged when called
  const markAllAsRead = () => {
    console.log("NotificationContext: markAllAsRead called");
    setNotifications(prev => {
      // Ensure it's an array before mapping
      if (!Array.isArray(prev)) {
        console.error("Notifications is not an array:", prev);
        return [];
      }
      return prev.map(n => ({ ...n, isRead: true }));
    });
    
    // Also update directly in localStorage as a backup
    markAllNotificationsAsRead();
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Log when the context is created or updated
  console.log("NotificationProvider rendering with functions:", {
    addNotification: !!addNotification,
    markAllAsRead: !!markAllAsRead,
    markNotificationRead: !!markNotificationRead
  });

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification, 
        markNotificationRead,
        markAllAsRead, // Make sure it's included here
        setNotifications,
        clearNotifications 
      }}
      data-notification-provider="true"
    >
      {children}
    </NotificationContext.Provider>
  );
};
