import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import API_URL from '../apiConfig';

const WebSocketDebug = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState({});

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  useEffect(() => {
    addLog('Initializing WebSocket connection...', 'info');
    
    const newSocket = io(API_URL, {
      transports: ['polling', 'websocket'],
      timeout: 30000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      upgrade: true,
      rememberUpgrade: false
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      addLog('✅ Socket connected successfully', 'success');
      setConnectionStatus('Connected');
      
      // Test ping/pong
      newSocket.emit('ping');
    });

    newSocket.on('disconnect', (reason) => {
      addLog(`❌ Socket disconnected: ${reason}`, 'error');
      setConnectionStatus('Disconnected');
    });

    newSocket.on('connect_error', (error) => {
      addLog(`🚫 Connection error: ${error.message}`, 'error');
      setConnectionStatus('Error');
    });

    newSocket.on('reconnect', (attemptNumber) => {
      addLog(`🔄 Reconnected after ${attemptNumber} attempts`, 'success');
      setConnectionStatus('Connected');
    });

    newSocket.on('reconnect_error', (error) => {
      addLog(`🔄 Reconnection error: ${error.message}`, 'error');
    });

    newSocket.on('reconnect_failed', () => {
      addLog('❌ Reconnection failed - giving up', 'error');
      setConnectionStatus('Failed');
    });

    // Test events
    newSocket.on('connection_confirmed', (data) => {
      addLog(`📡 Connection confirmed: ${JSON.stringify(data)}`, 'success');
    });

    newSocket.on('pong', (data) => {
      addLog(`🏓 Pong received: ${JSON.stringify(data)}`, 'success');
    });

    newSocket.on('joined_room', (data) => {
      addLog(`🏠 Joined room: ${JSON.stringify(data)}`, 'success');
    });

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const testConnection = async () => {
    addLog('🧪 Testing WebSocket health endpoint...', 'info');
    
    try {
      const response = await fetch(`${API_URL}/websocket/health`);
      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ Health check passed: ${JSON.stringify(data)}`, 'success');
        setTestResults(prev => ({ ...prev, healthCheck: 'passed' }));
      } else {
        addLog(`❌ Health check failed: ${JSON.stringify(data)}`, 'error');
        setTestResults(prev => ({ ...prev, healthCheck: 'failed' }));
      }
    } catch (error) {
      addLog(`❌ Health check error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, healthCheck: 'error' }));
    }
  };

  const testPing = () => {
    if (socket && socket.connected) {
      addLog('🏓 Sending ping...', 'info');
      socket.emit('ping');
    } else {
      addLog('❌ Socket not connected', 'error');
    }
  };

  const testJoinRoom = () => {
    if (socket && socket.connected) {
      const userId = localStorage.getItem('userId') || 'test-user';
      addLog(`🏠 Joining room for user: ${userId}`, 'info');
      socket.emit('join_user_room', { userId });
    } else {
      addLog('❌ Socket not connected', 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">WebSocket Debug Console</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'Error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {connectionStatus}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">API URL:</span>
              <span className="text-sm text-gray-600">{API_URL}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Socket ID:</span>
              <span className="text-sm text-gray-600">{socket?.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-2">
            <button
              onClick={testConnection}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Health Check
            </button>
            <button
              onClick={testPing}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Ping
            </button>
            <button
              onClick={testJoinRoom}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Join User Room
            </button>
            <button
              onClick={clearLogs}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                <span className={
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'error' ? 'text-red-400' :
                  'text-blue-400'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketDebug;
