import React from 'react';
import PreLoader from './PreLoader';

const PagePreloader = ({ progress }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0065A8' }}>
      <div className="flex justify-center items-center min-h-screen">
        <PreLoader progress={progress} />
      </div>
    </div>
  );
};

export default PagePreloader;
