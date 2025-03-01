import { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';

/**
 * Hook to manage data preloading when app starts
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @returns {Object} Preload state and control functions
 */
export default function usePreload(isLoggedIn) {
  const [isLoading, setIsLoading] = useState(isLoggedIn);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showOverlay, setShowOverlay] = useState(isLoggedIn);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Function to run all preload tasks
  const preloadAllData = async () => {
    // Don't preload if not logged in
    if (!isLoggedIn) {
      setIsLoading(false);
      setShowOverlay(false);
      return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userID');
    const studentId = localStorage.getItem('studentID');

    // Exit preload if no user credentials
    if (!userEmail || !userRole) {
      setIsLoading(false);
      setShowOverlay(false);
      setError('Missing user credentials');
      return;
    }

    setIsLoading(true);
    setShowOverlay(true);
    setError(null);
    
    const totalTasks = 6;
    let completedCount = 0;
    
    const updateProgress = (taskName) => {
      completedCount++;
      const progress = Math.floor((completedCount / totalTasks) * 100);
      setLoadingProgress(progress);
      console.log(`Preloaded: ${taskName} (${completedCount}/${totalTasks})`);
    };

    try {
      const tasks = [
        // Task 1: Prefetch user data
        queryClient.prefetchQuery({
          queryKey: ['userData', userEmail],
          queryFn: async () => {
            const res = await fetch(`http://localhost:5001/user/get_user?email=${userEmail}`);
            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            return data;
          },
          staleTime: 1000 * 60 * 5, // 5 minutes
        }).then(() => updateProgress('user data')),
        
        // Task 2: Prefetch bookings
        userId ? 
          queryClient.prefetchQuery({
            queryKey: ['bookings', userRole, userId, 'confirmed'],
            queryFn: async () => {
              const res = await fetch(`http://localhost:5001/bookings/get_bookings?role=${userRole}&userID=${userId}&status=confirmed`);
              if (!res.ok) throw new Error('Failed to fetch bookings');
              return res.json();
            },
            staleTime: 1000 * 60 * 2, // 2 minutes
          }).then(() => updateProgress('bookings'))
          : Promise.resolve().then(() => updateProgress('bookings (skipped)')),
        
        // Task 3: Prefetch grades
        studentId ? 
          queryClient.prefetchQuery({
            queryKey: ['grades', studentId],
            queryFn: async () => {
              const res = await fetch(`http://localhost:5001/grade/get_student_grades?studentID=${studentId}&schoolYear=&semester=&period=`);
              if (!res.ok) throw new Error('Failed to fetch grades');
              return res.json();
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
          }).then(() => updateProgress('grades'))
          : Promise.resolve().then(() => updateProgress('grades (skipped)')),
        
        // Task 4: Prefetch courses
        queryClient.prefetchQuery({
          queryKey: ['courses'],
          queryFn: async () => {
            const res = await fetch(`http://localhost:5001/course/get_courses`);
            if (!res.ok) throw new Error('Failed to fetch courses');
            return res.json();
          },
          staleTime: 1000 * 60 * 10, // 10 minutes
        }).then(() => updateProgress('courses')),
        
        // Task 5: Prefetch consultation history
        userId ? 
          queryClient.prefetchQuery({
            queryKey: ['consultation-history', userRole, userId],
            queryFn: async () => {
              const res = await fetch(`http://localhost:5001/consultation/get_history?role=${userRole}&userID=${userId}`);
              if (!res.ok) throw new Error('Failed to fetch consultation history');
              return res.json();
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
          }).then(() => updateProgress('consultation history'))
          : Promise.resolve().then(() => updateProgress('consultation history (skipped)')),
          
        // Task 6: Prefetch enrollment status for students
        userRole === 'student' && studentId ? 
          queryClient.prefetchQuery({
            queryKey: ['enrollment-status', studentId],
            queryFn: async () => {
              const res = await fetch(`http://localhost:5001/enrollment/status?studentID=${studentId}`);
              if (!res.ok) throw new Error('Failed to fetch enrollment status');
              const data = await res.json();
              if (typeof data.isEnrolled === 'boolean') {
                localStorage.setItem('isEnrolled', data.isEnrolled.toString());
              }
              return data;
            },
            staleTime: 1000 * 60 * 10, // 10 minutes
          }).then(() => updateProgress('enrollment status'))
          : Promise.resolve().then(() => updateProgress('enrollment status (skipped)'))
      ];
      
      await Promise.allSettled(tasks);
      
      // Invalidate search caches to ensure fresh results
      if (userRole === 'faculty' || userRole === 'admin') {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      }
      
    } catch (error) {
      console.error("Error during preload:", error);
      setError(error.message);
    } finally {
      // Always complete loading
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        setShowOverlay(false);
      }, 500);
    }
  };

  // Function to manually trigger preload
  const startPreload = () => {
    if (!isLoading) {
      preloadAllData();
    }
  };

  return {
    isLoading, 
    loadingProgress, 
    showOverlay,
    error,
    startPreload
  };
}
