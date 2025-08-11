import React from "react";
import { motion } from "framer-motion";

const HelpHistory = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_History" 
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">History</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Consultation History
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Review all your past consultation sessions and track your academic support journey.
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-2/3">
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">
                All your sessions in one place
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Easily access your consultation records, filter by teacher or date, and monitor your academic progress over time.
              </p>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-32 h-24 sm:w-48 sm:h-32 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="text-4xl sm:text-6xl">🗂️</div>
              </div>
            </div>
          </div>
        </div>

        {/* History Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="history_features">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Session Records</h4>
              <p className="text-gray-600">
                View a complete list of all your past consultation sessions, including details like date, teacher, and concern.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Search & Filter</h4>
              <p className="text-gray-600">
                Quickly find sessions by teacher name, summary, concern, or date using powerful search and filter tools.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Clear Filters</h4>
              <p className="text-gray-600">
                Reset your view at any time to see your full consultation history.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h4>
              <p className="text-gray-600">
                Monitor your academic support journey and identify patterns or frequent concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#057DCD]" id="tips_section_history">
            <h4 className="font-semibold text-[#057DCD] mb-2">Tips for Using History</h4>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Use filters to quickly find specific sessions or concerns.</li>
              <li>Review your history regularly to track your academic progress.</li>
              <li>Download or screenshot your records for personal documentation if needed.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpHistory;