import React, { createContext } from 'react';
import useNotifications from '../hooks/useNotifications';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notificationsData = useNotifications();
  return (
    <NotificationContext.Provider value={notificationsData}>
      {children}
    </NotificationContext.Provider>
  );
};
