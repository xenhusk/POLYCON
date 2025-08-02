import API_URL from '../apiConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import ToastManager, { useToastManager } from '../components/ToastManager';
import { playNotificationSound, showNotification, requestNotificationPermissionWithInstructions } from '../utils/notificationUtils';
import { canUseSystemNotifications } from '../components/Toast';
import { queryClient } from '../utils/queryConfig';
import { 
  formatNotificationTitle, 
  getUserRole, 
  getCurrentUserId,
  generateFallbackMessage,
  truncateForTray 
} from '../utils/notificationFormatUtils';
import { prodLog } from '../utils/productionLogger';
import io from 'socket.io-client';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toastManager = useToastManager();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // localStorage management functions
  const getStorageKey = () => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('userID');
    const key = userId ? `notifications_${userId}` : 'notifications_guest';
    console.log('🔔 Using storage key:', key);
    return key;
  };

  const saveNotificationsToStorage = (notificationsArray) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(notificationsArray));
      console.log('🔔 Saved', notificationsArray.length, 'notifications to localStorage');
    } catch (error) {
      console.error('❌ Error saving notifications to localStorage:', error);
    }
  };

  const loadNotificationsFromStorage = () => {
    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const notifications = parsed.map(notif => ({
          ...notif,
          timestamp: new Date(notif.timestamp)
        }));
        console.log('🔔 Loaded', notifications.length, 'notifications from localStorage');
        return notifications;
      }
      console.log('🔔 No stored notifications found');
      return [];
    } catch (error) {
      console.error('❌ Error loading notifications from localStorage:', error);
      return [];
    }
  };

  const clearNotificationsFromStorage = () => {
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      console.log('🔔 Cleared notifications from localStorage');
    } catch (error) {
      console.error('❌ Error clearing notifications from localStorage:', error);
    }
  };

  // Load notifications from localStorage on component mount and when user changes
  useEffect(() => {
    const storedNotifications = loadNotificationsFromStorage();
    setNotifications(storedNotifications);
  }, [localStorage.getItem('userId'), localStorage.getItem('userID')]);

  // Save notifications to localStorage whenever notifications state changes
  useEffect(() => {
    if (notifications.length >= 0) { // Save even if empty to clear storage
      saveNotificationsToStorage(notifications);
    }
  }, [notifications]);

  // Helper function to add notification to tray
  const addNotificationToTray = (notification) => {
    const trayNotification = {
      id: Date.now() + Math.random(), // Ensure unique ID
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [trayNotification, ...prev.slice(0, 49)]); // Keep last 50
  };

  // Initialize Socket.IO connection for appointment reminders
  useEffect(() => {
    // Only initialize socket if user is authenticated
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId') || localStorage.getItem('userID');
    
    console.log('🔔 ToastProvider socket init:', {
      userEmail,
      userId,
      localStorage_userId: localStorage.getItem('userId'),
      localStorage_userID: localStorage.getItem('userID')
    });
    
    if (!userEmail || !userId) {
      console.log('🔔 ToastProvider: No user credentials, skipping socket connection');
      console.log('🔔 LocalStorage check:', {
        userEmail: localStorage.getItem('userEmail'),
        userId: localStorage.getItem('userId'),
        userID: localStorage.getItem('userID'),
        allKeys: Object.keys(localStorage)
      });
      return;
    }

    console.log('🔔 ToastProvider: Initializing socket connection for user:', userEmail, 'userId:', userId);

    // Initialize socket connection
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });    newSocket.on('connect', () => {
      console.log('🔔 ToastProvider: Socket connected successfully');
      console.log('🔔 Socket ID:', newSocket.id);
      prodLog('🔔 PROD: Socket connected successfully - ID:', newSocket.id);
      setIsConnected(true);
      
      // Join user-specific room
      newSocket.emit('join_user_room', { userId: userId });
      console.log('🔔 ToastProvider: Joined user room for userId:', userId);
      prodLog('🔔 PROD: Joined user room for userId:', userId);
      console.log('🔔 ToastProvider: Socket connection details:', {
        socketId: newSocket.id,
        userId: userId,
        userEmail: userEmail,
        connected: newSocket.connected
      });
    });

    newSocket.on('reconnect', () => {
      console.log('🔔 ToastProvider: Socket reconnected successfully');
      setIsConnected(true);
      
      // Rejoin user-specific room after reconnection
      newSocket.emit('join_user_room', { userId: userId });
      console.log('🔔 ToastProvider: Rejoined user room for userId:', userId);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔔 ToastProvider: Socket disconnected:', reason);
      prodLog('🔔 PROD: Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔔 ToastProvider: Socket connection error:', error);
      prodLog('🔔 PROD ERROR: Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for appointment reminders from backend scheduler
    newSocket.on('appointment_reminder', (data) => {
      console.log('🔔 ToastProvider: Received appointment_reminder:', data);
      prodLog('🔔 PROD: Received appointment_reminder:', data);
      console.log('🔔 Full appointment reminder payload:', JSON.stringify(data, null, 2));
      
      try {
        const message = data.message || 'You have an appointment in 15 minutes';
        
        // Show toast notification with sound
        showAppointmentReminder(message, true);

        // Add to notification tray
        addNotificationToTray({
          type: 'reminder',
          title: 'Appointment Reminder',
          message: message
        });

        // Show mobile-optimized system notification
        showNotification('Appointment Reminder', {
          body: message,
          tag: `appointment-${data.appointment_id}`,
          requireInteraction: true,
          actions: [
            { action: 'view', title: '👁️ View', icon: '/favicon.ico' },
            { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
          ]
        }, 'appointment');

        console.log('🔔 ToastProvider: Successfully processed appointment reminder');
        prodLog('🔔 PROD: Successfully processed appointment reminder');
      } catch (error) {
        console.error('🔔 ToastProvider: Error processing appointment reminder:', error);
        prodLog('🔔 PROD ERROR: Error processing appointment reminder:', error);
      }
    });

    // Listen for test notifications (for debugging)
    newSocket.on('test_notification', (data) => {
      console.log('🧪 ToastProvider: Received test_notification:', data);
      playNotificationSound('success', 0.3);
      toastManager.showSuccess('Test Notification', 'Test notification received: ' + data.message);
    });

    // Listen for global booking events
    newSocket.on('booking_created', (data) => {
      console.log('🔔 ToastProvider: Received booking_created:', data);
      try {
        const userRole = getUserRole();
        const currentUserId = getCurrentUserId();
        
        // Use backend-provided message if available, otherwise generate fallback
        const message = data.message || generateFallbackMessage(data, 'created', userRole);
        const title = formatNotificationTitle('created', userRole);
        
        showBookingCreated(message);
        
        // Add to notification tray with contextual title
        addNotificationToTray({
          type: 'info',  // Use 'info' type for created bookings to get blue color
          title: title,
          message: truncateForTray(message, 80)
        });
        
        // Invalidate appointments data to refresh UI
        queryClient.invalidateQueries(['studentAppointments']);
        queryClient.invalidateQueries(['teacherAppointments']);
      } catch (error) {
        console.error('🔔 ToastProvider: Error processing booking_created:', error);
      }
    });

    newSocket.on('booking_confirmed', (data) => {
      console.log('🔔 ToastProvider: Received booking_confirmed:', data);
      try {
        const userRole = getUserRole();
        const currentUserId = getCurrentUserId();
        
        // Use backend-provided message if available, otherwise generate fallback
        const message = data.message || generateFallbackMessage(data, 'confirmed', userRole);
        const title = formatNotificationTitle('confirmed', userRole);
        
        showBookingConfirmed(message);
        
        // Add to notification tray with contextual title
        addNotificationToTray({
          type: 'success',  // Use 'success' type for confirmed bookings to get green color
          title: title,
          message: truncateForTray(message, 80)
        });
        
        // Invalidate appointments data to refresh UI
        queryClient.invalidateQueries(['studentAppointments']);
        queryClient.invalidateQueries(['teacherAppointments']);
      } catch (error) {
        console.error('🔔 ToastProvider: Error processing booking_confirmed:', error);
      }
    });

    newSocket.on('booking_cancelled', (data) => {
      console.log('🔔 ToastProvider: Received booking_cancelled:', data);
      try {
        const userRole = getUserRole();
        const currentUserId = getCurrentUserId();
        
        // Use backend-provided message if available, otherwise generate fallback
        const message = data.message || generateFallbackMessage(data, 'cancelled', userRole);
        const title = formatNotificationTitle('cancelled', userRole);
        
        showBookingCancelled(message);
        
        // Add to notification tray with contextual title
        addNotificationToTray({
          type: 'error',  // Use 'error' type for cancelled bookings to get red color
          title: title,
          message: truncateForTray(message, 80)
        });
        
        // Invalidate appointments data to refresh UI
        queryClient.invalidateQueries(['studentAppointments']);
        queryClient.invalidateQueries(['teacherAppointments']);
      } catch (error) {
        console.error('🔔 ToastProvider: Error processing booking_cancelled:', error);
      }
    });

    setSocket(newSocket);    // Cleanup on unmount
    return () => {
      console.log('🔔 ToastProvider: Cleaning up socket connection');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [localStorage.getItem('userEmail'), localStorage.getItem('userId')]); // Re-run when user credentials change

  // Enhanced methods that include sound and system notifications
  const showSuccess = (title, message, duration = 5000, playSound = true, useSystemNotification = false) => {
    if (playSound) {
      playNotificationSound('success', 0.3);
    }
    return toastManager.showSuccess(title, message, duration, useSystemNotification);
  };

  const showError = (title, message, duration = 8000, playSound = true, useSystemNotification = false) => {
    if (playSound) {
      playNotificationSound('error', 0.4);
    }
    return toastManager.showError(title, message, duration, useSystemNotification);
  };

  const showWarning = (title, message, duration = 6000, playSound = true, useSystemNotification = false) => {
    if (playSound) {
      playNotificationSound('warning', 0.3);
    }
    return toastManager.showWarning(title, message, duration, useSystemNotification);
  };

  const showInfo = (title, message, duration = 5000, playSound = true, useSystemNotification = false) => {
    if (playSound) {
      playNotificationSound('message', 0.3);
    }
    return toastManager.showInfo(title, message, duration, useSystemNotification);
  };
  // Booking-specific notification method
  const showBookingNotification = (title, message, type = 'info', playSound = true, useSystemNotification = true) => {
    if (playSound) {
      const soundType = type === 'success' ? 'booking' : type === 'error' ? 'error' : 'message';
      playNotificationSound(soundType, 0.3);
    }
    
    switch (type) {
      case 'success':
        return showSuccess(title, message, 5000, false, useSystemNotification); // Don't play sound again
      case 'error':
        return showError(title, message, 8000, false, useSystemNotification);
      case 'warning':
        return showWarning(title, message, 6000, false, useSystemNotification);
      default:
        return showInfo(title, message, 5000, false, useSystemNotification);
    }
  };

  // Specific booking event methods that Appointments.js expects
  const showBookingCreated = (message, playSound = true, useSystemNotification = true) => {
    if (playSound) {
      playNotificationSound('message', 0.3);
    }
    
    const userRole = getUserRole();
    const title = formatNotificationTitle('created', userRole);
    
    return showInfo(title, message || 'A new appointment has been requested', 5000, false, useSystemNotification);
  };

  const showBookingConfirmed = (message, playSound = true, useSystemNotification = true) => {
    if (playSound) {
      playNotificationSound('success', 0.3);
    }
    
    const userRole = getUserRole();
    const title = formatNotificationTitle('confirmed', userRole);
    
    return showSuccess(title, message || 'An appointment has been confirmed', 5000, false, useSystemNotification);
  };

  const showBookingCancelled = (message, playSound = true, useSystemNotification = true) => {
    if (playSound) {
      playNotificationSound('error', 0.3);
    }
    
    const userRole = getUserRole();
    const title = formatNotificationTitle('cancelled', userRole);
    
    return showError(title, message || 'An appointment has been cancelled', 5000, false, useSystemNotification);
  };

  const showAppointmentReminder = (message, playSound = true, useSystemNotification = true) => {
    if (playSound) {
      playNotificationSound('appointment', 0.4);
    }
    return showWarning('Appointment Reminder', message || 'Your appointment is starting soon', 8000, false, useSystemNotification);
  };
  // Functions for managing notification tray
  const clearNotifications = () => {
    setNotifications([]);
    clearNotificationsFromStorage();
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Function to clear notifications on logout
  const clearNotificationsOnLogout = () => {
    setNotifications([]);
    clearNotificationsFromStorage();
  };

  const contextValue = {
    ...toastManager,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showBookingNotification,
    showBookingCreated,
    showBookingConfirmed,
    showBookingCancelled,
    showAppointmentReminder,
    socket,
    isConnected,
    // Notification tray management
    notifications,
    clearNotifications,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    addNotificationToTray,
    clearNotificationsOnLogout,
    // Notification utilities (mobile-enhanced)
    requestNotificationPermission: requestNotificationPermissionWithInstructions,
    canUseSystemNotifications
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastManager 
        toasts={toastManager.toasts} 
        onRemoveToast={toastManager.removeToast}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
