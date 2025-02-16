import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
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
    transition: {
      duration: 0.2
    }
  }
};

const PasswordResetModal = ({ isVisible, onClose, userEmail, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fallback to localStorage if userEmail prop is undefined
  const effectiveEmail = userEmail || localStorage.getItem('userEmail');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(password);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Change Password
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  required
                />
              </div>
              
              <div className="text-sm text-gray-600">
                A password reset link will be sent to: <span className="font-medium">{effectiveEmail}</span>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className={`${
                    isLoading || !password ? 'opacity-50 cursor-not-allowed' : ''
                  } bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PasswordResetModal;
