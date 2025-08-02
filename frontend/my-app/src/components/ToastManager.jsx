import React, { useState, useCallback, useEffect } from 'react';
import Toast from './Toast';
import { motion, AnimatePresence } from 'framer-motion';

// Hook for managing toasts
export const useToastManager = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 5000, useSystemNotification = false) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type,
      title,
      message,
      duration,
      useSystemNotification
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title, message, duration = 5000, useSystemNotification = false) => {
    return addToast('success', title, message, duration, useSystemNotification);
  }, [addToast]);

  const showError = useCallback((title, message, duration = 8000, useSystemNotification = false) => {
    return addToast('error', title, message, duration, useSystemNotification);
  }, [addToast]);

  const showWarning = useCallback((title, message, duration = 6000, useSystemNotification = false) => {
    return addToast('warning', title, message, duration, useSystemNotification);
  }, [addToast]);

  const showInfo = useCallback((title, message, duration = 5000, useSystemNotification = false) => {
    return addToast('info', title, message, duration, useSystemNotification);
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll
  };
};

// ToastManager component that renders all toasts
const ToastManager = ({ toasts, onRemoveToast }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Different animations based on screen size
  const getContainerAnimations = (index) => {
    if (isMobile) {
      return {
        initial: { y: -100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 }
      };
    } else {
      return {
        initial: { x: 400, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 400, opacity: 0 }
      };
    }
  };

  return (
    <div className={`fixed z-[9999] pointer-events-none ${
      isMobile 
        ? 'top-4 left-2 right-2' 
        : 'top-4 right-4 w-auto min-w-[320px] max-w-[500px]'
    }`}>
      <AnimatePresence>
        {toasts.map((toast, index) => {
          const animations = getContainerAnimations(index);
          return (
            <motion.div
              key={toast.id}
              initial={animations.initial}
              animate={animations.animate}
              exit={animations.exit}
              transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 20,
                duration: 0.4,
                delay: index * 0.1
              }}
              className={`pointer-events-auto ${index > 0 ? 'mt-3' : ''} ${
                isMobile ? 'w-full' : 'w-full min-w-[320px] max-w-[500px]'
              }`}
            >
              <Toast
                message={toast.title && toast.message ? `${toast.title}: ${toast.message}` : toast.title || toast.message}
                type={toast.type}
                isVisible={true}
                onClose={() => onRemoveToast(toast.id)}
                useSystemNotification={toast.useSystemNotification}
                title="POLYCON"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastManager;
