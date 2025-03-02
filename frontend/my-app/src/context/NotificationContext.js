import React, { createContext, useEffect, useRef } from 'react';
import useNotifications from '../hooks/useNotifications';

// Create context
export const NotificationContext = createContext(null);

// Create a provider component
export const NotificationProvider = ({ children }) => {
  // Always call the hook at the top level - this is required by React Rules of Hooks
  const notificationData = useNotifications();
  
  // Use a ref to track if this is a subsequent render
  const initializedRef = useRef(false);
  
  // Use useEffect to perform any one-time setup if needed
  useEffect(() => {
    if (!initializedRef.current) {
      console.log("Notification system initialized");
      initializedRef.current = true;
    }
  }, []);

  // Pass everything from the hook to the context
  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};
