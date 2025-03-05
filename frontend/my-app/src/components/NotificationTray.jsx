import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { markAllNotificationsAsRead, debugNotificationContext, getStoredNotifications } from '../utils/notificationHelpers';
import io from 'socket.io-client';

const NotificationTray = ({ isVisible, onClose, position }) => {
  const notificationContext = useContext(NotificationContext);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const socketRef = useRef(null);
  const updateIntervalRef = useRef(null);
  
  // Connect to socket for real-time updates
  useEffect(() => {
    // Setup socket connection for real-time updates
    const SOCKET_SERVER_URL = "http://localhost:5001";
    
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
      
      socketRef.current.on('connect', () => {
        console.log('Notification tray connected to socket for real-time updates');
      });
      
      // Listen for notification events
      socketRef.current.on('notification', () => {
        console.log('Notification received - updating tray');
        refreshNotifications();
      });
      
      // Listen for booking updates which might generate notifications
      socketRef.current.on('booking_updated', () => {
        console.log('Booking update received - refreshing notifications');
        refreshNotifications();
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('notification');
        socketRef.current.off('booking_updated');
      }
    };
  }, []);
  
  // Set up an interval for periodic updates even when the tray is not visible
  useEffect(() => {
    // Start periodic updates (every 10 seconds)
    updateIntervalRef.current = setInterval(() => {
      refreshNotifications();
    }, 10000);
    
    // Immediately refresh when tray becomes visible
    if (isVisible) {
      refreshNotifications();
    }
    
    // Cleanup interval on component unmount
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isVisible]);
  
  // Debug the context when component mounts or visibility changes
  useEffect(() => {
    if (isVisible) {
      console.log("NotificationTray visible - debugging context:");
      debugNotificationContext(notificationContext);
      
      // Check for notifications in localStorage directly
      refreshNotifications();
    }
  }, [isVisible, notificationContext]);
  
  // Refresh notifications from all sources
  const refreshNotifications = useCallback(() => {
    // First try context
    if (notificationContext?.notifications && 
        Array.isArray(notificationContext.notifications) && 
        notificationContext.notifications.length > 0) {
      console.log("Updating notifications from context:", notificationContext.notifications.length);
      setDisplayedNotifications(notificationContext.notifications);
      return;
    }
    
    // If context is empty or missing, try localStorage directly
    const storedNotifications = getStoredNotifications();
    if (storedNotifications.length > 0) {
      console.log("Updating notifications from localStorage:", storedNotifications.length);
      setDisplayedNotifications(storedNotifications);
      
      // If we have localStorage notifications but none in context, sync them
      if (notificationContext?.setNotifications) {
        console.log("Syncing notifications from localStorage to context");
        notificationContext.setNotifications(storedNotifications);
      }
    }
  }, [notificationContext]);
  
  // Monitor for new notifications in context
  useEffect(() => {
    if (notificationContext?.notifications && 
        Array.isArray(notificationContext.notifications)) {
      setDisplayedNotifications(notificationContext.notifications);
    }
  }, [notificationContext?.notifications]);
  
  // Extract other values from context
  const markNotificationRead = notificationContext?.markNotificationRead || (() => {});
  
  // Get markAllAsRead from context or use the utility function
  const safeMarkAllAsRead = 
    typeof notificationContext?.markAllAsRead === 'function' 
      ? notificationContext.markAllAsRead 
      : markAllNotificationsAsRead;
  
  const unreadCount = displayedNotifications?.filter(n => !n.isRead)?.length || 0;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const trayRef = useRef(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to prevent background scrolling when tray is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Adjust positioning for desktop to prevent overflow
  useEffect(() => {
    if (!isMobile && isVisible && trayRef.current) {
      const tray = trayRef.current;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate if tray would overflow the viewport
      const overflow = {
        bottom: position.top + tray.offsetHeight > viewportHeight,
        right: position.left + tray.offsetWidth > viewportWidth
      };
      
      // Adjust position if necessary
      if (overflow.bottom) {
        tray.style.top = 'auto';
        tray.style.bottom = '10px';
      } else {
        tray.style.top = `${position.top}px`;
        tray.style.bottom = 'auto';
      }
      
      if (overflow.right) {
        tray.style.left = 'auto';
        tray.style.right = '10px';
      } else {
        tray.style.left = `${position.left}px`;
        tray.style.right = 'auto';
      }
    }
  }, [isVisible, position, isMobile]);

  // Format notification message if type is booking
  const formatMessage = (notification) => {
    // IMPROVED: Better message formatting for different notification types
    if (!notification) return "New notification";
    
    if (notification.type === 'booking' || notification.action) {
      const action = notification.action;
      const teacherName = notification.teacherName || "your teacher";
      const students = notification.studentNames || "students";
      
      if (action === 'create') {
        if (notification.creatorRole === 'student') {
          return `${notification.creatorName || "A student"} requested an appointment.`;
        } else {
          return `New appointment scheduled with ${students}.`;
        }
      } else if (action === 'confirm') {
        return `Appointment with ${notification.teacherName || 'teacher'} is confirmed.`;
      } else if (action === 'cancel') {
        return `Appointment with ${notification.teacherName || 'teacher'} was cancelled.`;
      } else if (action === 'reminder_24h') {
        return `Reminder: You have an appointment tomorrow.`;
      } else if (action === 'reminder_1h') {
        return `Reminder: You have an appointment in 1 hour.`;
      }
    }
    
    return notification.message || "New notification";
  };

  // Format timestamp - handle both created_at and createdAt
  const formatTimestamp = (notification) => {
    // Get timestamp from either field
    const timestamp = notification.createdAt || notification.created_at;
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return 'Unknown time';
    }
  };

  // Handle marking all notifications as read with better error handling
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    console.log("NotificationTray: Attempting to mark all notifications as read");
    try {
      safeMarkAllAsRead();
      // Force refresh after marking all as read
      setTimeout(refreshNotifications, 100);
    } catch (error) {
      console.error("Error in handleMarkAllAsRead:", error);
      // Fallback to direct localStorage update
      markAllNotificationsAsRead();
      setTimeout(refreshNotifications, 100);
    }
  };

  // Handle marking a single notification as read
  const handleMarkAsRead = (id) => {
    try {
      if (typeof markNotificationRead === 'function') {
        markNotificationRead(id);
        // Force refresh after marking as read
        setTimeout(refreshNotifications, 100);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ADDED: Debug function to log the notification content 
  const debugNotification = (notification) => {
    console.log("Notification clicked:", notification);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - only apply darkening and blur on mobile */}
      <div 
        className={`fixed inset-0 z-[999] ${isMobile ? "bg-black bg-opacity-60 backdrop-blur-sm" : ""}`}
        onClick={onClose}
        style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
      />
      
      {/* Notification Tray - Full screen on mobile, positioned on desktop */}
      <div 
        ref={trayRef}
        className={`
          ${isMobile 
            ? "fixed inset-0 z-[1000] flex flex-col" 
            : "fixed bg-white rounded-lg shadow-xl z-[1000] w-80 lg:w-96"
          }
        `}
        style={!isMobile ? { 
          maxHeight: '80vh',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        } : {}}
      >
        <div className={`
          ${isMobile 
            ? "flex flex-col h-full bg-white" 
            : "flex flex-col max-h-[80vh] bg-white rounded-lg overflow-hidden"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 z-10 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Notifications
              </h3>
              <span className="ml-2 text-xs text-gray-500">
                {displayedNotifications.length > 0 ? `(${displayedNotifications.length})` : ''}
              </span>
            </div>
            <div className="flex items-center">
              {unreadCount > 0 && (
                <span 
                  className="text-xs sm:text-sm text-blue-500 cursor-pointer hover:text-blue-700 mr-3"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </span>
              )}
              <button 
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Notification List - Scrollable area */}
          <div className="overflow-y-auto flex-grow">
            {displayedNotifications && displayedNotifications.length > 0 ? (
              displayedNotifications.map(notification => (
                <div 
                  key={notification.id || `fallback-${Math.random()}`} 
                  className={`px-3 sm:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 
                    ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    handleMarkAsRead(notification.id);
                    debugNotification(notification);
                  }}
                >
                  {/* Add action indicator bar */}
                  <div className="flex items-start">
                    <div 
                      className={`w-1 h-full rounded-full mr-2 self-stretch ${
                        notification.action === 'create' ? 'bg-blue-500' : 
                        notification.action === 'confirm' ? 'bg-green-500' : 
                        notification.action === 'cancel' ? 'bg-red-500' : 
                        notification.action?.startsWith('reminder') ? 'bg-yellow-500' : 
                        'bg-gray-300'
                      }`}
                      style={{minHeight: '24px'}}
                    ></div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-800 break-words">{formatMessage(notification)}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification)}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-2">When you receive notifications, they will appear here</p>
              </div>
            )}
          </div>
          
          {/* Footer - Only show on mobile */}
          {isMobile && (
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <button 
                onClick={onClose}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationTray;
