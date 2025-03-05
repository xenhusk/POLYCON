// Add logging to monitor React renders
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DataPrefetchProvider } from './context/DataPrefetchContext';
import { ensureUserIdPersistence, recoverUserIds } from './utils/persistUtils';
import { NotificationProvider } from './context/NotificationContext';

// Create the query client ONCE, outside of render function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Immediately run ID persistence checks when the app loads
ensureUserIdPersistence();

// Try to recover missing IDs if needed
(async () => {
  const needsRecovery = 
    localStorage.getItem('isAuthenticated') === 'true' && 
    (!localStorage.getItem('userId') || 
     !localStorage.getItem('studentID') || 
     !localStorage.getItem('teacherID'));
  
  if (needsRecovery) {
    console.log("Missing user IDs detected, attempting recovery...");
    await recoverUserIds();
    ensureUserIdPersistence();
  }
})();

// Add to debug duplicate renders
console.log('Initializing React app...');

const root = createRoot(document.getElementById('root'));

// Log when rendering happens
console.log('Rendering React app...');

root.render(
  // Remove StrictMode during development to prevent double rendering/effects
  // <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <DataPrefetchProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </DataPrefetchProvider>
      </QueryClientProvider>
    </BrowserRouter>
  // </StrictMode>
);
