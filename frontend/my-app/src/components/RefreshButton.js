import React from 'react';
import { useQueryClient } from 'react-query';

function RefreshButton({ queryKey, className, children }) {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries(queryKey);
  };

  return (
    <button 
      onClick={handleRefresh}
      className={`bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors ${className || ''}`}
    >
      {children || 'Refresh'}
    </button>
  );
}

export default RefreshButton;
