import React, { useState, useEffect } from 'react';
import { 
  areBrowserNotificationsSupported, 
  hasNotificationPermission,
  requestNotificationPermission,
  areNotificationsEnabled,
  toggleNotifications,
  areSoundNotificationsEnabled,
  toggleSoundNotifications 
} from '../utils/notificationUtils';
import NotificationTestButton from './NotificationTestButton';

function NotificationSettings() {
  const [browserSupported, setBrowserSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  useEffect(() => {
    setBrowserSupported(areBrowserNotificationsSupported());
    setHasPermission(hasNotificationPermission());
    setNotificationsEnabled(areNotificationsEnabled());
    setSoundEnabled(areSoundNotificationsEnabled());
  }, []);

  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setHasPermission(true);
        setNotificationsEnabled(true);
        toggleNotifications(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleToggleNotifications = (enabled) => {
    const result = toggleNotifications(enabled);
    setNotificationsEnabled(result);
  };

  const handleToggleSounds = (enabled) => {
    toggleSoundNotifications(enabled);
    setSoundEnabled(enabled);
  };

  if (!browserSupported) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Browser Notifications</h3>
        <p className="text-gray-600">Your browser doesn't support desktop notifications.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-[#0065A8]">Notification Settings</h3>
      
      <div className="space-y-4">
        {/* Browser Notification Permission */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Desktop Notifications</label>
            <p className="text-xs text-gray-500">Get appointment reminders even when the browser tab is inactive</p>
          </div>
          {!hasPermission ? (
            <button
              onClick={handleRequestPermission}
              disabled={requestingPermission}
              className="px-3 py-1 bg-[#0065A8] text-white rounded text-sm hover:bg-[#004e87] disabled:opacity-50"
            >
              {requestingPermission ? 'Requesting...' : 'Enable'}
            </button>
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0065A8]"></div>
            </label>
          )}
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Notification Sounds</label>
            <p className="text-xs text-gray-500">Play sound when receiving notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => handleToggleSounds(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0065A8]"></div>
          </label>
        </div>

        {/* Status Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Status:</span> 
            {hasPermission ? (
              notificationsEnabled ? (
                <span className="text-green-600 ml-1">Desktop notifications enabled</span>
              ) : (
                <span className="text-yellow-600 ml-1">Notifications disabled</span>
              )
            ) : (
              <span className="text-red-600 ml-1">Permission not granted</span>
            )}
          </p>
          {hasPermission && (
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Sound:</span>
              <span className={`ml-1 ${soundEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {soundEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Tip:</span> Desktop notifications will appear in your system's notification tray, 
            allowing you to receive appointment reminders even when POLYCON is not the active browser tab.
          </p>
        </div>

        {/* Test Notification Button */}
        {hasPermission && notificationsEnabled && (
          <div className="mt-4 flex justify-center">
            <NotificationTestButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationSettings;
