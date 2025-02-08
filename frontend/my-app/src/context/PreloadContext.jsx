import React, { createContext, useState, useContext, useEffect } from 'react';

const PreloadContext = createContext();

// Helper function to fetch data based on type
const fetchDataForType = async (pageType) => {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userID');

  const endpoints = {
    appointments: `http://localhost:5001/bookings/get_${userRole}_bookings?${userRole}ID=${userId}`,
    grades: `http://localhost:5001/grade/get_grades?studentID=${userId}`,
    courses: 'http://localhost:5001/course/get_courses',
    userDetails: `http://localhost:5001/user/get_user?email=${userEmail}`,
  };

  if (!endpoints[pageType]) {
    throw new Error(`Unknown page type: ${pageType}`);
  }

  const response = await fetch(endpoints[pageType]);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${pageType}`);
  }
  return response.json();
};

export function PreloadProvider({ children }) {
  const [preloadedData, setPreloadedData] = useState({
    appointments: null,
    grades: null,
    courses: null,
    userDetails: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial data load when user logs in
  useEffect(() => {
    const loadAllData = async () => {
      if (!isInitialized && localStorage.getItem('userEmail')) {
        setIsLoading(true);
        try {
          const [appointments, grades, courses, userDetails] = await Promise.all([
            fetchDataForType('appointments'),
            fetchDataForType('grades'),
            fetchDataForType('courses'),
            fetchDataForType('userDetails'),
          ]);

          setPreloadedData({
            appointments,
            grades,
            courses,
            userDetails,
          });
          setIsInitialized(true);
        } catch (error) {
          console.error('Error loading initial data:', error);
        }
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isInitialized]);

  // Manual reload function for specific page types
  const reloadCurrentPage = async (pageType) => {
    setIsLoading(true);
    try {
      const newData = await fetchDataForType(pageType);
      setPreloadedData(prev => ({
        ...prev,
        [pageType]: newData
      }));
    } catch (error) {
      console.error('Error reloading page:', error);
    }
    setIsLoading(false);
  };

  return (
    <PreloadContext.Provider value={{ 
      preloadedData, 
      setPreloadedData, 
      isLoading, 
      reloadCurrentPage,
      isInitialized 
    }}>
      {children}
    </PreloadContext.Provider>
  );
}

export const usePreloadedData = () => useContext(PreloadContext);
