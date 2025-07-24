import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../components/icons/DarkLogo.png";

const EmailVerificationError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'unknown';
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const getErrorMessage = () => {
    switch (error) {
      case 'expired':
        return {
          title: "Verification Link Expired",
          message: "The verification link has expired. Please request a new verification email to complete your account setup.",
          showResend: true
        };
      case 'invalid':
        return {
          title: "Invalid Verification Link",
          message: "The verification link is invalid or has already been used. Please check your email for the correct link or request a new one.",
          showResend: true
        };
      case 'already_verified':
        return {
          title: "Already Verified",
          message: "Your email address has already been verified. You can proceed to log in to your account.",
          showResend: false
        };
      case 'user_not_found':
        return {
          title: "Account Not Found",
          message: "The account associated with this verification link could not be found. Please check if you signed up with a different email address.",
          showResend: false
        };
      default:
        return {
          title: "Verification Failed",
          message: "An error occurred during email verification. Please try again or contact support if the issue persists.",
          showResend: true
        };
    }
  };

  const { title, message, showResend } = getErrorMessage();

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      // You'll need to get the email from somewhere - maybe localStorage or ask user to enter it
      const savedEmail = localStorage.getItem('pendingVerificationEmail');
      
      if (!savedEmail) {
        setResendMessage('Please go back to signup and create your account again.');
        setIsResending(false);
        return;
      }

      const response = await fetch('/api/resend_verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: savedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent successfully! Check your inbox.');
        // Clear the saved email
        localStorage.removeItem('pendingVerificationEmail');
      } else {
        setResendMessage(data.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setResendMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
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

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold mb-4 text-red-600"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-8 leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Resend Message */}
        {resendMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 rounded-lg mb-6 text-sm ${
              resendMessage.includes('successfully') || resendMessage.includes('sent')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {resendMessage}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {showResend && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#046bb8] transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </motion.button>
          )}

          {error === 'already_verified' ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg"
            >
              Login to Your Account
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="w-full border-2 border-[#057DCD] text-[#057DCD] py-3 px-6 rounded-full font-semibold hover:bg-[#057DCD] hover:text-white transition-colors duration-200"
            >
              Back to Signup
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full text-gray-600 py-2 px-6 rounded-full font-medium hover:text-[#057DCD] transition-colors duration-200"
          >
            Back to Home
          </motion.button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-gray-50 rounded-xl"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Need Help?</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            If you continue to experience issues, please contact our support team or try creating a new account with a different email address.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationError;
