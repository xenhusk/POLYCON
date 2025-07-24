import React, { useState, useEffect } from 'react';
import { ReactComponent as WhiteShape } from './icons/preloader/WhiteShape.svg';
import { ReactComponent as BlueTriangle } from './icons/preloader/BlueTriangle.svg';
import { ReactComponent as CenterBlueShape } from './icons/preloader/CenterBlueShape.svg';
import { ReactComponent as SmallBlueSquare } from './icons/preloader/SmallBlueSquare.svg';
import { ReactComponent as BottomBlueSquare } from './icons/preloader/BottomBlueSquare.svg';
import './Preloader.css';

const PreLoader = ({ progress, customText }) => {
  const [loadingText, setLoadingText] = useState('Loading');
  const [dots, setDots] = useState('');

  // Animate loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Update loading text based on progress or use custom text
  useEffect(() => {
    if (customText) {
      setLoadingText(customText.replace(/\.\.\.$/, '')); // Remove trailing dots if present
    } else {
      if (progress < 25) {
        setLoadingText('Initializing');
      } else if (progress < 50) {
        setLoadingText('Loading assets');
      } else if (progress < 75) {
        setLoadingText('Preparing interface');
      } else if (progress < 100) {
        setLoadingText('Almost ready');
      } else {
        setLoadingText('Complete');
      }
    }
  }, [progress, customText]);

  return (
    <div className="preloader-overlay">
      <div className="preloader-container flex flex-col items-center">
        <div className="logo-container mb-8">
          <div className="shapes-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <WhiteShape className="shape white-shape" />
            <BlueTriangle className="shape blue-triangle" />
            <CenterBlueShape className="shape center-blue" />
            <SmallBlueSquare className="shape small-square" />
            <BottomBlueSquare className="shape bottom-square" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="loading-text mb-4">
          {loadingText}{dots}
        </div>
        
        {/* Progress percentage */}
        <div className="progress-percentage mb-2">
          {Math.round(progress)}%
        </div>
        
        {/* Loading bar container */}
        <div className="loading-bar-container">
          <div 
            className="loading-bar" 
            style={{ width: `${progress}%` }}
          />
          <div className="loading-bar-glow" />
        </div>
      </div>
    </div>
  );
};

export default PreLoader;
