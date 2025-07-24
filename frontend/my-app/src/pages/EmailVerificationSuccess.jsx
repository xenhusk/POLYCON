import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../components/icons/DarkLogo.png";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();

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

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold mb-4 text-green-600"
        >
          Email Verified Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-8 leading-relaxed"
        >
          Welcome to POLYCON! Your email has been verified and your account is now active. You can start using all features of the platform.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#046bb8] transition-colors duration-200 shadow-lg"
          >
            Login to Your Account
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full border-2 border-[#057DCD] text-[#057DCD] py-3 px-6 rounded-full font-semibold hover:bg-[#057DCD] hover:text-white transition-colors duration-200"
          >
            Back to Home
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-blue-50 rounded-xl"
        >
          <h3 className="text-sm font-semibold text-[#057DCD] mb-2">What's Next?</h3>
          <ul className="text-xs text-gray-600 space-y-1 text-left">
            <li>• Log in with your email and password</li>
            <li>• Complete your profile setup</li>
            <li>• Start booking consultations</li>
            <li>• Access all POLYCON features</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationSuccess;
