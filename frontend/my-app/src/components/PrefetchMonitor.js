import React, { useState, useEffect } from 'react';

const PrefetchMonitor = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch prefetch status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/prefetch/status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch prefetch status');
      console.error('Error fetching prefetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Force prefetch
  const forcePrefetch = async () => {
    try {
      setLoading(true);
      const response = await fetch('/prefetch/force', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        // Refresh status after successful force prefetch
        setTimeout(fetchStatus, 1000);
      } else {
        setError(data.error || 'Failed to force prefetch');
      }
    } catch (err) {
      setError('Failed to force prefetch');
      console.error('Error forcing prefetch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Concern Analytics Prefetch Service
        </h3>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Refresh Status"
        >
          <svg
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {status && (
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    status.running ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  Status: {status.running ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">
                Interval: {status.interval_minutes} minutes
              </span>
            </div>
          </div>

          {/* Last Prefetch */}
          {status.last_prefetch && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Last Prefetch:</span>{' '}
                {new Date(status.last_prefetch).toLocaleString()}
              </p>
            </div>
          )}

          {/* Base URL */}
          {status.base_url && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Base URL:</span>{' '}
                <code className="bg-gray-200 px-1 rounded">{status.base_url}</code>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={forcePrefetch}
              disabled={loading || !status.running}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? 'Processing...' : 'Force Prefetch Now'}
            </button>

            <button
              onClick={() => window.open('/hometeacher/student_concern_analytics', '_blank')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Test Analytics Load
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">How it works:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Automatically prefetches concern analytics data every {status.interval_minutes} minutes</li>
              <li>• Caches results for faster loading when users access analytics</li>
              <li>• Runs in background to keep data fresh and ready</li>
              <li>• Force prefetch to manually refresh cache immediately</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrefetchMonitor;
