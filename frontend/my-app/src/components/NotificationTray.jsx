import React from 'react';

const NotificationTray = ({ isVisible, onClose }) => {
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
            </div>
            <div className="flex items-center">
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
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-2">When you receive notifications, they will appear here</p>
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
