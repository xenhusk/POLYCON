import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const HelpHistory = () => {
  const { searchQuery } = useContext(HelpContext);

  const historyFeatures = [
    {
      title: "Session Records",
      description:
        "View a complete list of all your past consultation sessions, including details like date, teacher, and concern.",
    },
    {
      title: "Search & Filter",
      description:
        "Quickly find sessions by teacher name, summary, concern, or date using powerful search and filter tools.",
    },
    {
      title: "Clear Filters",
      description:
        "Reset your view at any time to see your full consultation history.",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your academic support journey and identify patterns or frequent concerns.",
    },
  ];

  const tipsForUsingHistory = [
    "Use filters to quickly find specific sessions or concerns.",
    "Review your history regularly to track your academic progress.",
    "Download or screenshot your records for personal documentation if needed.",
  ];

  const filteredFeatures = historyFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTips = tipsForUsingHistory.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_History"
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">History</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Consultation History
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Review all your past consultation sessions and track your academic
            support journey.
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full">
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">
                All your sessions in one place
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Easily access your consultation records, filter by teacher or
                date, and monitor your academic progress over time.
              </p>
            </div>
          </div>
        </div>

        {/* History Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="history_features">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Key Features
          </h3>
          {filteredFeatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200"
                >
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No features found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div
            className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#057DCD]"
            id="tips_section_history"
          >
            <h4 className="font-semibold text-[#057DCD] mb-2">
              Tips for Using History
            </h4>
            {filteredTips.length > 0 ? (
              <ul className="list-disc ml-6 text-gray-700">
                {filteredTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 text-lg py-8">
                <p>No tips found for "{searchQuery}".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpHistory;