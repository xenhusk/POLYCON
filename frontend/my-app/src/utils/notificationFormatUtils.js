/**
 * Utility functions for formatting booking notifications on the frontend
 */

/**
 * Format ISO datetime string to readable format
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted date and time
 */
export const formatScheduleTime = (isoString) => {
  if (!isoString || isoString === 'TBA') return 'TBA';
  
  try {
    const date = new Date(isoString);
    const options = {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'TBA';
  }
};

/**
 * Get user role from localStorage
 * @returns {string} User role (student, faculty, admin)
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole') || 'student';
};

/**
 * Get current user ID from localStorage 
 * @returns {string} User ID
 */
export const getCurrentUserId = () => {
  return localStorage.getItem('userId') || 
         localStorage.getItem('userID') ||
         localStorage.getItem('studentID') ||
         localStorage.getItem('teacherID') ||
         '';
};

/**
 * Format notification title based on booking type and user role
 * @param {string} type - Notification type (created, confirmed, cancelled)
 * @param {string} userRole - User role (student, faculty, admin)
 * @returns {string} Formatted title
 */
export const formatNotificationTitle = (type, userRole) => {
  const isTeacher = userRole === 'faculty';
  
  switch (type) {
    case 'created':
      return isTeacher ? 'New Appointment Request' : 'Appointment Requested';
    case 'confirmed':
      return 'Appointment Confirmed';
    case 'cancelled':
      return 'Appointment Cancelled';
    default:
      return 'Appointment Update';
  }
};

/**
 * Truncate message if too long for tray display
 * @param {string} message - Original message
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated message
 */
export const truncateForTray = (message, maxLength = 100) => {
  if (!message || message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
};

/**
 * Format student names for display
 * @param {Array} studentNames - Array of student names
 * @returns {string} Formatted names string
 */
export const formatStudentNames = (studentNames) => {
  if (!studentNames || studentNames.length === 0) return 'students';
  
  if (studentNames.length === 1) return studentNames[0];
  if (studentNames.length === 2) return `${studentNames[0]} and ${studentNames[1]}`;
  
  const lastStudent = studentNames[studentNames.length - 1];
  const otherStudents = studentNames.slice(0, -1).join(', ');
  return `${otherStudents}, and ${lastStudent}`;
};

/**
 * Check if user should receive this notification
 * @param {Object} notificationData - Notification data from backend
 * @param {string} currentUserId - Current user's ID
 * @returns {boolean} True if user should receive notification
 */
export const shouldReceiveNotification = (notificationData, currentUserId) => {
  const teacherId = notificationData.teacher_id;
  const studentIds = notificationData.student_ids || [];
  
  // Check if current user is the teacher
  if (String(currentUserId) === String(teacherId)) return true;
  
  // Check if current user is one of the students
  return studentIds.some(id => String(id) === String(currentUserId));
};

/**
 * Generate fallback message if backend doesn't provide one
 * @param {Object} bookingData - Booking data
 * @param {string} type - Notification type
 * @param {string} userRole - User role
 * @returns {string} Fallback message
 */
export const generateFallbackMessage = (bookingData, type, userRole) => {
  const subject = bookingData.subject || 'Consultation';
  const teacherName = bookingData.teacher_name || 'Unknown Teacher';
  const studentNames = formatStudentNames(bookingData.student_names);
  const schedule = formatScheduleTime(bookingData.schedule);
  const venue = bookingData.venue || '';
  
  let message = '';
  const isTeacher = userRole === 'faculty';
  
  switch (type) {
    case 'created':
      if (isTeacher) {
        message = `New appointment request from ${studentNames} for ${subject}`;
      } else {
        message = `Your appointment request with ${teacherName} for ${subject} has been submitted`;
      }
      break;
      
    case 'confirmed':
      if (isTeacher) {
        message = `Appointment with ${studentNames} confirmed for ${subject}`;
      } else {
        message = `Your appointment with ${teacherName} for ${subject} has been confirmed`;
      }
      break;
      
    case 'cancelled':
      if (isTeacher) {
        message = `Appointment with ${studentNames} for ${subject} has been cancelled`;
      } else {
        message = `Your appointment with ${teacherName} for ${subject} has been cancelled`;
      }
      break;
      
    default:
      message = `Appointment update: ${subject}`;
  }
  
  // Add schedule and venue info if available
  if (schedule !== 'TBA') {
    message += ` on ${schedule}`;
  }
  if (venue) {
    message += ` at ${venue}`;
  }
  
  return message;
};
