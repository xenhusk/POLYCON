import React from 'react';
import './Preloader.css';

const Preloader = () => {
  return (
    <div className="facebook-loader">
      <div className="facebook-post">
        <div className="facebook-avatar skeleton"></div>
        <div className="facebook-content">
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line short"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
