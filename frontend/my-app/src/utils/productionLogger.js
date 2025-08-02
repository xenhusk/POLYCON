// Production-safe logging utility
// This avoids console.log removal by using alternative methods

export const prodLog = (...args) => {
  // Use a different method that won't be stripped by production builds
  if (typeof window !== 'undefined') {
    // Method 1: Store in a global for debugging
    window.debugLogs = window.debugLogs || [];
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
    };
    window.debugLogs.push(logEntry);
    
    // Method 2: Use alert for critical debugging (can be disabled)
    if (window.debugMode) {
      alert(`[${timestamp}] ${logEntry.args.join(' ')}`);
    }
    
    // Method 3: Use console methods that might not be stripped
    try {
      console.info(...args); // info might not be stripped
    } catch (e) {
      // Fallback if console is not available
    }
    
    // Method 4: Store in localStorage for persistent debugging
    try {
      const storedLogs = JSON.parse(localStorage.getItem('prodDebugLogs') || '[]');
      storedLogs.push(logEntry);
      // Keep only last 100 logs
      if (storedLogs.length > 100) {
        storedLogs.splice(0, storedLogs.length - 100);
      }
      localStorage.setItem('prodDebugLogs', JSON.stringify(storedLogs));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
};

// Helper to view logs in production
export const viewProdLogs = () => {
  if (typeof window !== 'undefined') {
    console.table(window.debugLogs || []);
    console.table(JSON.parse(localStorage.getItem('prodDebugLogs') || '[]'));
  }
};

// Helper to clear logs
export const clearProdLogs = () => {
  if (typeof window !== 'undefined') {
    window.debugLogs = [];
    localStorage.removeItem('prodDebugLogs');
  }
};

// Enable alert debugging mode
export const enableDebugMode = () => {
  if (typeof window !== 'undefined') {
    window.debugMode = true;
  }
};

// Disable alert debugging mode
export const disableDebugMode = () => {
  if (typeof window !== 'undefined') {
    window.debugMode = false;
  }
};

// Expose globally for browser console access
if (typeof window !== 'undefined') {
  window.prodLog = prodLog;
  window.viewProdLogs = viewProdLogs;
  window.clearProdLogs = clearProdLogs;
  window.enableDebugMode = enableDebugMode;
  window.disableDebugMode = disableDebugMode;
}
