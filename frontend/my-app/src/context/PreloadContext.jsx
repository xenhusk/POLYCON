import React, { createContext, useState, useContext, useEffect } from 'react';

const PreloadContext = createContext();

export function PreloadProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userRole = localStorage.getItem('userRole');
        const userId = localStorage.getItem(`${userRole}ID`);

        if (!userRole || !userId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5001/bookings/get_bookings?role=${userRole}&userID=${userId}&status=confirmed`);
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []); // Run only once on mount

  return (
    <PreloadContext.Provider value={{ appointments, isLoading }}>
      {children}
    </PreloadContext.Provider>
  );
}

export const usePreloadedData = () => {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreloadedData must be used within a PreloadProvider');
  }
  return context;
};
