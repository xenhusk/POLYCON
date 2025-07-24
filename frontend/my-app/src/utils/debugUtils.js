/**
 * Debug utility to check API configuration in production
 * Add this to your console in production to debug API issues
 */

export const debugAPIConfig = () => {
  console.group('🔧 API Configuration Debug');
  
  // Environment info
  console.log('Environment:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  
  // Computed API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  console.log('Computed API_URL:', API_URL);
  
  // Test API connectivity
  console.log('Testing API connectivity...');
  
  fetch(`${API_URL}/health`)
    .then(response => {
      console.log('✅ API Health Check:', response.status, response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('✅ API Health Response:', data);
    })
    .catch(error => {
      console.error('❌ API Health Check Failed:', error);
      
      // Try CORS preflight check
      fetch(`${API_URL}/search/students?query=`, { method: 'OPTIONS' })
        .then(response => {
          console.log('CORS Preflight Response:', response.status, response.headers);
        })
        .catch(corsError => {
          console.error('❌ CORS Preflight Failed:', corsError);
        });
    });
  
  // Check localStorage for cached data
  const cacheKeys = [
    'actionButtonData_students',
    'actionButtonData_teachers',
    'actionButtonData_lastFetch',
    'actionButtonData_userId'
  ];
  
  console.log('📦 Cache Status:');
  cacheKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : parsed);
      } catch {
        console.log(`${key}:`, data.length > 50 ? `${data.length} chars` : data);
      }
    } else {
      console.log(`${key}:`, 'Not found');
    }
  });
  
  console.groupEnd();
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  window.debugAPIConfig = debugAPIConfig;
}
