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
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Check if we're on a mobile device
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768 && 'ontouchstart' in window);
};

/**
 * Check if user has granted notification permission
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
  return areBrowserNotificationsSupported() && Notification.permission === 'granted';
};

/**
 * Request notification permission from user with mobile-specific handling
 * @returns {Promise<string>} Permission result: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
  if (!areBrowserNotificationsSupported()) {
    console.warn('Notifications not supported on this device');
    return 'denied';
  }

  try {
    // On mobile, we need to ensure the request happens from a user gesture
    if (isMobileDevice()) {
      console.log('📱 Requesting notification permission on mobile device');
    }
    
    let permission;
    
    // For newer browsers that support the promise-based API
    if ('requestPermission' in Notification) {
      permission = await Notification.requestPermission();
    } else {
      // Fallback for older browsers
      permission = await new Promise(resolve => {
        Notification.requestPermission(resolve);
      });
    }
    
    console.log('🔔 Notification permission result:', permission);
    return permission;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
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
 * Show browser notification with mobile-optimized options
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @param {string} soundType - Type of sound to play
 * @returns {Notification|null}
 */
export const showNotification = (title, options = {}, soundType = 'message') => {
  if (!areNotificationsEnabled()) {
    console.log('🔔 Notifications disabled or no permission');
    return null;
  }

  // Mobile-optimized notification options
  const mobileOptimizedOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    dir: 'ltr',
    lang: 'en',
    requireInteraction: isMobileDevice() ? true : false, // Keep mobile notifications visible longer
    silent: false, // Let the system handle sound on mobile
    tag: options.tag || 'polycon-notification', // Prevent duplicates
    timestamp: Date.now(),
    ...options
  };

  // Additional mobile-specific options
  if (isMobileDevice()) {
    mobileOptimizedOptions.vibrate = [200, 100, 200]; // Vibration pattern for mobile
    mobileOptimizedOptions.renotify = true; // Allow re-notification with same tag
    
    // Add action buttons for mobile (if supported)
    if (options.actions) {
      mobileOptimizedOptions.actions = options.actions;
    } else if (options.tag === 'appointment-reminder') {
      mobileOptimizedOptions.actions = [
        { action: 'view', title: '👁️ View', icon: '/favicon.ico' },
        { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
      ];
    }
  }

  try {
    console.log('🔔 Creating notification with options:', mobileOptimizedOptions);
    const notification = new Notification(title, mobileOptimizedOptions);
    
    // Play sound if enabled (desktop mostly, mobile handles this automatically)
    if (!isMobileDevice()) {
      playNotificationSound(soundType);
    }
    
    // Handle notification events
    notification.onclick = (event) => {
      console.log('🔔 Notification clicked');
      event.preventDefault();
      window.focus(); // Bring app to foreground
      notification.close();
      
      // Handle mobile action clicks
      if (event.action) {
        console.log('🔔 Notification action clicked:', event.action);
        if (event.action === 'view') {
          // Navigate to relevant page
          window.location.hash = '#/appointments';
        }
      }
    };
    
    notification.onshow = () => {
      console.log('🔔 Notification shown successfully');
    };
    
    notification.onerror = (error) => {
      console.error('❌ Notification error:', error);
    };
    
    // Auto-close for desktop only (mobile should keep notifications until user action)
    if (!isMobileDevice() && !mobileOptimizedOptions.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Error showing notification:', error);
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
 * Register service worker for better mobile notification support
 * @returns {Promise<boolean>} Whether service worker was registered successfully
 */
export const registerNotificationServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('📱 Service Worker not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
      scope: '/'
    });
    
    console.log('📱 Notification Service Worker registered successfully:', registration);
    return true;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return false;
  }
};

/**
 * Initialize notification system with mobile support
 * @returns {Promise<boolean>} Whether notifications were successfully initialized
 */
export const initializeNotifications = async () => {
  console.log('🔔 Initializing notification system...');
  
  if (!areBrowserNotificationsSupported()) {
    console.warn('📱 Browser notifications are not supported');
    return false;
  }

  // Register service worker for better mobile support
  if (isMobileDevice()) {
    console.log('📱 Mobile device detected, registering service worker...');
    await registerNotificationServiceWorker();
  }

  // Check if we already have permission
  if (hasNotificationPermission()) {
    console.log('🔔 Notification permission already granted');
    return true;
  }

  console.log('🔔 Notification permission not granted yet');
  // If no permission yet, don't auto-request - let user choose
  return false;
};

/**
 * Request notification permission with user-friendly mobile handling
 * @param {boolean} showMobileInstructions - Whether to show mobile-specific instructions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermissionWithInstructions = async (showMobileInstructions = true) => {
  if (!areBrowserNotificationsSupported()) {
    if (showMobileInstructions && isMobileDevice()) {
      console.warn('Notifications are not supported on this device. Please try updating your browser or using a different browser.');
    }
    return false;
  }

  if (hasNotificationPermission()) {
    return true;
  }

  // Show mobile-specific instructions via console for now
  if (showMobileInstructions && isMobileDevice()) {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      instructions = 'In Safari: Tap "Allow" when prompted, or go to Settings > Safari > Notifications to enable.';
    } else if (userAgent.includes('chrome')) {
      instructions = 'In Chrome: Tap "Allow" when prompted, or tap the 🔒 icon in the address bar > Notifications > Allow.';
    } else if (userAgent.includes('firefox')) {
      instructions = 'In Firefox: Tap "Allow" when prompted, or go to Settings > Site Settings > Notifications.';
    } else {
      instructions = 'Please allow notifications when prompted to receive appointment reminders and booking updates.';
    }
    
    console.log(`📱 Mobile Notification Setup: ${instructions}`);
  }

  // Standard permission request
  const permission = await requestNotificationPermission();
  return permission === 'granted';
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
  requestNotificationPermissionWithInstructions,
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
  registerNotificationServiceWorker,
  isMobileDevice,
  cleanupNotificationSounds
};
