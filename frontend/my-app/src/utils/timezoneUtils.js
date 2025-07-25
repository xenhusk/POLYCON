// Timezone utility functions for proper date handling

/**
 * Formats a UTC timestamp to local time with proper timezone handling
 * @param {string} utcTimestamp - The UTC timestamp from the database
 * @param {object} options - Formatting options
 * @returns {string} - Formatted date and time string
 */
export const formatUTCToLocal = (utcTimestamp, options = {}) => {
  if (!utcTimestamp) return 'N/A';
  
  try {
    // Create Date object - should now have proper timezone info from backend
    const date = new Date(utcTimestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', utcTimestamp);
      return 'Invalid Date';
    }
    
    // Simple format to local timezone
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    console.error('Error formatting date:', error, utcTimestamp);
    return 'Error formatting date';
  }
};

/**
 * Formats a date for the datetime-local input field
 * @param {string} utcTimestamp - The UTC timestamp from the database
 * @returns {string} - Formatted string for datetime-local input
 */
export const formatForDateTimeInput = (utcTimestamp) => {
  if (!utcTimestamp) return '';
  
  try {
    const utcString = utcTimestamp.endsWith('Z') ? utcTimestamp : `${utcTimestamp}Z`;
    const date = new Date(utcString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting for datetime input:', error, utcTimestamp);
    return '';
  }
};

/**
 * Converts a local datetime-local input value to UTC for sending to backend
 * @param {string} localDateTime - The value from datetime-local input
 * @returns {string} - UTC timestamp string
 */
export const convertLocalToUTC = (localDateTime) => {
  if (!localDateTime) return '';
  
  try {
    // datetime-local gives us a local time, convert to UTC
    const localDate = new Date(localDateTime);
    
    if (isNaN(localDate.getTime())) {
      return '';
    }
    
    // Return ISO string (which is in UTC)
    return localDate.toISOString();
  } catch (error) {
    console.error('Error converting to UTC:', error, localDateTime);
    return '';
  }
};

/**
 * Gets the current local time formatted for datetime-local input
 * @returns {string} - Current time formatted for datetime-local
 */
export const getCurrentLocalTimeForInput = () => {
  const now = new Date();
  return formatForDateTimeInput(now.toISOString());
};

/**
 * Debug function to show timezone information
 * @param {string} utcTimestamp - The UTC timestamp to debug
 */
export const debugTimezone = (utcTimestamp) => {
  if (!utcTimestamp) return;
  
  // Create both versions for comparison
  const naiveDate = new Date(utcTimestamp);
  const utcDate = new Date(utcTimestamp + 'Z');
  
  console.log('🕐 Timezone Debug:', {
    input: utcTimestamp,
    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    browserTimezoneOffset: new Date().getTimezoneOffset(),
    naiveDate: naiveDate,
    naiveDateFormatted: naiveDate.toLocaleString(),
    utcDate: utcDate,
    utcDateFormatted: utcDate.toLocaleString(),
    formattedLocal: formatUTCToLocal(utcTimestamp)
  });
};

/**
 * Parses a UTC timestamp to a proper Date object
 * @param {string} utcTimestamp - The UTC timestamp from the database
 * @returns {Date} - Proper Date object
 */
export const parseUTCTimestamp = (utcTimestamp) => {
  if (!utcTimestamp) return new Date(0);
  
  try {
    // Handle different timestamp formats
    if (typeof utcTimestamp === 'string') {
      // If the timestamp doesn't have timezone info, treat it as UTC
      if (!utcTimestamp.includes('Z') && !utcTimestamp.includes('+') && !utcTimestamp.includes('-')) {
        // Naive timestamp from database - treat as UTC
        return new Date(utcTimestamp + 'Z');
      }
    }
    return new Date(utcTimestamp);
  } catch (error) {
    console.error('Error parsing UTC timestamp:', error, utcTimestamp);
    return new Date(0);
  }
};
