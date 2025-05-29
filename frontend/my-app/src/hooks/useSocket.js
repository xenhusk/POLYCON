import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { queryClient } from '../utils/queryConfig';

// Global socket connection state for debugging
let SOCKET_CONNECTION_STATE = {
  connected: false,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  connectionAttempts: 0,
  errors: []
};

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
      SOCKET_CONNECTION_STATE.connectionAttempts++;
      console.log('🔌 Creating new socket connection to:', url);
      
      // Create socket instance with more debugging options
      socketInstance = io(url, {
        transports: ['websocket', 'polling'], // Try both transport methods
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000, // Increase timeout for slow connections
        // Increase ping interval to detect disconnects sooner
        pingInterval: 10000,
        pingTimeout: 8000,
        forceNew: false, // Reuse existing connection if possible
        autoConnect: true, // Connect automatically
      });

      // Log all socket events for debugging
      const onevent = socketInstance.onevent;
      socketInstance.onevent = function(packet) {
        const args = packet.data || [];
        console.log('🔌 Socket received event:', args[0], args.slice(1));
        onevent.call(this, packet);
      };

      // Override emit to log outgoing events
      const originalEmit = socketInstance.emit;
      socketInstance.emit = function(event, ...args) {
        console.log('🔌 Socket sending event:', event, args);
        return originalEmit.apply(this, [event, ...args]);
      };
    }
    
    socketRef.current = socketInstance;
    
    // Connection event handlers
    function onConnect() {
      console.log('🔌 Socket connected:', socketRef.current.id);
      setIsConnected(true);
      
      // Update global connection state
      SOCKET_CONNECTION_STATE.connected = true;
      SOCKET_CONNECTION_STATE.lastConnectedAt = new Date().toISOString();
      
      // Send a test message to confirm two-way communication
      socketRef.current.emit('ping_test', { 
        client: 'frontend', 
        timestamp: Date.now() 
      });
    }

    function onDisconnect(reason) {
      console.log('🔌 Socket disconnected, reason:', reason);
      setIsConnected(false);
      
      // Update global connection state
      SOCKET_CONNECTION_STATE.connected = false;
      SOCKET_CONNECTION_STATE.lastDisconnectedAt = new Date().toISOString();
      SOCKET_CONNECTION_STATE.errors.push({
        time: new Date().toISOString(),
        type: 'disconnect',
        reason: reason
      });
      
      // Try reconnecting manually in addition to socket.io's auto-reconnect
      setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          console.log('🔌 Manually attempting to reconnect socket...');
          socketRef.current.connect();
        }
      }, 2000);
    }

    function onError(error) {
      console.error('🔌 Socket connection error:', error);
      
      // Update global connection state
      SOCKET_CONNECTION_STATE.errors.push({
        time: new Date().toISOString(),
        type: 'error',
        error: String(error)
      });
    }
    
    function onPingResponse(data) {
      console.log('🔌 Received ping response:', data);
    }    // Define ping interval ID outside the condition to fix scoping issue
    let pingIntervalId = null;
    
    // Only add listeners if we have a socket
    if (socketRef.current) {
      socketRef.current.on('connect', onConnect);
      socketRef.current.on('disconnect', onDisconnect);
      socketRef.current.on('connect_error', onError);
      socketRef.current.on('pong_test', onPingResponse);
      
      // Set initial connection status
      setIsConnected(socketRef.current.connected);
      
      // If not connected, try to connect
      if (!socketRef.current.connected) {
        console.log('🔌 Socket not initially connected, attempting to connect...');
        socketRef.current.connect();
      }
      
      // Add handler for booking events directly to ensure they're caught
      socketRef.current.on('booking_created', (data) => {
        console.log('🔌 Direct booking_created event received:', data);
        // Force refresh of appointments
        queryClient.invalidateQueries('studentAppointments');
        queryClient.invalidateQueries('teacherAppointments');
      });
      
      socketRef.current.on('booking_updated', (data) => {
        console.log('🔌 Direct booking_updated event received:', data);
        // Force refresh of appointments
        queryClient.invalidateQueries('studentAppointments');
        queryClient.invalidateQueries('teacherAppointments');
      });
      
      // Ping the server every 30 seconds to keep connection alive
      pingIntervalId = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('ping_test', { client: 'frontend', timestamp: Date.now() });
        }
      }, 30000);
    }

    // Clean up connection event listeners
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', onConnect);
        socketRef.current.off('disconnect', onDisconnect);
        socketRef.current.off('connect_error', onError);
        socketRef.current.off('pong_test', onPingResponse);
        socketRef.current.off('booking_created');
        socketRef.current.off('booking_updated');
        
        // Clear ping interval if it exists
        if (pingIntervalId) {
          clearInterval(pingIntervalId);
        }
      }
    };
  }, [url]);

  // Enhanced "on" method that checks for existing listeners
  const on = useCallback((event, handler) => {
    if (!socketRef.current) {
      console.warn(`Socket not initialized when trying to listen for "${event}"`);
      return () => {};
    }
    
    // Create a unique key for this handler
    const handlerId = `${event}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔌 Adding listener for "${event}" event (id: ${handlerId})`);
    
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
      console.log(`🔌 Removed listener for "${event}" event (id: ${handlerId})`);
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
