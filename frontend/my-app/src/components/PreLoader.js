import React from 'react';
import { ReactComponent as WhiteShape } from './icons/preloader/WhiteShape.svg';
import { ReactComponent as BlueTriangle } from './icons/preloader/BlueTriangle.svg';
import { ReactComponent as CenterBlueShape } from './icons/preloader/CenterBlueShape.svg';
import { ReactComponent as SmallBlueSquare } from './icons/preloader/SmallBlueSquare.svg';
import { ReactComponent as BottomBlueSquare } from './icons/preloader/BottomBlueSquare.svg';
import './Preloader.css';

const PreLoader = ({ progress }) => {
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
        <div className="loading-bar-container">
          <div 
            className="loading-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreLoader;
