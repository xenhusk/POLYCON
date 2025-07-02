import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { playNotificationSound, areSoundNotificationsEnabled, toggleSoundNotifications } from '../utils/notificationUtils';

const SocketTest = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [events, setEvents] = useState([]);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔗 Socket connected');
      setConnectionStatus('Connected');
      addEvent('Socket connected', 'success');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnectionStatus('Disconnected');
      addEvent('Socket disconnected', 'error');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
      setConnectionStatus('Error');
      addEvent(`Connection error: ${error.message}`, 'error');
    });

    // Booking event listeners
    newSocket.on('booking_created', (data) => {
      console.log('✨ booking_created received:', data);
      addEvent(`booking_created: ${JSON.stringify(data)}`, 'info');
    });

    newSocket.on('booking_confirmed', (data) => {
      console.log('✅ booking_confirmed received:', data);
      addEvent(`booking_confirmed: ${JSON.stringify(data)}`, 'info');
    });

    newSocket.on('booking_cancelled', (data) => {
      console.log('❌ booking_cancelled received:', data);
      addEvent(`booking_cancelled: ${JSON.stringify(data)}`, 'info');
    });

    // Connection confirmation
    newSocket.on('connection_confirmed', (data) => {
      console.log('📡 Connection confirmed:', data);
      addEvent(`Connection confirmed: ${JSON.stringify(data)}`, 'success');
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const addEvent = (message, type) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [...prev, { message, type, timestamp }]);
  };

  const testBookingCreated = async () => {
    try {
      const response = await fetch('http://localhost:5001/socket-test/test-booking-created');
      const result = await response.json();
      setTestResults(prev => ({ ...prev, created: result }));
      addEvent('Triggered test booking_created', 'info');
    } catch (error) {
      addEvent(`Error testing booking_created: ${error.message}`, 'error');
    }
  };

  const testBookingConfirmed = async () => {
    try {
      const response = await fetch('http://localhost:5001/socket-test/test-booking-confirmed');
      const result = await response.json();
      setTestResults(prev => ({ ...prev, confirmed: result }));
      addEvent('Triggered test booking_confirmed', 'info');
    } catch (error) {
      addEvent(`Error testing booking_confirmed: ${error.message}`, 'error');
    }
  };
  const testBookingCancelled = async () => {
    try {
      const response = await fetch('http://localhost:5001/socket-test/test-booking-cancelled');
      const result = await response.json();
      setTestResults(prev => ({ ...prev, cancelled: result }));
      addEvent('Triggered test booking_cancelled', 'info');
    } catch (error) {
      addEvent(`Error testing booking_cancelled: ${error.message}`, 'error');
    }
  };

  // Sound test functions
  const testNotificationSound = () => {
    playNotificationSound('message', 0.7);
    addEvent('Testing notification sound', 'info');
  };

  const testBookingSound = () => {
    playNotificationSound('booking', 0.7);
    addEvent('Testing booking sound', 'info');
  };

  const testSuccessSound = () => {
    playNotificationSound('success', 0.7);
    addEvent('Testing success sound', 'info');
  };

  const testErrorSound = () => {
    playNotificationSound('error', 0.7);
    addEvent('Testing error sound', 'info');
  };

  const toggleSounds = () => {
    const currentStatus = areSoundNotificationsEnabled();
    toggleSoundNotifications(!currentStatus);
    addEvent(`Sound notifications ${!currentStatus ? 'enabled' : 'disabled'}`, 'info');
  };

  const clearEvents = () => {
    setEvents([]);
    setTestResults({});
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return 'text-green-600';
      case 'Disconnected': return 'text-gray-600';
      case 'Error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Socket.IO Test Dashboard</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p className={`font-medium ${getStatusColor()}`}>
          Status: {connectionStatus}
        </p>
        {socket && (
          <p className="text-sm text-gray-600">
            Socket ID: {socket.id || 'Not available'}
          </p>
        )}
      </div>      {/* Test Buttons */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Socket Event Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testBookingCreated}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Test booking_created
          </button>
          <button
            onClick={testBookingConfirmed}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Test booking_confirmed
          </button>
          <button
            onClick={testBookingCancelled}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Test booking_cancelled
          </button>
        </div>
      </div>

      {/* Sound Test Buttons */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Sound Tests</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Sound notifications: {areSoundNotificationsEnabled() ? '🔊 Enabled' : '🔇 Disabled'}
          </p>
          <button
            onClick={toggleSounds}
            className={`px-4 py-2 rounded transition-colors ${
              areSoundNotificationsEnabled() 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {areSoundNotificationsEnabled() ? 'Disable Sounds' : 'Enable Sounds'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={testNotificationSound}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
          >
            🔔 Notification
          </button>
          <button
            onClick={testBookingSound}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors"
          >
            📅 Booking
          </button>
          <button
            onClick={testSuccessSound}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            ✅ Success
          </button>
          <button
            onClick={testErrorSound}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            ❌ Error
          </button>
        </div>
      </div>

      {/* Events Log */}
      <div className="mb-6 p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Events Log</h2>
          <button
            onClick={clearEvents}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Clear Log
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
          {events.length === 0 ? (
            <p className="text-gray-500 italic">No events yet...</p>
          ) : (
            events.map((event, index) => (
              <div key={index} className="mb-1 text-sm">
                <span className="text-gray-400">[{event.timestamp}]</span>
                <span className={`ml-2 ${getEventColor(event.type)}`}>
                  {event.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SocketTest;
