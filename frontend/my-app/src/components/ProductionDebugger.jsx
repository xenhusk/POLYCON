import React, { useState, useEffect } from 'react';
import { viewProdLogs, clearProdLogs, enableDebugMode, disableDebugMode } from '../utils/productionLogger';

const ProductionDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const refreshLogs = () => {
    const storedLogs = JSON.parse(localStorage.getItem('prodDebugLogs') || '[]');
    const windowLogs = window.debugLogs || [];
    setLogs([...storedLogs, ...windowLogs]);
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      const interval = setInterval(refreshLogs, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleToggleDebugMode = () => {
    if (isDebugMode) {
      disableDebugMode();
    } else {
      enableDebugMode();
    }
    setIsDebugMode(!isDebugMode);
  };

  const handleClearLogs = () => {
    clearProdLogs();
    setLogs([]);
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
      }} onClick={() => setIsOpen(true)}>
        🐛 Debug
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '5px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px',
        borderRadius: '5px 5px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🐛 Production Debug Console</span>
        <button 
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          onClick={() => setIsOpen(false)}
        >
          ✖️
        </button>
      </div>
      
      <div style={{ padding: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <button 
            style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
            onClick={refreshLogs}
          >
            🔄 Refresh
          </button>
          <button 
            style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
            onClick={handleClearLogs}
          >
            🗑️ Clear
          </button>
          <button 
            style={{ 
              padding: '5px 10px', 
              fontSize: '12px',
              backgroundColor: isDebugMode ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px'
            }}
            onClick={handleToggleDebugMode}
          >
            {isDebugMode ? '🔇 Alerts OFF' : '🔊 Alerts ON'}
          </button>
        </div>
        
        <div style={{
          maxHeight: '350px',
          overflowY: 'auto',
          fontSize: '11px',
          backgroundColor: '#f8f9fa',
          padding: '5px',
          borderRadius: '3px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#666' }}>No debug logs yet. Wait for socket events...</div>
          ) : (
            logs.slice(-50).reverse().map((log, index) => (
              <div key={index} style={{ 
                marginBottom: '2px', 
                padding: '2px',
                borderBottom: '1px solid #eee',
                wordBreak: 'break-word'
              }}>
                <div style={{ color: '#666', fontSize: '10px' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div>{log.args.join(' ')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDebugger;
