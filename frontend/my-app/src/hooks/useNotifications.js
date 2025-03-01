import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import notificationSound from '../components/audio/notification.mp3';

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

  useEffect(() => {
    // Get all current user identifiers from localStorage
    const currentUserEmail = localStorage.getItem('userEmail');
    const currentUserId = localStorage.getItem('userId');
    const currentTeacherId = localStorage.getItem('teacherId') || localStorage.getItem('teacherID');
    const currentStudentId = localStorage.getItem('studentId') || localStorage.getItem('studentID');
    const currentRole = localStorage.getItem('userRole');
    
    if (!currentUserEmail) return; // Only connect if authenticated

    console.log("Notification system initialized with user IDs:", {
      email: currentUserEmail,
      userId: currentUserId,
      teacherId: currentTeacherId,
      studentId: currentStudentId,
      role: currentRole
    });

    const socket = io(SOCKET_SERVER_URL);
    
    socket.on('notification', (data) => {
      // Comprehensive identity check - the notification must explicitly target this user
      const isTargetedNotification = 
        // Check all possible targeting methods
        (data.targetEmail && data.targetEmail === currentUserEmail) ||
        (data.targetUserId && data.targetUserId === currentUserId) ||
        (data.targetTeacherId && currentTeacherId && data.targetTeacherId === currentTeacherId) ||
        (data.targetStudentId && currentStudentId && data.targetStudentId === currentStudentId) ||
        // For backwards compatibility, check if notification includes required role
        (data.targetRole && data.targetRole === currentRole);

      // Always log the filtering decision for debugging
      console.log("Notification filtering:", {
        notification: {
          id: data.id,
          targetEmail: data.targetEmail,
          targetUserId: data.targetUserId,
          targetTeacherId: data.targetTeacherId, 
          targetStudentId: data.targetStudentId,
          targetRole: data.targetRole
        },
        currentIdentifiers: {
          email: currentUserEmail,
          userId: currentUserId,
          teacherId: currentTeacherId,
          studentId: currentStudentId,
          role: currentRole
        },
        isTargeted: isTargetedNotification
      });

      // Skip notifications not meant for this user
      if (!isTargetedNotification) {
        console.log("Notification filtered out - not for current user");
        return;
      }
      
      // Play notification sound for targeted notifications
      new Audio(notificationSound).play().catch(err => console.error(err));

      // Compose appropriate message based on action and role
      let composedMessage = "";
      
      if (data.action === 'create') {
        // FIXED: Distinguish between student-created and teacher-created bookings
        if (currentRole === 'faculty') {
          if (data.creatorRole === 'student') {
            // Teacher receiving notification about student-created booking
            composedMessage = `${data.creatorName} requested an appointment with you` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          } else {
            // Teacher receiving notification about their own booking
            composedMessage = `You scheduled an appointment with ${data.studentNames || "your students"}` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          }
        } else if (currentRole === 'student') {
          if (data.creatorRole === 'student') {
            // Student receiving notification about their own booking
            composedMessage = `You requested an appointment with ${data.teacherName || "your teacher"}` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          } else if (data.creatorRole === 'faculty') {
            // Student receiving notification about teacher-created booking
            composedMessage = `${data.teacherName || "A teacher"} scheduled an appointment with you` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          } else {
            composedMessage = data.message || "New notification";
          }
        } else {
          composedMessage = data.message || "New notification";
        }
      } else if (data.action === 'confirm') {
        if (currentRole === 'faculty') {
          composedMessage = `You confirmed the appointment with ${data.studentNames || "your students"}` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        } else if (currentRole === 'student') {
          composedMessage = `Your appointment with ${data.teacherName || "your teacher"} is confirmed` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        }
      } else if (data.action === 'cancel') {
        if (currentRole === 'faculty') {
          composedMessage = `You cancelled the appointment with ${data.studentNames || "your students"}` +
            (data.schedule ? ` which was set for ${formatSchedule(data.schedule)}` : "") + ".";
        } else if (currentRole === 'student') {
          composedMessage = `Your appointment with ${data.teacherName || "your teacher"} has been cancelled` +
            (data.schedule ? ` which was scheduled for ${formatSchedule(data.schedule)}` : "") + ".";
        }
      } else {
        composedMessage = data.message || "New notification";
      }
      
      const composedNotification = { 
        ...data, 
        message: composedMessage, 
        id: Date.now(),
        isRead: false
      };

      setNotifications(prev => [composedNotification, ...prev]);
      setToast({ visible: true, message: composedMessage });
    });

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, []);

  const closeToast = () => {
    setToast({ visible: false, message: '' });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return { notifications, markAllAsRead, toast, closeToast };
};

export default useNotifications;
