import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { apiRequestCounter } from '../utils/queryConfig';

const DataPrefetchContext = createContext({
  prefetchStatus: {
    isPrefetching: false,
    progress: 0,
    completed: 0,
    total: 0
  },
  triggerPrefetch: () => {},
  prefetchStats: {
    lastPrefetchTime: null,
    requestCount: 0
  }
});

export const DataPrefetchProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [prefetchStatus, setPrefetchStatus] = useState({
    isPrefetching: false,
    progress: 0,
    completed: 0,
    total: 0
  });
  const [prefetchStats, setPrefetchStats] = useState({
    lastPrefetchTime: null,
    requestCount: 0
  });

  // Function to prefetch all important data
  const triggerPrefetch = () => {
    const userEmail = localStorage.getItem('userEmail');
    const userID = localStorage.getItem('userID');
    const userRole = localStorage.getItem('userRole');
    
    if (!userEmail || !userID || !userRole) {
      console.log('Skipping prefetch - missing user data');
      return;
    }
    
    // Reset the counter
    apiRequestCounter.reset();
    
    // Define all queries to prefetch
    const prefetchQueries = [
      { 
        queryKey: ['userData', userEmail],
        url: `http://localhost:5001/user/get_user?email=${userEmail}`
      },
      { 
        queryKey: ['bookings', userRole, userID],
        url: `http://localhost:5001/bookings/get_bookings?role=${userRole}&userID=${userID}&status=confirmed`
      },
      { 
        queryKey: ['courses'],
        url: `http://localhost:5001/course/get_courses`
      }
    ];
    
    // If user is student, also prefetch grades
    if (userRole === 'student') {
      prefetchQueries.push({
        queryKey: ['grades', userID],
        url: `http://localhost:5001/grade/get_student_grades?studentID=${userID}&schoolYear=&semester=&period=`
      });
    }
    
    const totalQueries = prefetchQueries.length;
    let completedQueries = 0;
    
    // Start prefetching
    setPrefetchStatus({
      isPrefetching: true,
      progress: 0,
      completed: 0,
      total: totalQueries
    });
    
    // Prefetch all queries
    prefetchQueries.forEach(({ queryKey, url }) => {
      queryClient.prefetchQuery(
        queryKey,
        async () => {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch');
          return response.json();
        },
        {
          staleTime: 10 * 60 * 1000, // 10 minutes
          cacheTime: 30 * 60 * 1000 // 30 minutes
        }
      ).then(() => {
        completedQueries++;
        const progress = Math.round((completedQueries / totalQueries) * 100);
        
        setPrefetchStatus({
          isPrefetching: completedQueries < totalQueries,
          progress,
          completed: completedQueries,
          total: totalQueries
        });
        
        // If all completed, update stats
        if (completedQueries === totalQueries) {
          setPrefetchStats({
            lastPrefetchTime: new Date(),
            requestCount: apiRequestCounter.count
          });
          
          console.log('✅ Data prefetching complete', apiRequestCounter.count);
          apiRequestCounter.log();
        }
      });
    });
  };
  
  // On mount, trigger prefetch
  useEffect(() => {
    if (localStorage.getItem('userEmail')) {
      setTimeout(() => {
        triggerPrefetch();
      }, 1000); // Small delay to allow the app to render first
    }
  }, []);

  return (
    <DataPrefetchContext.Provider value={{
      prefetchStatus,
      triggerPrefetch,
      prefetchStats
    }}>
      {children}
    </DataPrefetchContext.Provider>
  );
};

export const usePrefetch = () => useContext(DataPrefetchContext);
