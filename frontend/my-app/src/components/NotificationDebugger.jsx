import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { getStoredNotifications, inspectNotificationSystem } from '../utils/notificationHelpers';

const NotificationDebugger = ({ startHidden = false }) => {
  const [isVisible, setIsVisible] = useState(!startHidden);
  const [debugInfo, setDebugInfo] = useState(null);
  const context = useContext(NotificationContext);
  
  const refreshDebugInfo = () => {
    const info = inspectNotificationSystem();
    setDebugInfo(info);
  };
  
  useEffect(() => {
    if (isVisible) {
      refreshDebugInfo();
    }
  }, [isVisible]);
  
  const clearAllNotifications = () => {
    try {
      localStorage.removeItem('notifications');
      if (context?.setNotifications) {
        context.setNotifications([]);
      }
      refreshDebugInfo();
      alert('All notifications cleared');
    } catch (error) {
      console.error("Error clearing notifications:", error);
      alert('Error clearing notifications');
    }
  };
  
  const addTestNotification = () => {
    try {
      if (context?.addNotification) {
        const testNotification = {
          id: `test-${Date.now()}`,
          message: `Test notification at ${new Date().toLocaleTimeString()}`,
          type: 'test',
          action: 'test',
          createdAt: new Date().toISOString(),
          isRead: false
        };
        
        context.addNotification(testNotification);
        refreshDebugInfo();
        alert('Test notification added');
      } else {
        alert('Cannot add test notification - context not available');
      }
    } catch (error) {
      console.error("Error adding test notification:", error);
      alert('Error adding test notification');
    }
  };
  
  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        style={{opacity: 0.8}}
      >
        🔔
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Notification Debugger</h2>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button 
              onClick={refreshDebugInfo}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Refresh
            </button>
            <button 
              onClick={addTestNotification}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Add Test
            </button>
            <button 
              onClick={clearAllNotifications}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Clear All
            </button>
          </div>
          
          {debugInfo && (
            <>
              <div className="bg-gray-100 p-3 rounded">
                <h3 className="font-bold mb-2">System Status</h3>
                <div className="space-y-1 text-sm">
                  <p>Provider Found: {debugInfo.status.providerFound ? '✅' : '❌'}</p>
                  <p>Permission: {debugInfo.status.notificationPermission}</p>
                  <p>Enabled: {debugInfo.status.notificationsEnabled ? '✅' : '❌'}</p>
                  <p>Stored Notifications: {debugInfo.status.storedNotificationCount}</p>
                  <p>Context Notifications: {context?.notifications?.length || 0}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded max-h-60 overflow-auto">
                <h3 className="font-bold mb-2">Stored Notifications</h3>
                {debugInfo.notifications.length > 0 ? (
                  <div className="space-y-2">
                    {debugInfo.notifications.map((n, i) => (
                      <div key={n.id || i} className="bg-white p-2 rounded shadow-sm">
                        <p className="text-sm font-bold">{n.message?.substring(0, 50) || 'No message'}</p>
                        <div className="text-xs text-gray-500">
                          <p>ID: {n.id || 'missing'}</p>
                          <p>Type: {n.type || 'unknown'} | Action: {n.action || '-'}</p>
                          <p>Read: {n.isRead ? 'Yes' : 'No'} | Time: {new Date(n.createdAt || n.created_at || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No notifications found</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDebugger;
