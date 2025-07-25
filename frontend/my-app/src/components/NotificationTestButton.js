import React from 'react';
import { showAppointmentReminder } from '../utils/notificationUtils';

function NotificationTestButton() {
  const testBrowserNotification = () => {
    // Test browser notification with appointment reminder format
    showAppointmentReminder({
      teacher: 'Dr. John Smith',
      student: 'You',
      timeUntil: '5 minutes',
      venue: 'Room 101'
    });
  };

  return (
    <button
      onClick={testBrowserNotification}
      className="px-4 py-2 bg-[#54BEFF] text-white rounded hover:bg-[#0065A8] transition-colors text-sm"
    >
      🔔 Test Notification
    </button>
  );
}

export default NotificationTestButton;
