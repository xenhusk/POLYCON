import React from 'react';

const NotificationTray = ({ isVisible, onClose, position }) => {
  // Sample notifications
  const notifications = [
    {
      id: 1,
      type: 'appointment',
      message: 'Your consultation is scheduled for tomorrow at 2:00 PM',
      time: '1 hour ago',
      isRead: false
    },
    {
      id: 2,
      type: 'grade',
      message: 'New grade posted for Advanced Web Development',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: 3,
      type: 'system',
      message: 'Welcome to POLYCON! Complete your profile.',
      time: '1 day ago',
      isRead: true
    }
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      
      {/* Notification Tray */}
      <div 
        className="absolute bg-white rounded-lg shadow-lg w-80 py-2 z-50"
        style={{
          top: position.top,
          left: position.left,
          maxHeight: '400px',
        }}
      >
        {/* Header - Fixed at top */}
        <div className="sticky top-0 bg-white px-4 py-2 border-b border-gray-200 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <span className="text-sm text-blue-500 cursor-pointer hover:text-blue-700">
              Mark all as read
            </span>
          </div>
        </div>

        {/* Scrollable notification list */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(400px - 110px)' }}>
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <p className="text-sm text-gray-800">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
            </div>
          ))}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white px-4 py-2 border-t border-gray-200">
          <button className="w-full text-sm text-blue-500 hover:text-blue-700">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationTray;
