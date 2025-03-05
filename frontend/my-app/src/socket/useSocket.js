
// ... existing code ...

// Notification handler
const handleNotification = useCallback((data) => {
  console.log('Socket notification received:', data);
  
  // Format for better display in console
  const richData = {
    ...data,
    received: new Date().toISOString()
  };
  
  // Log all notification data for debugging
  console.table({
    action: data.action || 'unknown',
    type: data.type || 'standard',
    timestamp: data.timestamp || 'not provided',
    bookingID: data.bookingID || 'none'
  });
  
  // Add more enhanced data for reminder notifications
  if ((data.action === 'reminder_1h' || data.action === 'reminder_24h') && !data.enhanced) {
    data.enhanced = true; // Mark as enhanced to avoid double processing
    
    // Format schedule nicely if available
    if (data.schedule) {
      try {
        const scheduleDate = new Date(data.schedule);
        data.schedulePretty = scheduleDate.toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        });
      } catch (e) {
        console.error('Error formatting schedule date:', e);
      }
    }
    
    // Create a better summary
    const reminderType = data.action === 'reminder_1h' ? '1 hour' : '24 hours';
    if (data.targetStudentId) {
      // Student notification
      data.summary = `Appointment with ${data.teacherName || 'your teacher'} in ${reminderType}`;
    } else {
      // Teacher notification
      data.summary = `Appointment with ${data.studentNames || 'students'} in ${reminderType}`;
    }
  }

  // Always show toast for notifications
  if (showToast && data.action) {
    // For reminders, use enhanced data
    if (data.action.startsWith('reminder_')) {
      // Create a better message for the toast
      const timeframe = data.action === 'reminder_1h' ? '1 hour' : '24 hours';
      const venueText = data.venue ? ` at ${data.venue}` : '';
      
      let toastMessage = '';
      if (data.targetStudentId) {
        // Student notification
        toastMessage = `Appointment with ${data.teacherName || 'your teacher'} in ${timeframe}${venueText}`;
      } else {
        // Teacher notification
        toastMessage = `Appointment with ${data.studentNames || 'students'} in ${timeframe}${venueText}`;
      }
      
      // Show toast with rich data
      showToast(toastMessage, data);
    } else {
      // Use default message for other notification types
      showToast(data.message || 'New notification', data);
    }
  }
  
  // Update the app's notification badge count
  if (refreshNotificationBadge) {
    refreshNotificationBadge();
  }
}, [showToast, refreshNotificationBadge]);

// ... existing code ...
