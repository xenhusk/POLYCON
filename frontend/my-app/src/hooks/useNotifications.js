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
    const socket = io(SOCKET_SERVER_URL);
    
    socket.on('notification', (data) => {
      // Play the notification sound on receiving a new notification
      new Audio(notificationSound).play().catch(err => console.error(err));

      // Get the local user's role (assumed stored in localStorage)
      const localRole = localStorage.getItem('userRole');
      let composedMessage = "";

      // Compose a personalized message based on the action, creator info, and local role.
      if (data.action === 'create') {
        if (localRole === 'faculty') {
          // For teachers receiving a booking created by a student.
          if (data.creatorRole === 'student') {
            composedMessage = `${data.creatorName} requested an appointment with you` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          } else {
            composedMessage = "Booking successfully created on your behalf.";
          }
        } else if (localRole === 'student') {
          if (data.creatorRole === 'student') {
            composedMessage = `You requested an appointment with ${data.teacherName || "your teacher"}` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          } else {
            composedMessage = `You have a new appointment with ${data.teacherName || "your teacher"}` +
              (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
              (data.venue ? ` at ${data.venue}` : "") + ".";
          }
        }
      } else if (data.action === 'confirm') {
        if (localRole === 'faculty') {
          composedMessage = `You confirmed the appointment with ${data.studentNames || "your students"}` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        } else if (localRole === 'student') {
          composedMessage = `Your appointment with ${data.teacherName || "your teacher"} is confirmed` +
            (data.schedule ? ` for ${formatSchedule(data.schedule)}` : "") +
            (data.venue ? ` at ${data.venue}` : "") + ".";
        }
      } else if (data.action === 'cancel') {
        if (localRole === 'faculty') {
          composedMessage = `You cancelled the appointment with ${data.studentNames || "your students"}` +
            (data.schedule ? ` which was set for ${formatSchedule(data.schedule)}` : "") + ".";
        } else if (localRole === 'student') {
          composedMessage = `Your appointment with ${data.teacherName || "your teacher"} has been cancelled` +
            (data.schedule ? ` which was scheduled for ${formatSchedule(data.schedule)}` : "") + ".";
        }
      } else {
        // Fallback message if action is not recognized
        composedMessage = data.message || "New notification";
      }
      
      // Create a notification object with an ID (using Date.now() for simplicity)
      const composedNotification = { ...data, message: composedMessage, id: Date.now() };

      // Update notifications state (newest first)
      setNotifications(prev => [composedNotification, ...prev]);

      // Also show a toast notification
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
