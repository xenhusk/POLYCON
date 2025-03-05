import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  
  // Extract common notification properties
  const { action, timestamp, venue, bookingID } = notification;
  
  // Format the notification based on action type
  const formatNotificationContent = () => {
    // Default values
    let title = 'Notification';
    let icon = '🔔';
    let message = notification.message || '';
    let details = [];
    let canNavigate = false;
    
    // Format timestamp in a user-friendly way if available
    const formattedTime = timestamp ? 
      formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : 
      '';

    // Reminder-specific formatting
    if (action === 'reminder_1h' || action === 'reminder_24h') {
      const timeframe = action === 'reminder_1h' ? '1 hour' : '24 hours';
      const schedulePretty = notification.schedulePretty;
      
      // Use provided summary, or fallback to basic summary
      title = notification.summary || `Appointment Reminder (${timeframe})`;
      icon = action === 'reminder_1h' ? '⏰' : '📅';
      canNavigate = !!bookingID;
      
      // If no custom message provided, create one
      if (!notification.message) {
        if (notification.targetStudentId) {
          // This is a student notification
          const teacherName = notification.teacherName || 'your teacher';
          message = `You have an appointment in ${timeframe} with ${teacherName}`;
        } else {
          // This is a teacher notification
          const studentCount = notification.students?.length || 
                              (notification.studentNames?.split(',').length || 1);
          const studentText = studentCount > 1 ? 
                            `${studentCount} students` : 
                            (notification.studentNames || 'a student');
          message = `You have an appointment in ${timeframe} with ${studentText}`;
        }
      }
      
      // Add venue information
      if (venue) {
        details.push({ label: 'Location', value: venue });
      }
      
      // Add time information if available
      if (schedulePretty) {
        details.push({ label: 'Time', value: schedulePretty });
      } else if (notification.schedule) {
        // Format the schedule if not already formatted
        const scheduleDate = new Date(notification.schedule);
        const formattedSchedule = scheduleDate.toLocaleString();
        details.push({ label: 'Time', value: formattedSchedule });
      }
      
      // Show participants
      if (notification.studentNames) {
        details.push({ label: 'Students', value: notification.studentNames });
      }
      if (notification.teacherName) {
        details.push({ label: 'Teacher', value: notification.teacherName });
      }
      
      // Add subject if available
      if (notification.subject) {
        details.push({ label: 'Subject', value: notification.subject });
      }
      
      // Add description if available
      if (notification.description) {
        details.push({ label: 'Description', value: notification.description });
      }
      
      // Add other students if available
      if (notification.otherStudents && notification.otherStudents.length > 0) {
        details.push({ 
          label: 'Other Students', 
          value: notification.otherStudents.join(', ') 
        });
      }
    }
    // Other notification types can be added here...
    
    return { title, icon, message, details, formattedTime, canNavigate };
  };
  
  const { title, icon, message, details, formattedTime, canNavigate } = formatNotificationContent();
  
  const handleClick = () => {
    if (canNavigate && bookingID) {
      navigate(`/appointments?id=${bookingID}`);
      if (onClose) onClose();
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden mb-3 transition-all duration-200
        ${canNavigate ? 'cursor-pointer hover:bg-blue-50' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start p-4">
        <div className="text-2xl mr-3">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{title}</div>
          <p className="text-gray-600 text-sm mt-1">{message}</p>
          
          {/* Details section - now conditionally displayed based on expanded state */}
          {(expanded || details.length <= 2) && details.length > 0 && (
            <div className="mt-2 bg-gray-50 p-2 rounded text-sm">
              {details.map((detail, index) => (
                <div key={index} className="flex mb-1">
                  <div className="font-medium w-24 text-gray-500">{detail.label}:</div>
                  <div className="text-gray-800 flex-1">{detail.value}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Show toggle button only if we have more than 2 details */}
          {details.length > 2 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-xs mt-1 text-blue-500 hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
          
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <span>{formattedTime}</span>
            {canNavigate && (
              <span className="ml-2 text-blue-500">
                Click to view appointment →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
