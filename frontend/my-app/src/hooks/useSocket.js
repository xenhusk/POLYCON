import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { queryClient } from '../utils/queryConfig';

// Singleton socket instance
let socketInstance = null;
// Track active listeners to prevent duplicates
const activeListeners = new Map();

export function useSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());

  // Initialize socket connection
  useEffect(() => {
    if (!socketInstance && url) {
      console.log('🔌 Creating new socket connection');
      socketInstance = io(url, {
        transports: ['websocket'],
        reconnection: true,
        // Reduce unnecessary ping/pong traffic
        pingInterval: 25000,
        pingTimeout: 20000,
      });
    }
    
    socketRef.current = socketInstance;
    
    // Connection event handlers
    function onConnect() {
      console.log('🔌 Socket connected:', socketRef.current.id);
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    }

    function onError(error) {
      console.error('🔌 Socket connection error:', error);
    }

    // Only add listeners if we have a socket
    if (socketRef.current) {
      socketRef.current.on('connect', onConnect);
      socketRef.current.on('disconnect', onDisconnect);
      socketRef.current.on('connect_error', onError);
      
      // Set initial connection status
      setIsConnected(socketRef.current.connected);
    }

    // Clean up connection event listeners
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', onConnect);
        socketRef.current.off('disconnect', onDisconnect);
        socketRef.current.off('connect_error', onError);
      }
    };
  }, [url]);

  // Enhanced "on" method that checks for existing listeners
  const on = useCallback((event, handler) => {
    if (!socketRef.current) return () => {};
    
    // Create a unique key for this handler
    const handlerId = `${event}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we already have a listener for this event
    if (!activeListeners.has(event)) {
      activeListeners.set(event, new Map());
    }
    
    // Store this handler
    activeListeners.get(event).set(handlerId, handler);
    
    // Track for cleanup
    listenersRef.current.add(handlerId);
    
    // Add the actual socket listener
    socketRef.current.on(event, handler);
    
    // Return function to remove this specific handler
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
      if (activeListeners.has(event)) {
        activeListeners.get(event).delete(handlerId);
      }
      listenersRef.current.delete(handlerId);
    };
  }, []);

  // Enhanced "off" method
  const off = useCallback((event, handler) => {
    if (socketRef.current && handler) {
      socketRef.current.off(event, handler);
    }
  }, []);

  // Method to handle data updates through React Query
  const updateQueryData = useCallback((queryKey, updater) => {
    queryClient.setQueryData(queryKey, updater);
  }, []);

  // Clean up component-specific listeners on unmount
  useEffect(() => {
    return () => {
      // Clean up all listeners added by this component
      listenersRef.current.forEach(handlerId => {
        for (const [event, handlers] of activeListeners.entries()) {
          if (handlers.has(handlerId)) {
            const handler = handlers.get(handlerId);
            if (socketRef.current && handler) {
              socketRef.current.off(event, handler);
            }
            handlers.delete(handlerId);
          }
        }
      });
      listenersRef.current.clear();
    };
  }, []);

  return {
    isConnected,
    on,
    off,
    emit: useCallback((event, data) => {
      if (socketRef.current) {
        socketRef.current.emit(event, data);
      }
    }, []),
    updateQueryData
  };
}
