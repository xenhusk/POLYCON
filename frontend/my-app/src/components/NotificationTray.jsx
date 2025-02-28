import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const NotificationTray = ({ isVisible, onClose, position }) => {
  const { notifications, markAllAsRead } = useContext(NotificationContext);
  const unreadCount = notifications?.filter(n => !n.isRead)?.length || 0;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

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

  // Format notification message if type is booking
  const formatMessage = (notification) => {
    if (notification.type === 'booking' && notification.teacherName) {
      if (notification.message.toLowerCase().includes("confirmed"))
        return `Your booking with ${notification.teacherName} is confirmed.`;
      if (notification.message.toLowerCase().includes("cancel"))
        return `Your booking with ${notification.teacherName} was cancelled.`;
    }
    return notification.message;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
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
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Enhanced Backdrop - Full screen with blur effect and higher z-index */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[999]" 
        onClick={onClose}
        style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
      />
      
      {/* Notification Tray - Full screen on mobile, positioned on desktop */}
      <div 
        className={`
          ${isMobile 
            ? "fixed inset-0 z-[1000] flex flex-col" 
            : "absolute bg-white rounded-lg shadow-lg z-[1000] w-72 sm:w-80"
          }
        `}
        style={!isMobile ? { 
          top: position.top, 
          left: position.left, 
          maxHeight: '400px' 
        } : {}}
      >
        <div className={`
          ${isMobile 
            ? "flex flex-col h-full bg-white" 
            : ""
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-3 sm:px-4 py-3 border-b border-gray-200 z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span 
                  className="text-xs sm:text-sm text-blue-500 cursor-pointer hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                >
                  Mark all as read
                </span>
              )}
              {isMobile && (
                <button 
                  onClick={onClose}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Notification List - Scrollable area */}
          <div className={`
            overflow-y-auto 
            ${isMobile 
              ? "flex-grow" 
              : "max-h-[calc(400px-56px)]"
            }
          `}>
            {notifications && notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-3 sm:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 
                    ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-xs sm:text-sm text-gray-800 break-words">{formatMessage(notification)}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(notification.created_at)}
                    </p>
                    {!notification.isRead && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
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
