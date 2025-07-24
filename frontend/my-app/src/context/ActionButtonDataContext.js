import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { CACHE_KEYS, getCacheInfo, validateCacheData, shouldClearCacheForSpace } from '../utils/cacheUtils';
import API_URL from '../apiConfig';

const ActionButtonDataContext = createContext({
  studentsData: [],
  teachersData: [],
  isPrefetching: false,
  lastFetchTime: null,
  prefetchActionButtonData: () => {},
  isDataStale: () => true,
  clearCache: () => {}
});

export const ActionButtonDataProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [studentsData, setStudentsData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Load data from localStorage on component mount
  useEffect(() => {
    loadFromCache();
  }, []);

  // Load cached data from localStorage
  const loadFromCache = () => {
    try {
      // Validate cache integrity first
      const validation = validateCacheData();
      if (!validation.isValid) {
        console.warn('ActionButtonData: Cache validation failed:', validation.errors);
        clearCache();
        return;
      }

      // Check if storage space is getting full
      if (shouldClearCacheForSpace()) {
        console.warn('ActionButtonData: Storage space low, clearing cache');
        clearCache();
        return;
      }

      const currentUserId = getCurrentUserId();
      const cachedUserId = localStorage.getItem(CACHE_KEYS.USER_ID);
      
      // Clear cache if user has changed
      if (cachedUserId && cachedUserId !== currentUserId) {
        console.log('ActionButtonData: User changed, clearing cache');
        clearCache();
        return;
      }

      const cachedStudents = localStorage.getItem(CACHE_KEYS.STUDENTS);
      const cachedTeachers = localStorage.getItem(CACHE_KEYS.TEACHERS);
      const cachedLastFetch = localStorage.getItem(CACHE_KEYS.LAST_FETCH);

      if (cachedStudents) {
        const studentsData = JSON.parse(cachedStudents);
        setStudentsData(studentsData);
        console.log(`ActionButtonData: Loaded ${studentsData.length} students from localStorage cache`);
      }

      if (cachedTeachers) {
        const teachersData = JSON.parse(cachedTeachers);
        setTeachersData(teachersData);
        console.log(`ActionButtonData: Loaded ${teachersData.length} teachers from localStorage cache`);
      }

      if (cachedLastFetch) {
        const lastFetch = parseInt(cachedLastFetch);
        setLastFetchTime(lastFetch);
        console.log(`ActionButtonData: Last fetch time loaded: ${new Date(lastFetch).toLocaleString()}`);
        
        // Log cache info
        const cacheInfo = getCacheInfo();
        console.log('ActionButtonData: Cache info:', cacheInfo);
      }

      // Update stored user ID
      localStorage.setItem(CACHE_KEYS.USER_ID, currentUserId || '');

    } catch (error) {
      console.error('ActionButtonData: Error loading from localStorage cache:', error);
      clearCache();
    }
  };

  // Save data to localStorage
  const saveToCache = (students, teachers, fetchTime) => {
    try {
      if (students && students.length > 0) {
        localStorage.setItem(CACHE_KEYS.STUDENTS, JSON.stringify(students));
      }
      if (teachers && teachers.length > 0) {
        localStorage.setItem(CACHE_KEYS.TEACHERS, JSON.stringify(teachers));
      }
      if (fetchTime) {
        localStorage.setItem(CACHE_KEYS.LAST_FETCH, fetchTime.toString());
      }
      
      const currentUserId = getCurrentUserId();
      localStorage.setItem(CACHE_KEYS.USER_ID, currentUserId || '');
      
      console.log('ActionButtonData: Data saved to cache');
    } catch (error) {
      console.error('ActionButtonData: Error saving to cache:', error);
    }
  };

  // Clear all cached data
  const clearCache = () => {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    setStudentsData([]);
    setTeachersData([]);
    setLastFetchTime(null);
    console.log('ActionButtonData: Cache cleared');
  };

  // Get current user identifier
  const getCurrentUserId = () => {
    return localStorage.getItem('userEmail') || 
           localStorage.getItem('userID') || 
           localStorage.getItem('studentID') || 
           localStorage.getItem('teacherID') || 
           null;
  };

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
    console.log('ActionButtonData: Using API URL:', API_URL);

    try {
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userRole || !userEmail) {
        console.log('ActionButtonData: No user data, skipping prefetch');
        return;
      }

      const promises = [];
      let fetchedStudents = [];
      let fetchedTeachers = [];

      // Prefetch students data (for both faculty and students for search)
      promises.push(
        fetch(`${API_URL}/search/students?query=`)
          .then(res => res.json())
          .then(data => {
            if (data.results) {
              fetchedStudents = data.results;
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
          fetch(`${API_URL}/search/teachers?query=`)
            .then(res => res.json())
            .then(data => {
              if (data.results) {
                fetchedTeachers = data.results;
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
          fetch(`${API_URL}/bookings/get_bookings?role=${roleForBookings}&userID=${userId}`)
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
      
      const fetchTime = Date.now();
      setLastFetchTime(fetchTime);
      
      // Save to localStorage
      saveToCache(fetchedStudents, fetchedTeachers, fetchTime);
      
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
    if (userEmail) {
      // Check if we have cached data first
      if (studentsData.length === 0 || teachersData.length === 0 || isDataStale()) {
        // Add a small delay to avoid blocking initial app load
        const timer = setTimeout(() => {
          prefetchActionButtonData();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [studentsData, teachersData]);

  // Refresh data when user changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if user-related data changed
      if (['userEmail', 'userRole', 'userID', 'studentID', 'teacherID'].includes(e.key)) {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          console.log('ActionButtonData: User data changed, refreshing cache');
          clearCache();
          prefetchActionButtonData(true); // Force refresh on user change
        } else {
          // User logged out, clear cache
          clearCache();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Monitor user logout
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail && (studentsData.length > 0 || teachersData.length > 0)) {
      // User logged out, clear cache
      console.log('ActionButtonData: User logged out, clearing cache');
      clearCache();
    }
  }, []);

  const contextValue = {
    studentsData,
    teachersData,
    isPrefetching,
    lastFetchTime,
    prefetchActionButtonData,
    isDataStale,
    clearCache,
    // Additional debugging and utility methods
    getCacheInfo,
    refreshCache: () => prefetchActionButtonData(true),
    hasCachedData: studentsData.length > 0 || teachersData.length > 0
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
