import React from 'react';
import { usePreloadedData } from '../context/PreloadContext';

function ReloadButton({ pageType }) {
  const { reloadCurrentPage, isLoading } = usePreloadedData();

  return (
    <button
      onClick={() => reloadCurrentPage(pageType)}
      disabled={isLoading}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
    >
      {isLoading ? (
        <span className="animate-spin">⟳</span>
      ) : (
        <span>⟳</span>
      )}
    </button>
  );
}

export default ReloadButton;
