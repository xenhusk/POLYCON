// Sound notification URLs - using actual sound files
const NOTIFICATION_SOUNDS = {
  booking: '/sounds/notification.mp3',
  appointment: '/sounds/notification.mp3',
  message: '/sounds/notification.mp3',
  error: '/sounds/notification.mp3',
  warning: '/sounds/notification.mp3',
  success: '/sounds/notification.mp3'
};

// Audio instances for sound notifications
let audioInstances = {};

/**
 * Check if browser supports notifications
 * @returns {boolean}
 */
export const areBrowserNotificationsSupported = () => {
  return 'Notification' in window;
};

/**
 * Check if user has granted notification permission
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
  return areBrowserNotificationsSupported() && Notification.permission === 'granted';
};

/**
 * Request notification permission from user
 * @returns {Promise<string>} Permission result: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
  if (!areBrowserNotificationsSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Check if notifications are currently enabled
 * @returns {boolean}
 */
export const areNotificationsEnabled = () => {
  const enabled = localStorage.getItem('notificationsEnabled');
  return enabled === 'true' && hasNotificationPermission();
};

/**
 * Toggle notification settings
 * @param {boolean} enabled - Whether to enable or disable notifications
 * @returns {boolean} Final enabled state
 */
export const toggleNotifications = (enabled) => {
  if (enabled && !hasNotificationPermission()) {
    return false;
  }
  
  localStorage.setItem('notificationsEnabled', enabled.toString());
  return enabled;
};

/**
 * Check if sound notifications are enabled
 * @returns {boolean}
 */
export const areSoundNotificationsEnabled = () => {
  const enabled = localStorage.getItem('soundNotificationsEnabled');
  // Enable by default if not set
  if (enabled === null) {
    localStorage.setItem('soundNotificationsEnabled', 'true');
    return true;
  }
  return enabled === 'true';
};

/**
 * Toggle sound notification settings
 * @param {boolean} enabled - Whether to enable or disable sound notifications
 */
export const toggleSoundNotifications = (enabled) => {
  localStorage.setItem('soundNotificationsEnabled', enabled.toString());
};

/**
 * Play notification sound
 * @param {string} soundType - Type of sound to play (booking, appointment, message, etc.)
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export const playNotificationSound = (soundType = 'message', volume = 0.5) => {
  if (!areSoundNotificationsEnabled()) {
    return;
  }

  const soundUrl = NOTIFICATION_SOUNDS[soundType] || NOTIFICATION_SOUNDS.message;
  
  try {
    // Create a new audio instance for each sound to avoid conflicts
    const audio = new Audio(soundUrl);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.preload = 'auto';
    
    // Play the sound with better error handling
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Notification sound played successfully');
        })
        .catch(error => {
          console.warn('Could not play notification sound:', error);
          // Try to enable sound on next user interaction
          const enableSound = () => {
            audio.play().catch(() => {}); // Silent retry
            document.removeEventListener('click', enableSound);
            document.removeEventListener('keydown', enableSound);
          };
          document.addEventListener('click', enableSound, { once: true });
          document.addEventListener('keydown', enableSound, { once: true });
        });
    }
  } catch (error) {
    console.warn('Error creating/playing notification sound:', error);
  }
};

/**
 * Show browser notification with optional sound
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @param {string} soundType - Type of sound to play
 * @returns {Notification|null}
 */
export const showNotification = (title, options = {}, soundType = 'message') => {
  if (!areNotificationsEnabled()) {
    return null;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    dir: 'ltr',
    lang: 'en',
    requireInteraction: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    // Play sound if enabled
    playNotificationSound(soundType);
    
    // Auto-close after 5 seconds unless requireInteraction is true
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Show booking-related notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} type - Type: 'success', 'error', 'info'
 */
export const showBookingNotification = (title, body = '', type = 'info') => {
  const soundTypes = {
    success: 'booking',
    error: 'error',
    info: 'message'
  };
  return showNotification(
    title,
    {
      body: body,
      tag: 'booking-notification',
      requireInteraction: type === 'error'
    },
    soundTypes[type] || soundTypes.info
  );
};

/**
 * Show appointment reminder notification
 * @param {Object} appointment - Appointment details
 */
export const showAppointmentReminder = (appointment) => {
  const title = 'Appointment Reminder';
  const body = `Your appointment with ${appointment.teacher || appointment.student} starts in ${appointment.timeUntil || '15 minutes'}`;
  
  return showNotification(
    title,
    {
      body,
      tag: 'appointment-reminder',
      requireInteraction: true,
      actions: [
        { action: 'join', title: 'Join Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'appointment'
  );
};

/**
 * Show error notification (replaces alert calls)
 * @param {string} message - Error message
 * @param {boolean} useSound - Whether to play error sound
 */
export const showErrorNotification = (message, useSound = true) => {
  return showNotification(
    'Error',
    {
      body: message,
      tag: 'error-notification',
      requireInteraction: true
    },
    useSound ? 'error' : null
  );
};

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {boolean} useSound - Whether to play success sound
 */
export const showSuccessNotification = (message, useSound = true) => {
  return showNotification(
    'Success',
    {
      body: message,
      tag: 'success-notification'
    },
    useSound ? 'success' : null
  );
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {boolean} useSound - Whether to play warning sound
 */
export const showWarningNotification = (message, useSound = true) => {
  return showNotification(
    'Warning',
    {
      body: message,
      tag: 'warning-notification',
      requireInteraction: true
    },
    useSound ? 'warning' : null
  );
};

/**
 * Replace alert() function with notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'error', 'warning', 'info', 'success'
 */
export const notificationAlert = (message, type = 'info') => {
  // First show browser notification if available
  const notification = showNotification(
    type.charAt(0).toUpperCase() + type.slice(1),
    {
      body: message,
      requireInteraction: type === 'error' || type === 'warning'
    },
    type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'message'
  );

  // If notification failed or not supported, fall back to console and optional alert
  if (!notification) {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Only use alert as last resort for critical errors
    if (type === 'error') {
      window.alert(message);
    }
  }
};

/**
 * Initialize notification system
 * @returns {Promise<boolean>} Whether notifications were successfully initialized
 */
export const initializeNotifications = async () => {
  if (!areBrowserNotificationsSupported()) {
    console.warn('Browser notifications are not supported');
    return false;
  }

  // Check if we already have permission
  if (hasNotificationPermission()) {
    return true;
  }

  // If no permission yet, don't auto-request - let user choose
  return false;
};

/**
 * Clean up audio instances
 */
export const cleanupNotificationSounds = () => {
  Object.values(audioInstances).forEach(audio => {
    audio.pause();
    audio.src = '';
  });
  audioInstances = {};
};

// Export default object with all functions
export default {
  areBrowserNotificationsSupported,
  hasNotificationPermission,
  requestNotificationPermission,
  areNotificationsEnabled,
  toggleNotifications,
  areSoundNotificationsEnabled,
  toggleSoundNotifications,
  playNotificationSound,
  showNotification,
  showBookingNotification,
  showAppointmentReminder,
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
  notificationAlert,
  initializeNotifications,
  cleanupNotificationSounds
};
