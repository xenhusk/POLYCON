import React from "react";
import { motion } from "framer-motion";

const Help_Teacher_Leaderboard = () => {
  // Content: Categorized
  const getStarted = [
    {
      title: "What Is the Teacher Leaderboard?",
      description:
        "The Teacher Leaderboard displays teacher rankings according to consultation activity and performance during a selected academic period in POLYCON."
    },
    {
      title: "How to Use?",
      description:
        "Select a semester, filter by department, or search for teachers by name to view their ranking and stats for consultations."
    }
  ];

  const features = [
    {
      title: "Public Ranking",
      description:
        "See how teachers stand based on the frequency and quality of student consultations within the platform."
    },
    {
      title: "Filtering Options",
      description:
        "Filter leaderboard by semester or department, or search for specific teachers to customize your view."
    },
    {
      title: "Privacy and Access Control",
      description:
        "General ranking data is publicly visible. Detailed consultation records are private and not included in the leaderboard."
    }
  ];

  const tips = [
    "Try different filters if you can't find a teacher—records update regularly.",
    "Use the leaderboard to discover highly engaged or top-performing teachers.",
    "For more details, contact platform support through the Help section."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
        {/* Header / Overview */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 mb-2">
          <span className="text-sm text-[#057DCD] font-medium">Help Guide</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Teacher Consultation Leaderboard Overview
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              The Teacher Leaderboard ranks faculty members by their consultation engagement. Use the filters to explore rankings and statistics. Learn how consultation performance impacts instructor visibility.
            </p>
          </div>
        </div>
        {/* Get Started Section */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getStarted.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Features Section */}
        <div className="p-4 sm:p-6 lg:p-8" id="leaderboard-features">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Features</h2>
          <div className="space-y-6">
            {features.map((feature, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{feature.title}</h3>
                <div className="pl-2">
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tips Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="leaderboard-tips">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips & Best Practices</h2>
          <div className="space-y-4">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Help_Teacher_Leaderboard;
