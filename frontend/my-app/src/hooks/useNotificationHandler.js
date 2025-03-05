import { useEffect, useCallback } from 'react';
import { showNotification } from '../utils/notificationUtils';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Custom hook to handle incoming notification data
 */
const useNotificationHandler = (socket, addNotification) => {
  /**
   * Process incoming notifications
   */
  const handleNotification = useCallback((data) => {
    console.log("Received raw notification:", data);
    
    // Deep clone the data to avoid mutations
    const notificationData = JSON.parse(JSON.stringify(data));
    
    // Generate an ID for the notification if none exists
    const notificationWithId = { 
      ...notificationData,
      id: notificationData.id || `notification-${Date.now()}` 
    };
    
    // Format and enhance notification data
    try {
      // Add human-readable time distances
      if (notificationData.timestamp) {
        try {
          const date = new Date(notificationData.timestamp);
          notificationWithId.timeAgo = formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
          console.error("Error formatting timestamp:", error);
        }
      }

      // Format schedule time in a human-readable way if available
      if (notificationData.schedule) {
        try {
          const scheduleDate = new Date(notificationData.schedule);
          // Create a nice formatted date: "Monday, March 25, 2024 at 3:30 PM"
          notificationWithId.schedulePretty = format(
            scheduleDate, 
            "EEEE, MMMM d, yyyy 'at' h:mm a"
          );
        } catch (error) {
          console.error("Error formatting schedule:", error);
        }
      }
      
      // Add reminder specific formatting
      if (notificationData.action === 'reminder_1h' || notificationData.action === 'reminder_24h') {
        const timeframe = notificationData.action === 'reminder_1h' ? '1 hour' : '24 hours';
        
        // Create a summary if not provided
        if (!notificationData.summary) {
          if (notificationData.targetStudentId) {
            // For student
            const teacherName = notificationData.teacherName || 'your teacher';
            notificationWithId.summary = `Appointment with ${teacherName} in ${timeframe}`;
          } else {
            // For teacher
            const students = notificationData.studentNames || 'students';
            notificationWithId.summary = `Appointment with ${students} in ${timeframe}`;
          }
        }
      }

      console.log("Enhanced notification data:", notificationWithId);
    } catch (error) {
      console.error("Error enhancing notification data:", error);
    }
    
    // Add to notification list
    if (addNotification) {
      addNotification(notificationWithId);
    }
    
    // Show browser notification
    if (notificationData.action === 'reminder_1h' || notificationData.action === 'reminder_24h') {
      // For reminders, we use our enhanced data for better formatting
      showNotification(notificationWithId.summary || "Appointment Reminder", notificationWithId);
    } else {
      // For other types, use original data
      showNotification(notificationData.message || "New Notification", notificationData);
    }

  }, [addNotification]);
  
  // Set up socket listener
  useEffect(() => {
    if (!socket) return;
    
    socket.on('notification', handleNotification);
    
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, handleNotification]);
  
  return { handleNotification };
};

export default useNotificationHandler;
