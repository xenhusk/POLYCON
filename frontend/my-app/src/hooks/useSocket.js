import { useCallback } from 'react';
import { queryClient } from '../utils/queryConfig';

// Stub implementation of useSocket hook to replace Socket.IO
export function useSocket() {  // Stub implementation that keeps the interface but doesn't do Socket.IO operations
  console.log('Using stub Socket.IO implementation - real-time updates disabled');
  
  // Stub for "on" method
  const on = useCallback((event, handler) => {
    console.log(`Socket event listener requested for "${event}" (disabled)`);
    // Return no-op cleanup function
    return () => {};
  }, []);

  // Stub for "off" method  
  const off = useCallback((event, handler) => {
    console.log(`Socket event removal requested for "${event}" (disabled)`);
  }, []);

  // Stub for "emit" method
  const emit = useCallback((event, data) => {
    console.log(`Socket emit requested for "${event}" with data:`, data, "(disabled)");
  }, []);
  
  // Maintain the queryClient interface for data updates
  const updateQueryData = useCallback((queryKey, updater) => {
    queryClient.invalidateQueries(queryKey);
  }, []);

  return {
    isConnected: false, // Always returns false since we're not connecting
    on,
    off,
    emit,
    updateQueryData
  };
}
