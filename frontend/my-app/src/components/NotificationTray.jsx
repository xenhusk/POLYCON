import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const NotificationTray = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const { 
    socket, 
    isConnected, 
    notifications, 
    clearNotifications, 
    markNotificationAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useToast();

  // Mark notification as read and navigate
  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    // Route based on notification type
    if (notif.type === 'booking' || notif.type === 'reminder') {
      navigate('/appointments');
    }
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {isVisible && (
        <>
          {/* Backdrop and close button only on mobile */}
          <div className="block sm:hidden">
            <div 
              className="fixed inset-0 z-[999] bg-black bg-opacity-60 backdrop-blur-sm"
              onClick={onClose}
              style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
            />
          </div>
          {/* Notification Tray - Full screen on mobile, positioned on desktop */}
          <div 
            className={`
              fixed inset-0 z-[1000] flex flex-col
              sm:inset-auto sm:bottom-20 sm:left-6 sm:w-80 sm:max-h-[500px]
              sm:rounded-lg sm:shadow-xl sm:border sm:border-gray-200
            `}
          >
            <div className={`
              flex flex-col h-full bg-white
              sm:rounded-lg overflow-hidden
            `}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 z-10 flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="ml-3 bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {notifications.length > 0 && (
                    <>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                  <button 
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Notification List - Scrollable area, latest at top, tray height adjusts from bottom */}
              <div className="overflow-y-auto flex-grow flex flex-col p-4 space-y-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h4 className="text-gray-900 font-medium mb-2">No notifications yet</h4>
                    <p className="text-sm text-center text-gray-500 leading-relaxed">
                      You'll receive notifications here for appointment reminders, booking confirmations, and other important updates.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        notification.read 
                          ? 'bg-white border-gray-200 hover:bg-gray-50' 
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${
                          notification.read ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {notification.message}
                          </p>
                          {notification.type && (
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                              notification.type === 'booking' ? 'bg-green-100 text-green-700' :
                              notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                              notification.type === 'error' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.type === 'booking' && '📅'}
                              {notification.type === 'reminder' && '⏰'}
                              {notification.type === 'error' && '⚠️'}
                              <span className="ml-1 capitalize">{notification.type}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Footer with connection status */}
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <span className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {isConnected ? 'Real-time notifications active' : 'Connecting...'}
                  </span>
                </div>
              </div>
              {/* Footer - Only show on mobile */}
              <div className="sm:hidden bg-white px-4 py-4 border-t border-gray-200">
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotificationTray;
