import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  scheduleInfo 
}) => {
  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Container */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Delete Schedule</h2>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Are you sure you want to delete this schedule?
                </h3>
                {scheduleInfo && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Day:</span> {scheduleInfo.dayName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Time:</span> {scheduleInfo.timeRange}
                    </p>
                    {scheduleInfo.venue && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Venue:</span> {scheduleInfo.venue}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-gray-600 text-sm mt-4">
                  This will permanently remove the consultation schedule and cannot be undone.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex border-t border-gray-200 bg-gray-50/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-4 text-gray-700 bg-gray-100 rounded-bl-3xl hover:bg-gray-200 transition-all duration-200 text-sm font-semibold"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-br-3xl transition-all duration-200 text-sm font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Schedule
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
