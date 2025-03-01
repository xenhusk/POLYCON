import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import notificationSound from '../components/audio/notification.mp3';
import { showNotification, areNotificationsEnabled } from '../utils/notificationUtils';

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

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    areNotificationsEnabled()
  );
  const [recentNotifications, setRecentNotifications] = useState({});
  const notificationRef = useRef(null);
  const socketRef = useRef(null);

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

    // Create a new socket and store it in the ref
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected for notifications');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected for notifications');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socketRef.current.on('notification', (data) => {
      console.log('Notification received:', data);
      
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
      console.log('Cleaning up notification socket');
      if (socketRef.current) {
        socketRef.current.off('notification');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Create a separate function to process notifications to make the code cleaner
  const processNotification = (data, currentRole) => {
    try {
      console.log("Playing notification sound");
      new Audio(notificationSound).play();
    } catch (err) {
      console.error("Error playing notification sound:", err);
    }

    // Compose appropriate message based on action and role
    let composedMessage = "";
    let notificationTitle = ""; 
    
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

    // Show browser notification - use a separate function to ensure it only happens once
    if (areNotificationsEnabled()) {
      // Save the notification to a ref to prevent duplicate showings
      if (notificationRef.current === notificationTitle + composedMessage) {
        console.log("Duplicate notification detected, not showing browser notification");
      } else {
        notificationRef.current = notificationTitle + composedMessage;
        
        console.log(`Showing browser notification: ${notificationTitle}`);
        showNotification(notificationTitle, {
          body: composedMessage,
          icon: '/polyconLogo.png',
          requireInteraction: true
        });
        
        // Clear the ref after 5 seconds
        setTimeout(() => {
          notificationRef.current = null;
        }, 5000);
      }
    }

    // Update the UI with the notification
    setNotifications(prev => [composedNotification, ...prev]);
    setToast({ visible: true, message: composedMessage });
  };

  const closeToast = () => {
    setToast({ visible: false, message: '' });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return { 
    notifications, 
    markAllAsRead, 
    toast, 
    closeToast,
    notificationsEnabled, 
    setNotificationsEnabled 
  };
};

export default useNotifications;
