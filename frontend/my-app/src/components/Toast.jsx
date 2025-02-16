import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/outline';

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="fixed top-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-[9999] min-w-[300px] flex items-center gap-3"
          style={{ pointerEvents: 'auto' }} // Ensure clickable
        >
          <div className="flex-shrink-0">
            {/* Your icon here */}
          </div>
          <div className="flex-1 mr-2">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 hover:text-gray-200"
          >
            {/* Your close button icon here */}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
