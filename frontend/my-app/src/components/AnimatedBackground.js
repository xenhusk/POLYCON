import React, { useState, useEffect } from 'react';

const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition1, setSmoothPosition1] = useState({ x: 0, y: 0 });
  const [smoothPosition2, setSmoothPosition2] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth follow effect with different delays
  useEffect(() => {
    const smoothFollow = () => {
      setSmoothPosition1(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.05,
        y: prev.y + (mousePosition.y - prev.y) * 0.05
      }));

      setSmoothPosition2(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.02,
        y: prev.y + (mousePosition.y - prev.y) * 0.02
      }));
    };

    const interval = setInterval(smoothFollow, 1000 / 60); // 60fps
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div className="fixed inset-0 -z-10 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-[100px]" />
      
      {/* Cursor following blobs - adjusted sizes and offsets */}
      <div 
        className="absolute w-[100px] h-[100px] rounded-full bg-[#54BEFF]/25 blur-xl pointer-events-none transition-transform"
        style={{ 
          left: smoothPosition1.x - 50,  // Halved the offset (was -100)
          top: smoothPosition1.y - 50,   // Halved the offset (was -100)
          transform: 'translate(-25%, -25%)' // Reduced transform offset
        }} 
      />
      <div 
        className="absolute w-[150px] h-[150px] rounded-full bg-[#0065A8]/20 blur-xl pointer-events-none transition-transform"
        style={{ 
          left: smoothPosition2.x - 75,  // Halved the offset (was -150)
          top: smoothPosition2.y - 75,   // Halved the offset (was -150)
          transform: 'translate(-25%, -25%)' // Reduced transform offset
        }} 
      />

      {/* Existing blobs */}
      <div 
        className="absolute w-[400px] h-[400px] rounded-full bg-[#54BEFF]/40 animate-float blur-2xl"
        style={{ top: '-10%', right: '5%' }} 
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-[#0065A8]/30 animate-float-slow-reverse blur-2xl"
        style={{ top: '30%', left: '-10%' }} 
      />
      <div 
        className="absolute w-[450px] h-[450px] rounded-full bg-[#057DCD]/35 animate-float-slow blur-2xl"
        style={{ bottom: '20%', right: '20%' }}
      />
      
      {/* Existing smaller blobs */}
      <div 
        className="absolute w-[200px] h-[200px] rounded-full bg-[#54BEFF]/30 animate-float-fast blur-xl"
        style={{ top: '15%', right: '30%' }} 
      />
      <div 
        className="absolute w-[250px] h-[250px] rounded-full bg-[#0065A8]/25 animate-float-reverse blur-xl"
        style={{ top: '60%', left: '25%' }} 
      />
      <div 
        className="absolute w-[180px] h-[180px] rounded-full bg-[#057DCD]/30 animate-float-medium blur-xl"
        style={{ bottom: '10%', left: '10%' }}
      />

      {/* New bottom right blob */}
      <div 
        className="absolute w-[300px] h-[300px] rounded-full bg-[#54BEFF]/35 animate-float-medium blur-xl"
        style={{ bottom: '-5%', right: '-5%' }}
      />
    </div>
  );
};

export default AnimatedBackground;
