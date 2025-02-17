import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const NotificationTray = ({ isVisible, onClose, position }) => {
  const { notifications, markAllAsRead } = useContext(NotificationContext);
  const unreadCount = notifications?.filter(n => !n.isRead)?.length || 0; // Add null check

  // Format notification message if type is booking (customize as needed)
  const formatMessage = (notification) => {
    if (notification.type === 'booking' && notification.teacherName) {
      if (notification.message.toLowerCase().includes("confirmed"))
        return `Your booking with ${notification.teacherName} is confirmed.`;
      if (notification.message.toLowerCase().includes("cancel"))
        return `Your booking with ${notification.teacherName} was cancelled.`;
    }
    return notification.message;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />
      {/* Notification Tray */}
      <div 
        className="absolute bg-white rounded-lg shadow-lg w-80 py-2 z-50"
        style={{ top: position.top, left: position.left, maxHeight: '400px' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 py-2 border-b border-gray-200 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <span 
              className="text-sm text-blue-500 cursor-pointer hover:text-blue-700"
              onClick={markAllAsRead}
            >
              Mark all as read
            </span>
            {unreadCount > 0 && <span className="red-dot" />}
          </div>
        </div>
        {/* Notification List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(400px - 110px)' }}>
          {notifications.map(notification => (
            <div key={notification.id} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}>
              <p className="text-sm text-gray-800">{formatMessage(notification)}</p>
              {/* Timestamp using toLocaleString */}
              <p className="text-xs text-gray-500 mt-1">
                {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
              </p>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-4 py-2 border-t border-gray-200">
          <button className="w-full text-sm text-blue-500 hover:text-blue-700">
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationTray;
