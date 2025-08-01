import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from "../components/icons/DarkLogo.png";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Logo */}
        <div className="mb-6">
          <img src={logo} alt="Polycon Logo" className="h-16 mx-auto" />
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Email Verified Successfully!
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Your email address has been verified successfully. You can now access all features of your Polycon account.
        </p>

        {/* Login Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLoginRedirect}
          className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#046bb8] transition-colors duration-200"
        >
          Continue to Login
        </motion.button>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mt-6">
          You can now log in with your verified email address to start using Polycon's consultation services.
        </p>
      </motion.div>
    </div>
  );
};

export default EmailVerificationSuccess;
