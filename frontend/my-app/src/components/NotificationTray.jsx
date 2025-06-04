import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  showBookingNotification, 
  showAppointmentReminder, 
  areNotificationsEnabled,
  initializeNotifications 
} from '../utils/notificationUtils';

const NotificationTray = ({ isVisible, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Initialize notifications and Socket.IO connection
  useEffect(() => {
    initializeNotifications();
    
    // Initialize Socket.IO connection
    if (typeof io !== 'undefined') {
      socketRef.current = io('http://localhost:5001');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });
      
      // Listen for booking notifications
      socketRef.current.on('booking_confirmed', (data) => {
        const notification = {
          id: Date.now(),
          type: 'booking',
          title: 'Booking Confirmed',
          message: `Your booking with ${data.teacherName} has been confirmed for ${data.date} at ${data.time}`,
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
        showBookingNotification(notification.message, 'success');
      });
      
      // Listen for appointment reminders
      socketRef.current.on('appointment_reminder', (data) => {
        const notification = {
          id: Date.now(),
          type: 'reminder',
          title: 'Appointment Reminder',
          message: `Your appointment starts in ${data.timeUntil}`,
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
        showAppointmentReminder(data);
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  // Add a new notification manually (for testing or direct calls)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - only apply darkening and blur on mobile */}
      <div 
        className={`fixed inset-0 z-[999] bg-black bg-opacity-60 backdrop-blur-sm`}
        onClick={onClose}
        style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
      />
      
      {/* Notification Tray - Full screen on mobile, positioned on desktop */}
      <div 
        className={`
          fixed inset-0 z-[1000] flex flex-col
        `}
      >
        <div className={`
          flex flex-col h-full bg-white
        `}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 z-10 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Notifications
              </h3>
              {notifications.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.read).length} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
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
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-2">When you receive notifications, they will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        notification.read ? 'bg-gray-300' : 'bg-blue-500'
                      }`} />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.type && (
                          <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                            notification.type === 'booking' ? 'bg-green-100 text-green-800' :
                            notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                            notification.type === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer with connection status */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Notifications {areNotificationsEnabled() ? 'enabled' : 'disabled'}
              </span>
              <span className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Footer - Only show on mobile */}
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationTray;
