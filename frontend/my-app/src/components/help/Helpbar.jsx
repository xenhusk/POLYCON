import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import logo from "../../components/icons/logo2.png";
import Help_Main_Content from "./Help_Main_Content";

const Help = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [SignInClicked, setSignInClicked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTeacher, setIsTeacher] = React.useState(false);
  const [isStudent, setIsStudent] = React.useState(false);

  useEffect(() => {
    if (isMenuOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      // Only add paddingRight compensation on tablet
      if (window.innerWidth >= 768) {
        const scrollBarCompensation =
          window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarCompensation > 0) {
          document.body.style.paddingRight = `${scrollBarCompensation}px`;
        }
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isMenuOpen]);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role === "faculty");
    setIsStudent(role === "student");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="border-b bg-[#057DCD] shadow-xl relative z-50 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left: Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="focus:outline-none"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 sm:space-x-3"
                >
                  <img
                    src={logo}
                    alt="POLYCON Logo"
                    className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
                  />
                  <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">
                    POLYCON
                  </span>
                </motion.div>
              </button>
            </div>

            {/* Right: Sign In & Menu */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSignInClicked(true);
                  setTimeout(() => setSignInClicked(false), 300);
                  navigate("/login");
                }}
                className={`hidden lg:block bg-white text-base lg:text-xl text-[#0056a6] w-[6rem] lg:w-[8rem] px-4 py-2
                    rounded-[50px] font-semibold transition-all duration-200
                  hover:bg-[#e6f3ff] hover:text-[#0078e7] hover:shadow-md ${
                    SignInClicked ? "scale-90" : "scale-100"
                  }`}
              >
                Sign In
              </motion.button>

              {/* Burger Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="block lg:hidden text-white text-2xl p-2 rounded-md hover:bg-white/20 transition-colors focus:outline-none"
              >
                {isMenuOpen ? <FaTimes /> : "☰"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-gray-400 bg-opacity-50 z-50"
            onClick={() => setIsMenuOpen(false)}
            style={{ touchAction: "none" }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isMenuOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="flex lg:hidden fixed right-0 top-0 h-full w-full md:w-80 max-w-full bg-white z-50 shadow-lg border-gray-200 flex-col"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between py-5 px-6 border-b bg-gradient-to-r from-[#057DCD] to-[#00a3ff]">
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="POLYCON Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(false)}
            className="p-3 hover:bg-white/20 rounded-md transition-colors mr-2"
          >
            <FaTimes className="text-[22px] text-white" />
          </motion.button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col">
            {/* Getting Started Section */}
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
              Getting Started
            </h3>
            <div className="space-y-2 mb-6">
              <Link
                to="/help/getstarted/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Overview
              </Link>
              {!isTeacher || isStudent && (
                <>
                  <Link
                    to="/help/getstarted/Info_Login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    Account Login
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    Account Registration
                  </Link>
                </>
              )}
              <Link
                to="/help/getstarted/Info_Dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/help/getstarted/Info_Appointments"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Appointments
              </Link>
              {isTeacher && (
                <Link
                  to="/help/getstarted/Info_Set_Schedule"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
                >
                  Schedule
                </Link>
              )}
              <Link
                to="/help/getstarted/Info_History"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                History
              </Link>
              <Link
                to="/help/getstarted/Info_Grade"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Grade
              </Link>
            </div>

            {/* Features Section */}
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
              Features
            </h3>
            <div className="space-y-2 mb-6">
              {isTeacher && (
                <>
                  <Link
                    to="/help/features/Info_Polycon_Analysis"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    Polycon Analysis
                  </Link>
                  <Link
                    to="/help/features/Info_Concern_Analysis"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    Concern Analysis
                  </Link>
                </>
              )}
              <Link
                to="/help/features/Info_Consultation_Booking"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Consultation Booking
              </Link>
              <Link
                to="/help/features/Info_Calendar_Management"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Calendar Management
              </Link>
              {isTeacher && (
                <Link
                  to="/help/features/Info_Calendar_Management"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
                >
                  Enrolled Students
                </Link>
              )}
              <Link
                to="/help/features/Info_Notifications"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Notifications
              </Link>
            </div>

            {/* Support Section */}
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
              Support
            </h3>
            <div className="space-y-2 mb-6">
              <Link
                to="/help/support/FAQ"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/help/support/Contact"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#0056a6] hover:bg-blue-50 p-2 rounded-md transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </nav>
        </div>

        {/* Menu Footer */}
        <div className="p-3 border-t fixed bottom-0 right-0 left-0 border-gray-200 bg-white">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            className="bg-[#0056a6] text-white text-base w-full px-4 py-3 rounded-md font-semibold
           transition-all duration-200 hover:bg-[#0078e7] hover:shadow-md"
          >
            Sign In
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <Help_Main_Content />
    </div>
  );
};

export default Help;
