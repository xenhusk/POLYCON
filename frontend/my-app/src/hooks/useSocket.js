import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

let socketInstance = null;

export function useSocket(url) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      console.log('Creating new socket connection');
      socketInstance = io(url, {
        transports: ['websocket'],
        reconnection: true,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect, just remove listeners
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
      }
    };
  }, [url]);

  return socketRef.current;
}
