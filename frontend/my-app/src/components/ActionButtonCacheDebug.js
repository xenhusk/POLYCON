import React, { useState, useEffect } from 'react';
import { useActionButtonData } from '../context/ActionButtonDataContext';

/**
 * Debug component for monitoring ActionButton cache status
 * Add this to your development environment to monitor cache performance
 */
const ActionButtonCacheDebug = () => {
  const { 
    studentsData, 
    teachersData, 
    isPrefetching, 
    lastFetchTime, 
    isDataStale, 
    getCacheInfo,
    refreshCache,
    clearCache,
    hasCachedData
  } = useActionButtonData();
  
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (getCacheInfo) {
      setCacheInfo(getCacheInfo());
    }
  }, [studentsData, teachersData, getCacheInfo]);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show Cache Debug Info"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Cache Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Students:</span>
            <div className="text-gray-600">{studentsData.length} cached</div>
          </div>
          <div>
            <span className="font-medium">Teachers:</span>
            <div className="text-gray-600">{teachersData.length} cached</div>
          </div>
        </div>
        
        <div>
          <span className="font-medium">Last Fetch:</span>
          <div className="text-gray-600">{formatTime(lastFetchTime)}</div>
        </div>
        
        <div>
          <span className="font-medium">Status:</span>
          <div className={`${isDataStale() ? 'text-orange-600' : 'text-green-600'}`}>
            {isPrefetching ? 'Fetching...' : isDataStale() ? 'Stale' : 'Fresh'}
          </div>
        </div>
        
        {cacheInfo && (
          <div>
            <span className="font-medium">Cache Size:</span>
            <div className="text-gray-600">{cacheInfo.cacheSizeKB.total} KB</div>
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={refreshCache}
            disabled={isPrefetching}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:bg-gray-300"
          >
            Refresh
          </button>
          <button
            onClick={clearCache}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtonCacheDebug;
