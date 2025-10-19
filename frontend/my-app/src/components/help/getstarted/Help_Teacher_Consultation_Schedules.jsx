import React from "react";
import { motion } from "framer-motion";

const Help_Teacher_Consultation_Schedules = () => {
  // Get Started: General overview and first steps
  const getStarted = [
    {
      title: "What Is the Consultation Schedule?",
      description:
        "The Consultation Schedule lets you browse and find available consultation times for all teachers on the POLYCON platform."
    },
    {
      title: "How to Use?",
      description:
        "Select a department or search by teacher name to view their available consultation slots for the current semester."
    }
  ];

  // Features: Key tools and options
  const features = [
    {
      title: "Filter by Department",
      description:
        "Quickly narrow down available consultation hours by choosing a specific department."
    },
    {
      title: "Search by Teacher",
      description:
        "Find the consultation schedule for a specific teacher by entering their name."
    },
    {
      title: "Semester Selector",
      description:
        "View consultation schedules for different academic semesters (e.g., 1st or 2nd semester)."
    }
  ];

  // Tips for effective scheduling
  const tips = [
    "Consultation schedules may update throughout the semester.",
    "No schedules available? Try a different department, semester, or check back later.",
    "Bookings should be made in advance to secure your preferred slot."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1"
    >
      <div className="pb-12 bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
        {/* Header / Overview */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 mb-2">
          <span className="text-sm text-[#057DCD] font-medium">Help Guide</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Teacher Consultation Schedules Overview
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              The Consultation Schedules page lets you explore available times for faculty consultation. Discover when teachers are available, filter by department, and search for your preferred instructor.
            </p>
          </div>
        </div>
        {/* Get Started */}
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
        {/* Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="consultation-schedule-features">
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
        {/* Tips */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="consultation-schedule-tips">
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

export default Help_Teacher_Consultation_Schedules;
