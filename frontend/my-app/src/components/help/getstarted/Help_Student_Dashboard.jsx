import React from "react";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_Student_Dashboard"
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">Student Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Your Personalized Student Dashboard
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            The dashboard is your main hub for managing your academic journey, tracking consultations, and staying updated.
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-2/3">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Everything you need in one place
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Access your profile, view your consultation calendar, and receive important notifications—all from your dashboard.
              </p>
            </div>
            <div className="w-full sm:w-1/3 h-32 sm:h-40 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="text-4xl sm:text-6xl">📊</div>
            </div>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="dashboard_features">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Key Features</h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 auto-rows-auto sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:grid-cols-2">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Profile Overview</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Instantly view your name, program, year/section, and other personal details.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Consultation Calendar</h4>
              <p className="text-sm sm:text-base text-gray-600">
                See all your scheduled and upcoming consultations in a calendar view.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Quick Actions</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Book a new consultation, view your appointments, or update your profile with just a click.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Notifications</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Stay updated with reminders and important announcements from faculty.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#057DCD]" id="tips_section_dashboard">
            <h4 className="font-semibold text-[#057DCD] mb-2">Tips for Students</h4>
            <ul className="list-disc ml-6 text-sm sm:text-base text-gray-700">
              <li>Check your dashboard regularly to stay on top of your academic schedule.</li>
              <li>Use the “View My Appointments” button on mobile for a streamlined experience.</li>
              <li>Update your profile to ensure your information is always current.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;