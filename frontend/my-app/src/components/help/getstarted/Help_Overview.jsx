import React from "react";
import { motion } from "framer-motion";

const Overview = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Overview" 
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Hero section */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">
              Getting started
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Polycon System Documentation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Build with our comprehensive student consultation platform
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-2/3">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Consultation platform
              </h2>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Your academic success depends on effective communication. Make
                sure you build connections with the best support system.
              </p>
            </div>
            <div className="w-full sm:w-1/3 h-32 sm:h-40 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="text-4xl sm:text-6xl">📚</div>
            </div>
          </div>
        </div>

        {/* Quickstart section */}
        <div className="p-4 sm:p-6 lg:p-8" id="quickstart">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Quickstart
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Cards */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Access your dashboard
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Learn how to navigate your personalized student dashboard with
                our guide.
              </p>
              <a
                href="#dashboard"
                className="text-[#057DCD] text-sm sm:text-base font-medium hover:underline"
              >
                View dashboard guide →
              </a>
            </div>

            {/* Card 2 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Book consultations
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how to book consultation sessions with faculty members.
              </p>
              <a
                href="#bookings"
                className="text-[#057DCD] font-medium hover:underline"
              >
                Start booking →
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Manage appointments
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how to view and manage your upcoming appointments.
              </p>
              <a
                href="#appointments"
                className="text-[#057DCD] font-medium hover:underline"
              >
                Manage appointments →
              </a>
            </div>

            {/* Card 4 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View history
              </h3>
              <p className="text-gray-600 mb-4">
                Get started quickly with our step-by-step documentation.
              </p>
              <a
                href="#history"
                className="text-[#057DCD] font-medium hover:underline"
              >
                View history guide →
              </a>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50" id="overview_features">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature cards */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#057DCD] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-white text-lg sm:text-xl">📊</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Dashboard
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Modules for managing your academic journey with personalized
                insights and calendar integration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-[#057DCD] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Consultation Booking
              </h3>
              <p className="text-gray-600 text-sm">
                Advanced booking system for scheduling consultations with
                faculty and group sessions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-[#057DCD] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Academic History</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive tracking of your consultation history and academic
                progress over time.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
            <a href="#" className="text-[#057DCD] hover:underline">
              Join our Discord community →
            </a>
            <a href="#" className="text-[#057DCD] hover:underline">
              Check status page →
            </a>
            <a href="#" className="text-[#057DCD] hover:underline">
              See changelog →
            </a>
          </div>
          <div className="text-center mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-500">
              Need help?{" "}
              <a href="#contact" className="text-[#057DCD] hover:underline">
                Talk to our Support team.
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
