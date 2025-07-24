/**
 * Conditional logging utility for production vs development
 * This allows you to control console logging based on environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    // Warnings should show in production for important issues
    console.warn(...args);
  },
  
  error: (...args) => {
    // Errors should always show
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  group: (...args) => {
    if (isDevelopment) {
      console.group(...args);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
  
  table: (...args) => {
    if (isDevelopment) {
      console.table(...args);
    }
  }
};

// For backwards compatibility, you can also use:
export const devLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const devError = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  }
};
