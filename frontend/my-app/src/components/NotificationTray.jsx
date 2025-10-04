import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationTray.css'; // Import custom styles

const NotificationTray = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('all'); // 'all', 'unread'
  const [selectedNotification, setSelectedNotification] = useState(null); // For detailed view
  const { 
    socket, 
    isConnected, 
    notifications, 
    clearNotifications, 
    markNotificationAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useToast();

  // Get notification icon and colors based on type
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'booking':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          bgColor: 'bg-emerald-500',
          lightBg: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200'
        };
      case 'reminder':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-amber-500',
          lightBg: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200'
        };
      case 'error':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-red-500',
          lightBg: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'success':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-green-500',
          lightBg: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-500',
          lightBg: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          bgColor: 'bg-gray-500',
          lightBg: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Mark notification as read and navigate or show detailed view
  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    setSelectedNotification(notif); // Show detailed view instead of navigating immediately
  };

  // Navigate from detailed view
  const handleNavigateFromDetail = (notif) => {
    if (notif.type === 'booking' || notif.type === 'reminder') {
      navigate('/appointments');
    }
    setSelectedNotification(null);
    onClose();
  };

  // Back to list view
  const handleBackToList = () => {
    setSelectedNotification(null);
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
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(timestamp.getFullYear() !== now.getFullYear() && { year: 'numeric' })
    });
  };

  // Filter notifications based on view mode
  const filteredNotifications = viewMode === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasNotifications = notifications.length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Mobile backdrop */}
          <motion.div 
            className="block sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
          </motion.div>

          {/* Notification Tray Container - Modern Design */}
          <motion.div 
            className={`
              fixed z-[1000]
              inset-0 sm:inset-auto
              sm:top-16 sm:left-4 sm:w-96 sm:max-h-[600px]
              flex flex-col
            `}
            initial={{ 
              opacity: 0, 
              x: -100,
              scale: 0.95
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              x: -100,
              scale: 0.95
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
          >
            <div className="bg-white/95 backdrop-blur-sm sm:rounded-2xl sm:shadow-2xl sm:border sm:border-white/20 flex flex-col h-full overflow-hidden">
              
              {/* Header with Modern Design */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94] rounded-t-2xl opacity-10"></div>
                <div className="relative px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="text-xs text-gray-600">{unreadCount} unread</p>
                        )}
                      </div>
                    </div>
                    <motion.button 
                      onClick={onClose}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/20 rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Enhanced Toggle Switch */}
                {hasNotifications && (
                  <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="relative flex bg-gray-100 rounded-xl p-1 shadow-sm">
                        {/* Modern sliding background */}
                        <motion.div
                          className="absolute top-1 bottom-1 bg-gradient-to-r from-[#057DCD] to-[#046bb8] rounded-lg shadow-sm"
                          animate={{
                            left: viewMode === 'all' ? '0.25rem' : '50%',
                            width: viewMode === 'all' ? '50%' : 'calc(50% - 0.25rem)'
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                          }}
                        />
                        
                        <button
                          onClick={() => setViewMode('all')}
                          className={`relative z-10 flex-1 px-3 py-2 text-xs font-medium text-center transition-colors duration-200 ${
                            viewMode === 'all' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          All ({notifications.length})
                        </button>
                        <button
                          onClick={() => setViewMode('unread')}
                          className={`relative z-10 flex-1 px-3 py-2 text-xs font-medium text-center transition-colors duration-200 ${
                            viewMode === 'unread' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Unread ({unreadCount})
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {unreadCount > 0 && (
                          <motion.button 
                            onClick={markAllAsRead}
                            className="text-xs text-[#057DCD] hover:text-[#046bb8] font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Mark all read
                          </motion.button>
                        )}
                        <motion.button 
                          onClick={clearNotifications}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear all
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>
                )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto notification-scroll">
                <AnimatePresence mode="wait">
                  {selectedNotification ? (
                    /* Detailed Notification View */
                    <motion.div 
                      className="p-4 sm:p-6 detailed-view"
                      key="detailed"
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    >
                    {/* Back Button */}
                    <motion.button
                      onClick={handleBackToList}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors p-2 rounded-lg hover:bg-gray-100"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="text-sm font-medium">Back to notifications</span>
                    </motion.button>

                    {/* Detailed Notification Card */}
                    <div className="bg-gradient-to-r from-[#057DCD]/5 to-[#046bb8]/5 rounded-2xl p-6 border border-[#057DCD]/20 shadow-lg">
                      {/* Header Section */}
                      <div className="flex items-start space-x-3 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 ${getNotificationStyle(selectedNotification.type).bgColor} rounded-xl flex items-center justify-center text-white shadow-md`}>
                          {getNotificationStyle(selectedNotification.type).icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                            {selectedNotification.title}
                          </h2>
                          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full inline-block">
                            {formatTime(selectedNotification.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Message Section */}
                      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                          {selectedNotification.message}
                        </p>
                      </div>

                      {/* Metadata and Actions */}
                      <div className="space-y-3">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${getNotificationStyle(selectedNotification.type).lightBg} ${getNotificationStyle(selectedNotification.type).textColor} ${getNotificationStyle(selectedNotification.type).borderColor} border`}>
                            <span className="capitalize">{selectedNotification.type}</span>
                          </span>
                          {!selectedNotification.read && (
                            <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              Unread
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {(selectedNotification.type === 'booking' || selectedNotification.type === 'reminder') && (
                            <motion.button
                              onClick={() => handleNavigateFromDetail(selectedNotification)}
                              className="flex-1 bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white font-medium py-2.5 px-4 rounded-xl transition-all text-center shadow-md"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              View Appointments
                            </motion.button>
                          )}
                          <motion.button
                            onClick={() => {
                              removeNotification(selectedNotification.id);
                              handleBackToList();
                            }}
                            className="sm:w-auto px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all text-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : filteredNotifications.length === 0 ? (
                  /* Empty State */
                  <motion.div 
                    className="flex flex-col items-center justify-center h-64 px-6 text-center"
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-[#057DCD]/10 to-[#046bb8]/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-[#057DCD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">
                      {viewMode === 'unread' ? 'All caught up!' : 'No notifications yet'}
                    </h4>
                    <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                      {viewMode === 'unread' 
                        ? 'You\'ve read all your notifications. New ones will appear here.'
                        : 'You\'ll receive notifications here for appointments, bookings, and important updates.'
                      }
                    </p>
                  </motion.div>
                ) : (
                  /* Notifications List */
                  <motion.div 
                    className="divide-y divide-gray-100"
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {filteredNotifications.map((notification, index) => {
                      const style = getNotificationStyle(notification.type);
                      return (
                        <motion.div 
                          key={notification.id}
                          className={`notification-item group relative p-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 ${
                            !notification.read ? 'bg-gradient-to-r from-[#057DCD]/5 to-[#046bb8]/5 border-l-4 border-[#057DCD]' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            duration: 0.3,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            scale: 1.01,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Notification Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 ${style.bgColor} rounded-xl flex items-center justify-center text-white shadow-md`}>
                              {style.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2 ml-2">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-700 leading-relaxed mb-3 pr-8 line-clamp-2">
                                {notification.message}
                              </p>

                              {/* Type Badge and Click to View */}
                              <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${style.lightBg} ${style.textColor} ${style.borderColor} border`}>
                                  <span className="capitalize">{notification.type}</span>
                                </span>
                                <span className="text-xs text-[#057DCD] font-medium">
                                  Click to view details →
                                </span>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span>{isConnected ? 'Live updates' : 'Reconnecting...'}</span>
                  </div>
                  
                  {/* Mobile close button */}
                  <button 
                    onClick={onClose}
                    className="sm:hidden px-4 py-2 bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white text-xs font-medium rounded-xl hover:from-[#046bb8] hover:to-[#034a94] transition-all shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationTray;
