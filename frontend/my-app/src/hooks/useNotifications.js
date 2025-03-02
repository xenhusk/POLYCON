import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import notificationSound from '../components/audio/notification.mp3';
import { showNotification, areNotificationsEnabled, fixNotificationPreferences } from '../utils/notificationUtils';
import { NotificationContext } from '../context/NotificationContext';

const SOCKET_SERVER_URL = "http://localhost:5001";

// Helper function to format an ISO date string into a friendly format.
const formatSchedule = (schedule) => {
  if (!schedule) return "";
  const date = new Date(schedule);
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};

// Add this global notification tracker outside the hook to ensure it persists across renders
const alreadyDisplayedNotifications = new Set();

const useNotifications = () => {
  const { addNotification, notifications, setNotifications } = useContext(NotificationContext);
  const [toast, setToast] = useState({ visible: false, message: '' });
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {Object} data - Additional notification data
   */
  const showToast = useCallback((message, data = {}) => {
    // First pass the notification to the central system if it's a real notification
    if (data.action && addNotification) {
      addNotification({
        message,
        ...data,
        id: data.id || `toast-${Date.now()}`
      });
    }
    
    // Then set it as toast
    setToast({ 
      visible: true, 
      message, 
      data  // Include all data
    });
  }, [addNotification]);
  
  /**
   * Close the toast notification
   */
  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Fix notification preferences at the beginning
  useEffect(() => {
    // Fix notification preferences when the hook loads
    fixNotificationPreferences();
  }, []);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    areNotificationsEnabled()
  );
  const [recentNotifications, setRecentNotifications] = useState({});
  const notificationRef = useRef(null);
  const socketRef = useRef(null);

  // Add a critical check to ensure the socket is properly established
  useEffect(() => {
    // Get all current user identifiers from localStorage
    const currentUserEmail = localStorage.getItem('userEmail');
    const currentUserId = localStorage.getItem('userId');
    const currentTeacherId = localStorage.getItem('teacherId') || localStorage.getItem('teacherID');
    const currentStudentId = localStorage.getItem('studentId') || localStorage.getItem('studentID');
    const currentRole = localStorage.getItem('userRole');
    
    if (!currentUserEmail) return; // Only connect if authenticated
    
    // Important: Disconnect any existing socket before creating a new one
    if (socketRef.current) {
      console.log('Cleaning up previous socket connection');
      socketRef.current.disconnect();
    }
  
    console.log("Notification system initialized with user IDs:", {
      email: currentUserEmail,
      userId: currentUserId,
      teacherId: currentTeacherId,
      studentId: currentStudentId,
      role: currentRole
    });
  
    // Create a new socket with better connection options
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000 // Increase timeout to 10 seconds
    });
  
    socketRef.current.on('connect', () => {
      console.log('⚡ Socket connected for notifications');
    });
  
    socketRef.current.on('disconnect', () => {
      console.log('🔌 Socket disconnected for notifications');
    });
  
    socketRef.current.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
    });
  
    socketRef.current.on('error', (error) => {
      console.error('🚨 Socket error:', error);
    });
  
    // Add a manual ping to verify socket connection
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        console.log('🔄 Socket connection verified');
      } else {
        console.warn('⚠️ Socket not connected - attempting reconnection...');
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }
    }, 60000); // Check every minute
    
    // Add notification handler code
    socketRef.current.on('notification', (data) => {
      console.log('📬 Notification received:', data);
      
      // Rest of your notification handling code...
      // Generate a unique key for this notification based on content
      const notificationKey = `${data.action}_${data.bookingID || ''}_${data.teacherId || data.teacherID || ''}_${data.targetStudentId || ''}`;
      
      // Log the key we're generating for deduplication
      console.log("Notification key for deduplication:", notificationKey);
      
      // If we've shown this exact notification in the last 5 seconds, skip it
      const recentTime = recentNotifications[notificationKey];
      if (recentTime && (Date.now() - recentTime) < 5000) {
        console.log('Skipping duplicate notification with key:', notificationKey);
        return;
      }
      
      // Store this notification key with current timestamp
      setRecentNotifications(prev => ({
        ...prev,
        [notificationKey]: Date.now()
      }));
      
      // Comprehensive identity check - the notification must explicitly target this user
      const isTargetedNotification = 
        // Check all possible targeting methods
        (data.targetEmail && data.targetEmail === currentUserEmail) ||
        (data.targetUserId && data.targetUserId === currentUserId) ||
        (data.targetTeacherId && currentTeacherId && data.targetTeacherId === currentTeacherId) ||
        (data.targetStudentId && currentStudentId && data.targetStudentId === currentStudentId) ||
        // For backwards compatibility, check if notification includes required role
        (data.targetRole && data.targetRole === currentRole);

      // Log targeting information
      console.log('Notification targeting check:', {
        isTargeted: isTargetedNotification,
        hasEmailMatch: data.targetEmail && data.targetEmail === currentUserEmail,
        hasUserIdMatch: data.targetUserId && data.targetUserId === currentUserId,
        hasTeacherIdMatch: data.targetTeacherId && currentTeacherId && data.targetTeacherId === currentTeacherId,
        hasStudentIdMatch: data.targetStudentId && currentStudentId && data.targetStudentId === currentStudentId,
        hasRoleMatch: data.targetRole && data.targetRole === currentRole
      });

      // Skip notifications not meant for this user
      if (!isTargetedNotification) {
        console.log("Notification filtered out - not for current user");
        return;
      }
      
      // Process notification and show it...
      processNotification(data, currentRole);
    });
  
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up notification socket and intervals');
      clearInterval(pingInterval);
      
      if (socketRef.current) {
        socketRef.current.off('notification');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Update the processNotification function to use more reliable deduplication
  const processNotification = (data, currentRole) => {
    console.log(`⚠️ Processing notification: ${data.action}`, {
      bookingID: data.bookingID,
      action: data.action
    });
  
    // Create a stable unique ID for deduplication based on several properties
    const notificationUniqueId = `${data.action}_${data.bookingID || ''}_${Date.now().toString().slice(0, -3)}`;
    
    // Check if we've already shown this notification based on content
    if (alreadyDisplayedNotifications.has(notificationUniqueId)) {
      console.log('🚫 Duplicate notification detected and blocked:', notificationUniqueId);
      return; // Skip processing entirely for duplicates
    }
    
    // Add this notification to our tracking set
    alreadyDisplayedNotifications.add(notificationUniqueId);
    
    // Remove from tracking set after 5 seconds to prevent memory issues
    setTimeout(() => {
      alreadyDisplayedNotifications.delete(notificationUniqueId);
    }, 5000);
  
    // Play notification sound
    try {
      console.log("🔊 Playing notification sound");
      new Audio(notificationSound).play();
    } catch (err) {
      console.error("Error playing notification sound:", err);
    }
  
    // Fix notification preferences
    fixNotificationPreferences();
  
    // Generate notification content
    let composedMessage = "";
    let notificationTitle = "";
    
    // Compose appropriate message based on action and role
    if (data.action === 'create') {
      // FIXED: Distinguish between student-created and teacher-created bookings
      if (currentRole === 'faculty') {
        if (data.creatorRole === 'student') {
          // Teacher receiving notification about student-created booking
          notificationTitle = "New Appointment Request";
          composedMessage = `${data.creatorName} requested an appointment with you` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        } else {
          // Teacher receiving notification about their own booking
          notificationTitle = "Appointment Scheduled";
          composedMessage = `You scheduled an appointment with ${data.studentNames || "your students"}` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        }
      } else if (currentRole === 'student') {
        if (data.creatorRole === 'student') {
          // Student receiving notification about their own booking
          notificationTitle = "Appointment Requested";
          composedMessage = `You requested an appointment with ${data.teacherName || "your teacher"}` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        } else if (data.creatorRole === 'faculty') {
          // Student receiving notification about teacher-created booking
          notificationTitle = "New Appointment";
          composedMessage = `${data.teacherName || "A teacher"} scheduled an appointment with you` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        } else {
          notificationTitle = "New Notification";
          composedMessage = data.message || "New notification";
        }
      } else {
        notificationTitle = "New Notification";
        composedMessage = data.message || "New notification";
      }
    } else if (data.action === 'confirm') {
      if (currentRole === 'faculty') {
        notificationTitle = "Appointment Confirmed";
        composedMessage = `You confirmed the appointment with ${data.studentNames || "your students"}` +
          (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
          (data.venue ? ` at ${data.venue}` : "") + ".";
      } else if (currentRole === 'student') {
        notificationTitle = "Appointment Confirmed";
        composedMessage = `Your appointment with ${data.teacherName || "your teacher"} is confirmed` +
          (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
          (data.venue ? ` at ${data.venue}` : "") + ".";
      }
    } else if (data.action === 'cancel') {
      if (currentRole === 'faculty') {
        notificationTitle = "Appointment Cancelled";
        composedMessage = `You cancelled the appointment with ${data.studentNames || "your students"}` +
          (data.schedule ? ` which was set for ${formatSchedule(data.schedule)}` : "") + ".";
      } else if (currentRole === 'student') {
        notificationTitle = "Appointment Cancelled";
        composedMessage = `Your appointment with ${data.teacherName || "your teacher"} has been cancelled` +
          (data.schedule ? ` which was scheduled for ${formatSchedule(data.schedule)}` : "") + ".";
      }
    } 
    // Add these new cases for reminders
    else if (data.action === 'reminder_24h') {
      notificationTitle = "Appointment Reminder";
      if (currentRole === 'faculty') {
        composedMessage = `Reminder: You have an appointment tomorrow` +
          (data.schedule ? ` at ${formatSchedule(data.schedule)}` : "") +
          (data.venue ? ` in ${data.venue}` : "") + ".";
      } else if (currentRole === 'student') {
        composedMessage = `Reminder: You have an appointment with ${data.teacherName || "your teacher"} tomorrow` +
          (data.schedule ? ` at ${formatSchedule(data.schedule)}` : "") +
          (data.venue ? ` in ${data.venue}` : "") + ".";
      }
    } 
    else if (data.action === 'reminder_1h') {
      notificationTitle = "Appointment Soon";
      if (currentRole === 'faculty') {
        composedMessage = `Reminder: You have an appointment in 1 hour` +
          (data.venue ? ` in ${data.venue}` : "") + ".";
      } else if (currentRole === 'student') {
        composedMessage = `Reminder: You have an appointment with ${data.teacherName || "your teacher"} in 1 hour` +
          (data.venue ? ` in ${data.venue}` : "") + ".";
      }
    }
    else {
      notificationTitle = "New Notification";
      composedMessage = data.message || "New notification";
    }
  
    const composedNotification = { 
      ...data, 
      message: composedMessage, 
      id: Date.now(),
      isRead: false
    };
  
    // Show only ONE browser notification with better tracking
    console.log('🔔 Showing browser notification:', notificationTitle);
    showNotification(notificationTitle, {
      body: composedMessage,
      icon: '/polyconLogo.png',
      requireInteraction: true,
      tag: notificationUniqueId // Use tag to prevent duplicate notifications
    });
  
    // Update the UI with the notification
    setToast({ visible: true, message: composedMessage });
  };

  const markAllAsRead = () => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } else {
      console.error("setNotifications function is not available from NotificationContext");
    }
  };

  return { 
    notifications, 
    markAllAsRead, 
    toast, 
    closeToast,
    notificationsEnabled, 
    setNotificationsEnabled,
    showToast
  };
};

export default useNotifications;
