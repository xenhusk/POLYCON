import API_URL from '../apiConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import ToastManager, { useToastManager } from '../components/ToastManager';
import { playNotificationSound } from '../utils/notificationUtils';
import { requestNotificationPermission, canUseSystemNotifications } from '../components/Toast';
import { queryClient } from '../utils/queryConfig';
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
    const userId = localStorage.getItem('userId') || localStorage.getItem('userID');    if (!userEmail || !userId) {
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
      forceNew: true
    });    newSocket.on('connect', () => {
      console.log('🔔 ToastProvider: Socket connected successfully');
      console.log('🔔 Socket ID:', newSocket.id);
      setIsConnected(true);
      
      // Join user-specific room
      newSocket.emit('join_user_room', { userId: userId });
      console.log('🔔 ToastProvider: Joined user room for userId:', userId);
      console.log('🔔 ToastProvider: Socket connection details:', {
        socketId: newSocket.id,
        userId: userId,
        userEmail: userEmail,
        connected: newSocket.connected
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔔 ToastProvider: Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔔 ToastProvider: Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for appointment reminders from backend scheduler
    newSocket.on('appointment_reminder', (data) => {
      console.log('🔔 ToastProvider: Received appointment_reminder:', data);
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

        // Request browser notification permission and show notification
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Appointment Reminder', {
              body: message,
              icon: '/favicon.ico',
              tag: `appointment-${data.appointment_id}`,
              requireInteraction: true
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Appointment Reminder', {
                  body: message,
                  icon: '/favicon.ico',
                  tag: `appointment-${data.appointment_id}`,
                  requireInteraction: true
                });
              }
            });
          }
        }

        console.log('🔔 ToastProvider: Successfully processed appointment reminder');
      } catch (error) {
        console.error('🔔 ToastProvider: Error processing appointment reminder:', error);
      }
    });

    // Listen for global booking events
    newSocket.on('booking_created', (data) => {
      console.log('🔔 ToastProvider: Received booking_created:', data);
      try {
        const message = data.message || 'A new appointment has been requested';
        showBookingCreated(message);
        
        // Add to notification tray
        addNotificationToTray({
          type: 'booking',
          title: 'Booking Created',
          message: message
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
        const message = data.message || 'An appointment has been confirmed';
        showBookingConfirmed(message);
        
        // Add to notification tray
        addNotificationToTray({
          type: 'booking',
          title: 'Booking Confirmed',
          message: message
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
        const message = data.message || 'An appointment has been cancelled';
        showBookingCancelled(message);
        
        // Add to notification tray
        addNotificationToTray({
          type: 'booking',
          title: 'Booking Cancelled',
          message: message
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
    return showInfo('New Booking', message || 'A new appointment has been requested', 5000, false, useSystemNotification);
  };

  const showBookingConfirmed = (message, playSound = true, useSystemNotification = true) => {
    if (playSound) {
      playNotificationSound('success', 0.3);
    }
    return showSuccess('Booking Confirmed', message || 'An appointment has been confirmed', 5000, false, useSystemNotification);
  };

  const showBookingCancelled = (message, playSound = true, useSystemNotification = true) => {
    if (playSound) {
      playNotificationSound('error', 0.3);
    }
    return showError('Booking Cancelled', message || 'An appointment has been cancelled', 5000, false, useSystemNotification);
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
    // Notification utilities
    requestNotificationPermission,
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
