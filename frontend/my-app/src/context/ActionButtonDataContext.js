import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

const ActionButtonDataContext = createContext({
  studentsData: [],
  teachersData: [],
  isPrefetching: false,
  lastFetchTime: null,
  prefetchActionButtonData: () => {},
  isDataStale: () => true
});

export const ActionButtonDataProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [studentsData, setStudentsData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Check if data is stale
  const isDataStale = () => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  // Prefetch function for action button data
  const prefetchActionButtonData = async (force = false) => {
    // Don't prefetch if data is fresh and not forced
    if (!force && !isDataStale()) {
      console.log('ActionButtonData: Using cached data, skipping prefetch');
      return;
    }

    setIsPrefetching(true);
    console.log('ActionButtonData: Starting prefetch...');

    try {
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userRole || !userEmail) {
        console.log('ActionButtonData: No user data, skipping prefetch');
        return;
      }

      const promises = [];

      // Prefetch students data (for both faculty and students for search)
      promises.push(
        fetch('http://localhost:5001/search/students?query=')
          .then(res => res.json())
          .then(data => {
            if (data.results) {
              setStudentsData(data.results);
              // Cache in React Query as well
              queryClient.setQueryData(['students', 'search', ''], data);
              console.log(`ActionButtonData: Prefetched ${data.results.length} students`);
            }
          })
          .catch(err => console.error('ActionButtonData: Error prefetching students:', err))
      );

      // Prefetch teachers data (for students)
      if (userRole === 'student') {
        promises.push(
          fetch('http://localhost:5001/search/teachers?query=')
            .then(res => res.json())
            .then(data => {
              if (data.results) {
                setTeachersData(data.results);
                // Cache in React Query as well
                queryClient.setQueryData(['teachers', 'search', ''], data);
                console.log(`ActionButtonData: Prefetched ${data.results.length} teachers`);
              }
            })
            .catch(err => console.error('ActionButtonData: Error prefetching teachers:', err))
        );
      }

      // Prefetch user's existing bookings
      const userId = localStorage.getItem('userID') || 
                    localStorage.getItem('studentID') || 
                    localStorage.getItem('teacherID');
      
      if (userId) {
        const roleForBookings = userRole === 'faculty' ? 'faculty' : 'student';
        promises.push(
          fetch(`http://localhost:5001/bookings/get_bookings?role=${roleForBookings}&userID=${userId}`)
            .then(res => res.json())
            .then(data => {
              // Cache bookings data
              queryClient.setQueryData(['bookings', roleForBookings, userId], data);
              console.log(`ActionButtonData: Prefetched ${data.length} bookings for ${roleForBookings}`);
            })
            .catch(err => console.error('ActionButtonData: Error prefetching bookings:', err))
        );
      }

      // Wait for all prefetch operations to complete
      await Promise.allSettled(promises);
      setLastFetchTime(Date.now());
      console.log('ActionButtonData: Prefetch completed successfully');

    } catch (error) {
      console.error('ActionButtonData: Prefetch failed:', error);
    } finally {
      setIsPrefetching(false);
    }
  };

  // Auto-prefetch on component mount and when user logs in
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail && isDataStale()) {
      // Add a small delay to avoid blocking initial app load
      const timer = setTimeout(() => {
        prefetchActionButtonData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Refresh data when user changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        prefetchActionButtonData(true); // Force refresh on user change
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue = {
    studentsData,
    teachersData,
    isPrefetching,
    lastFetchTime,
    prefetchActionButtonData,
    isDataStale
  };

  return (
    <ActionButtonDataContext.Provider value={contextValue}>
      {children}
    </ActionButtonDataContext.Provider>
  );
};

export const useActionButtonData = () => {
  const context = useContext(ActionButtonDataContext);
  if (!context) {
    throw new Error('useActionButtonData must be used within ActionButtonDataProvider');
  }
  return context;
};

export default ActionButtonDataContext;
