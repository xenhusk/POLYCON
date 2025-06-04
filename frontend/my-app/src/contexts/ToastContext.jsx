import React, { createContext, useContext } from 'react';
import ToastManager, { useToastManager } from '../components/ToastManager';
import { playNotificationSound } from '../utils/notificationUtils';

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

  // Enhanced methods that include sound
  const showSuccess = (title, message, duration = 5000, playSound = true) => {
    if (playSound) {
      playNotificationSound('success', 0.3);
    }
    return toastManager.showSuccess(title, message, duration);
  };

  const showError = (title, message, duration = 8000, playSound = true) => {
    if (playSound) {
      playNotificationSound('error', 0.4);
    }
    return toastManager.showError(title, message, duration);
  };

  const showWarning = (title, message, duration = 6000, playSound = true) => {
    if (playSound) {
      playNotificationSound('warning', 0.3);
    }
    return toastManager.showWarning(title, message, duration);
  };

  const showInfo = (title, message, duration = 5000, playSound = true) => {
    if (playSound) {
      playNotificationSound('message', 0.3);
    }
    return toastManager.showInfo(title, message, duration);
  };
  // Booking-specific notification method
  const showBookingNotification = (title, message, type = 'info', playSound = true) => {
    if (playSound) {
      const soundType = type === 'success' ? 'booking' : type === 'error' ? 'error' : 'message';
      playNotificationSound(soundType, 0.3);
    }
    
    switch (type) {
      case 'success':
        return showSuccess(title, message, 5000, false); // Don't play sound again
      case 'error':
        return showError(title, message, 8000, false);
      case 'warning':
        return showWarning(title, message, 6000, false);
      default:
        return showInfo(title, message, 5000, false);
    }
  };

  // Specific booking event methods that Appointments.js expects
  const showBookingCreated = (message, playSound = true) => {
    if (playSound) {
      playNotificationSound('message', 0.3);
    }
    return showInfo('New Booking', message || 'A new appointment has been requested', 5000, false);
  };

  const showBookingConfirmed = (message, playSound = true) => {
    if (playSound) {
      playNotificationSound('success', 0.3);
    }
    return showSuccess('Booking Confirmed', message || 'An appointment has been confirmed', 5000, false);
  };

  const showBookingCancelled = (message, playSound = true) => {
    if (playSound) {
      playNotificationSound('error', 0.3);
    }
    return showError('Booking Cancelled', message || 'An appointment has been cancelled', 5000, false);
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
    showBookingCancelled
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
