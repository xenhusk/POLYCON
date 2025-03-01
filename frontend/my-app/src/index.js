import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DataPrefetchProvider } from './context/DataPrefetchContext';
import { ensureUserIdPersistence, recoverUserIds } from './utils/persistUtils';

// Create a client
const queryClient = new QueryClient();

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <DataPrefetchProvider>
          <App />
        </DataPrefetchProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
