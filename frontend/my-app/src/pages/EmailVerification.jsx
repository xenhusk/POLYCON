import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from '../apiConfig';
import logo from "../components/icons/DarkLogo.png";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // 'loading', 'success', 'error', 'resent'
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const status = searchParams.get('status');
  const urlMessage = searchParams.get('message');

  useEffect(() => {
    if (status) {
      // Handle URL parameters for status
      if (status === 'success') {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! You can now log in to your account.');
      } else if (status === 'error') {
        setVerificationStatus('error');
        setMessage(urlMessage || 'Verification failed. The link may be expired or invalid.');
      }
    } else if (token) {
      verifyEmailToken(token);
    } else {
      // No token provided - show manual verification page
      setVerificationStatus('manual');
    }
  }, [token, status, urlMessage]);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmailToken = async (verificationToken) => {
    try {
      const response = await fetch(`${API_URL}/account/verify?token=${verificationToken}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! You can now log in to your account.');
      } else {
        const errorData = await response.text();
        setVerificationStatus('error');
        setMessage(errorData || 'Verification failed. The link may be expired or invalid.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Network error occurred. Please try again later.');
    }
  };

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
      }
    } catch (error) {
      setMessage('Network error occurred. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#057DCD] border-t-transparent rounded-full"
          />
        );
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-[#057DCD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-[#057DCD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'resent':
        return 'Verification Email Sent!';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <img
            src={logo}
            alt="POLYCON Logo"
            className="h-16 w-16 object-contain"
          />
        </motion.div>

        {/* Status Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-6"
        >
          {getStatusIcon()}
        </motion.div>

        {/* Status Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-2xl font-bold mb-4 ${getStatusColor()}`}
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
            transition={{ delay: 0.5 }}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            {message || (verificationStatus === 'loading' ? 'Please wait while we verify your email address...' : 
              verificationStatus === 'manual' ? 'Please check your email inbox and click the verification link we sent you.' : message)}
          </motion.p>
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {verificationStatus === 'success' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#046bb8] transition-colors duration-200 shadow-lg"
            >
              Go to Login
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-[#057DCD] focus:outline-none transition-colors"
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

          {/* Back to Home */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full border-2 border-[#057DCD] text-[#057DCD] py-3 px-6 rounded-full font-semibold hover:bg-[#057DCD] hover:text-white transition-colors duration-200"
          >
            Back to Home
          </motion.button>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-gray-500 mt-6"
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

export default EmailVerification;
