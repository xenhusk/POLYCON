import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Toast component matching SemesterManagement styling
const Toast = ({ id, type, title, message, onClose }) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-500';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-500';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-500';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        fixed top-5 right-5 z-[9999] rounded-lg shadow-lg max-w-md p-4 border
        transform transition-all duration-500 ease-in-out
        ${getToastStyles()}
      `}
      style={{ 
        marginTop: `${id * 80}px` // Stack toasts vertically
      }}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {title}
          </div>
          {message && (
            <div className="text-sm mt-1 break-words">
              {message}
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 ml-2 text-current hover:opacity-75 transition-opacity"
          aria-label="Close notification"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Toast Manager Hook
export const useToastManager = () => {
  const [toasts, setToasts] = useState([]);
  const [nextId, setNextId] = useState(0);

  const addToast = useCallback((type, title, message, duration = 5000) => {
    const id = nextId;
    setNextId(prev => prev + 1);
    
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [nextId]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((title, message, duration) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const showError = useCallback((title, message, duration) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const showWarning = useCallback((title, message, duration) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const showInfo = useCallback((title, message, duration) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Toast Container Component
const ToastManager = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              id={index}
              onClose={onRemoveToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastManager;
