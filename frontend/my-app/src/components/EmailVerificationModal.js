import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from '../apiConfig';
import logo from "./icons/DarkLogo.png";

const EmailVerificationModal = ({ 
  isOpen, 
  onClose, 
  email = '',
  onSuccess = null 
}) => {
  const [verificationStatus, setVerificationStatus] = useState('manual'); // 'loading', 'success', 'error', 'resent', 'manual'
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState(email);
  const [countdown, setCountdown] = useState(0);

  // Initialize email from prop
  useEffect(() => {
    if (email) {
      setUserEmail(email);
    }
  }, [email]);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Start countdown when modal opens
  useEffect(() => {
    if (isOpen && email) {
      setCountdown(60); // Start with 60 second countdown
      setVerificationStatus('manual');
      setMessage('Please check your email inbox and click the verification link we sent you.');
    }
  }, [isOpen, email]);

  const handleResendVerification = async () => {
    if (!userEmail.trim()) return;
    
    setIsResending(true);
    try {
      const response = await fetch(`${API_URL}/account/resend_verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        setVerificationStatus('resent');
        setMessage('Verification email has been resent! Please check your inbox.');
        setCountdown(60); // 60 second cooldown
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to resend verification email.');
        setVerificationStatus('error');
      }
    } catch (error) {
      setMessage('Network error occurred. Please try again later.');
      setVerificationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        );
      case 'resent':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'resent':
        return 'Email Resent!';
      default:
        return 'Verify Your Email';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'resent':
        return 'text-[#057DCD]';
      default:
        return 'text-[#057DCD]';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <img
            src={logo}
            alt="POLYCON Logo"
            className="h-12 w-12 object-contain"
          />
        </motion.div>

        {/* Status Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          {getStatusIcon()}
        </motion.div>

        {/* Status Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-xl font-bold mb-4 ${getStatusColor()}`}
        >
          {getStatusTitle()}
        </motion.h1>

        {/* Status Message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={verificationStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6 leading-relaxed text-sm"
          >
            {message}
          </motion.p>
        </AnimatePresence>

        {/* Email Display */}
        {userEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6"
          >
            <p className="text-blue-800 font-medium text-sm">
              Email sent to: <span className="font-semibold">{userEmail}</span>
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {verificationStatus === 'success' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#046bb8] transition-colors duration-200 shadow-lg"
            >
              Continue to Login
            </motion.button>
          )}

          {(verificationStatus === 'error' || verificationStatus === 'manual') && (
            <>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-[#057DCD] focus:outline-none transition-colors text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResendVerification}
                  disabled={isResending || countdown > 0 || !userEmail.trim()}
                  className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#046bb8] transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Sending...
                    </div>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </motion.button>
              </div>
            </>
          )}

          {verificationStatus === 'resent' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVerificationStatus('manual')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              Need to Resend Again?
            </motion.button>
          )}

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full border-2 border-[#057DCD] text-[#057DCD] py-3 px-6 rounded-full font-semibold hover:bg-[#057DCD] hover:text-white transition-colors duration-200"
          >
            Close
          </motion.button>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-gray-500 mt-4"
        >
          Having trouble? Check your spam folder or{' '}
          <span 
            onClick={() => setVerificationStatus('manual')}
            className="text-[#057DCD] hover:underline cursor-pointer font-medium"
          >
            try resending the email
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal;
