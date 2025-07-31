import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Chevron icon SVG
const ChevronIcon = ({ direction = "down" }) => {
  // direction: "down" or "up"
  const rotate = direction === "up" ? 180 : 0;
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Close icon SVG
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ActionButtonsToggle = ({ children, isVisible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [optionsClicked, setOptionsClicked] = useState(false);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse on larger screens (but still show the toggle)
  useEffect(() => {
    if (windowWidth >= 768) { // md breakpoint
      setIsExpanded(false); // Default to collapsed on desktop too
    } else {
      setIsExpanded(false); // Default to collapsed on mobile
    }
  }, [windowWidth]);

  // Don't render if not visible
  if (!isVisible) return null;

  // Normalize children to array and filter out non-elements
  const childrenArray = React.Children.toArray(children).filter(React.isValidElement);

  // Hide if no children
  if (childrenArray.length === 0) return null;

  // If only one child, render it in the same position and style as the toggle button
  if (childrenArray.length === 1) {
    return (
      <div className="fixed bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 z-50 flex items-center justify-center">
        {childrenArray[0]}
      </div>
    );
  }

  const isMobile = windowWidth < 768; // md breakpoint

  // Show gear icon on both mobile and desktop now
  const toggleExpanded = () => {
    setOptionsClicked(true);
    setTimeout(() => setOptionsClicked(false), 200);
    setIsExpanded(!isExpanded);
    
    // Add haptic feedback on mobile devices only
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  // Animation variants for the action buttons
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.3, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <>
      {/* Main toggle button - visible on both mobile and desktop */}
      <button
        onClick={toggleExpanded}
        className={`fixed bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-600 hover:bg-gray-700 
                   flex items-center justify-center shadow-lg transform hover:scale-110 
                   transition-all duration-300 ease-in-out z-50
                   ${optionsClicked ? "scale-90" : "scale-100"}`}
        title={isExpanded ? "Hide Options" : "Show Options"}
      >
        <motion.div
          initial={{ rotate: 0, opacity: 1 }}
          animate={{ rotate: isExpanded ? 180 : 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex' }}
        >
          <ChevronIcon />
        </motion.div>
      </button>

      {/* Action buttons container - responsive positioning */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed bottom-20 md:bottom-24 right-4 flex flex-col-reverse gap-4 z-50"
          >
            {childrenArray.map((child, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActionButtonsToggle;
