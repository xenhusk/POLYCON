// Simple toast utility functions that can be used without React context
// These are fallback functions for cases where the ToastContext is not available

export const showSuccess = (title, message, duration = 5000) => {
  console.log(`✅ ${title}: ${message}`);
  // You can add additional fallback logic here if needed
};

export const showError = (title, message, duration = 8000) => {
  console.error(`❌ ${title}: ${message}`);
  // You can add additional fallback logic here if needed
};

export const showWarning = (title, message, duration = 6000) => {
  console.warn(`⚠️ ${title}: ${message}`);
  // You can add additional fallback logic here if needed
};

export const showInfo = (title, message, duration = 5000) => {
  console.info(`ℹ️ ${title}: ${message}`);
  // You can add additional fallback logic here if needed
};
