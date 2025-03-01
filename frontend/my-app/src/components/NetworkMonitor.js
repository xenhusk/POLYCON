import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { apiRequestCounter } from '../utils/queryConfig';
import { usePrefetch } from '../context/DataPrefetchContext';

const NetworkMonitor = ({ visible = true }) => {
  // Initialize from localStorage if available
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('networkMonitorVisible');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  // Separate state for the monitor panel visibility
  const [showPanel, setShowPanel] = useState(() => {
    const saved = localStorage.getItem('networkMonitorPanelVisible');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [apiCalls, setApiCalls] = useState({ count: 0, endpoints: {} });
  const queryClient = useQueryClient();
  const { prefetchStatus, triggerPrefetch, prefetchStats } = usePrefetch();
  
  // Save visibility preference to localStorage
  useEffect(() => {
    localStorage.setItem('networkMonitorVisible', JSON.stringify(isVisible));
  }, [isVisible]);
  
  // Save panel visibility preference
  useEffect(() => {
    localStorage.setItem('networkMonitorPanelVisible', JSON.stringify(showPanel));
  }, [showPanel]);
  
  // Update stats every second if the panel is visible
  useEffect(() => {
    if (!showPanel) return;
    
    const interval = setInterval(() => {
      setApiCalls({
        count: apiRequestCounter.count,
        endpoints: { ...apiRequestCounter.endpoints }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showPanel]);
  
  // If neither the toggle nor panel should be visible, return nothing
  if (!visible) return null;
  
  return (
    <>
      {/* Always visible toggle button in top right corner */}
      <div 
        className="fixed top-4 right-4 z-50 flex items-center gap-2"
        style={{ pointerEvents: 'auto' }}
      >
        {isVisible && (
          <button
            onClick={() => setShowPanel(!showPanel)}
            className={`px-2 py-1 rounded text-xs ${
              showPanel ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-90 shadow-sm transition-all duration-200 flex items-center gap-1`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${
              apiRequestCounter.count > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></span>
            {showPanel ? 'Hide Monitor' : 'Show Monitor'}
          </button>
        )}
        
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border shadow-sm flex items-center justify-center text-gray-500 focus:outline-none"
          title={isVisible ? "Hide developer tools" : "Show developer tools"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5V6H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V7H6a.5.5 0 0 1 0-1h1.5V4.5A.5.5 0 0 1 8 4z"/>
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"/>
          </svg>
        </button>
      </div>
      
      {/* Monitor panel only visible when both flags are true */}
      {isVisible && showPanel && (
        <div className="fixed bottom-0 right-0 bg-white border shadow-lg p-3 m-4 rounded-lg text-sm z-40 max-w-md">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-700">Network Monitor</h4>
            <button 
              className="text-xs text-blue-500 hover:underline"
              onClick={() => setShowPanel(false)}
            >
              Close
            </button>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between">
              <span>Total API calls:</span>
              <span className="font-medium">{apiCalls.count}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Cached queries:</span>
              <span className="font-medium">{Object.keys(queryClient.getQueryCache().findAll()).length}</span>
            </div>
            
            <div className="mt-3">
              <h5 className="font-medium text-gray-700 mb-1">Endpoints Hit:</h5>
              <div className="max-h-32 overflow-y-auto">
                {Object.entries(apiCalls.endpoints).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex justify-between text-xs py-1 border-b">
                    <span className="truncate max-w-[70%]">{endpoint}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-3">
                <h5 className="font-medium text-gray-700 mb-1">Data Prefetch:</h5>
                {prefetchStatus.isPrefetching ? (
                  <div className="text-xs">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${prefetchStatus.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-1">
                      Prefetching: {prefetchStatus.completed}/{prefetchStatus.total} ({prefetchStatus.progress}%)
                    </div>
                  </div>
                ) : (
                  <div className="text-xs">
                    {prefetchStats.lastPrefetchTime ? (
                      <>
                        <div>Last prefetch: {new Date(prefetchStats.lastPrefetchTime).toLocaleTimeString()}</div>
                        <div>Requests: {prefetchStats.requestCount}</div>
                      </>
                    ) : (
                      <div>No prefetch performed yet</div>
                    )}
                    <button 
                      onClick={triggerPrefetch}
                      className="mt-1 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Prefetch Data
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => {
                    queryClient.clear();
                    apiRequestCounter.reset();
                    setApiCalls({ count: 0, endpoints: {} });
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Clear Cache
                </button>
                <button 
                  onClick={() => {
                    apiRequestCounter.reset();
                    setApiCalls({ count: 0, endpoints: {} });
                  }}
                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                >
                  Reset Counter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkMonitor;
