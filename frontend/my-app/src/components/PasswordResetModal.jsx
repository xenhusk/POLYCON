import React, { useState } from 'react';
import API_URL from '../apiConfig';
import { motion } from 'framer-motion';

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
  }
};

const PasswordResetModal = ({ isVisible, onClose, userEmail }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Fallback to localStorage if userEmail prop is undefined
  const effectiveEmail = userEmail || localStorage.getItem('userEmail') || '';

  // Set initial email value when modal opens
  React.useEffect(() => {
    if (isVisible && effectiveEmail) {
      setEmail(effectiveEmail);
    }
  }, [isVisible, effectiveEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setTimeout(() => {
          onClose();
        }, 3000); // Close modal after 3 seconds
      } else {
        setMessage(data.error || 'An error occurred');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    // No backdrop here - it's provided by the parent component
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 flex items-center justify-center z-[1000]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 w-full max-w-md overflow-hidden"> 
        {/* Header with Modern Design */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94] rounded-t-3xl opacity-10"></div>
          <div className="relative px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
                <p className="text-xs text-gray-600">Secure password recovery</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/20 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Password Reset Instructions</p>
                <p className="text-xs text-gray-600 mt-1">Enter your email address and we'll send you a secure link to reset your password.</p>
              </div>
            </div>
          </div>
          
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border shadow-sm ${
                messageType === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {messageType === 'success' ? (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{message}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-5 h-5 bg-[#057DCD] rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#057DCD] rounded-xl px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#057DCD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <motion.button
                type="submit"
                disabled={isLoading || !email}
                className={`${
                  isLoading || !email ? 'opacity-50 cursor-not-allowed' : ''
                } w-full bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl`}
                whileHover={!isLoading && email ? { scale: 1.02 } : {}}
                whileTap={!isLoading && email ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send Reset Link</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default PasswordResetModal;
