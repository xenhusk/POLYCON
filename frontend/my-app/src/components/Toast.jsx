import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { isMobileDevice } from '../utils/notificationUtils';

const Toast = ({ message, type = 'info', isVisible, onClose, useSystemNotification = false, title = 'POLYCON' }) => {
  
  // Mobile-optimized system notification function
  const showSystemNotification = (title, message, type) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const isMobile = isMobileDevice();
      
      const options = {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'polycon-notification',
        requireInteraction: isMobile, // Keep mobile notifications until user action
        silent: false,
        timestamp: Date.now(),
      };

      // Add mobile-specific options
      if (isMobile) {
        options.vibrate = [200, 100, 200]; // Vibration pattern
        options.renotify = true; // Allow re-notification with same tag
        
        // Add action buttons for mobile
        if (type === 'booking' || type === 'appointment') {
          options.actions = [
            { action: 'view', title: '👁️ View', icon: '/favicon.ico' },
            { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
          ];
        }
      }

      try {
        const notification = new Notification(title, options);
        
        // Handle notification events
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          notification.close();
          
          // Handle mobile actions
          if (event.action === 'view') {
            window.location.hash = '#/appointments';
          }
        };
        
        notification.onshow = () => {
          console.log('🔔 System notification shown on', isMobile ? 'mobile' : 'desktop');
        };
        
        // Auto close for desktop only
        if (!isMobile && !options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
        
        return notification;
      } catch (error) {
        console.error('❌ Error showing system notification:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (isVisible) {
      // Show system notification if enabled and permission granted
      if (useSystemNotification) {
        showSystemNotification(title, message, type);
      }

      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, useSystemNotification, title, message, type]);

  // Get icon and colors based on type
  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
          borderColor: 'border-green-400',
          iconColor: 'text-green-100',
          ringColor: 'ring-green-400/20'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          borderColor: 'border-red-400',
          iconColor: 'text-red-100',
          ringColor: 'ring-red-400/20'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
          borderColor: 'border-amber-400',
          iconColor: 'text-amber-100',
          ringColor: 'ring-amber-400/20'
        };
      case 'info':
      default:
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
          borderColor: 'border-blue-400',
          iconColor: 'text-blue-100',
          ringColor: 'ring-blue-400/20'
        };
    }
  };

  const config = getToastConfig(type);
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 120, 
            damping: 20,
            duration: 0.4
          }}
          className={`${config.bgColor} text-white rounded-xl shadow-2xl 
                     p-4 sm:p-6 w-full min-w-[320px] max-w-[450px] sm:max-w-[500px]
                     flex items-start gap-3 sm:gap-4 border ${config.borderColor} 
                     ring-4 ${config.ringColor} backdrop-blur-sm relative`}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Icon */}
          <div className={`flex-shrink-0 p-1.5 rounded-full bg-white/20 ${config.iconColor}`}>
            <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm sm:text-base font-medium break-words leading-relaxed hyphens-auto">
              {message}
            </p>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 
                       focus:outline-none focus:ring-2 focus:ring-white/50 ml-2"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Mobile-aware utility function to request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      // Import the mobile-optimized function
      const { requestNotificationPermissionWithInstructions } = await import('../utils/notificationUtils');
      return await requestNotificationPermissionWithInstructions(true);
    }
    return Notification.permission === 'granted';
  }
  return false;
};

// Utility function to check if notifications are supported and permitted
export const canUseSystemNotifications = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

export default Toast;
