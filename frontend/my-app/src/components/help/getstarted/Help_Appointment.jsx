import React from "react";
import { motion } from "framer-motion";

const HelpAppointment = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_Appointments" 
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">Appointments</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Managing Your Appointments
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            View, manage, and keep track of all your upcoming and past consultation appointments.
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-2/3">
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">
                Stay organized with your schedule
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Access all your appointments in one place and never miss a consultation with your teachers.
              </p>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-32 h-24 sm:w-48 sm:h-32 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="text-4xl sm:text-6xl">📅</div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="appointment_features">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Upcoming Appointments</h4>
              <p className="text-gray-600">
                Easily view all your scheduled future consultations with teachers and classmates.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Appointment Details</h4>
              <p className="text-gray-600">
                Check details for each appointment, including teacher, time, participants, and location.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Past Appointments</h4>
              <p className="text-gray-600">
                Review your previous consultations and keep a record of your academic support sessions.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Reload & Refresh</h4>
              <p className="text-gray-600">
                Reload the page if appointments do not appear or if you need to refresh your data.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#057DCD]" id="tips_section_appointments">
            <h4 className="font-semibold text-[#057DCD] mb-2">Tips for Managing Appointments</h4>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Check your appointments regularly to avoid missing any sessions.</li>
              <li>Contact your teacher if you need to reschedule or cancel an appointment.</li>
              <li>Use the refresh button or reload the page to get the latest updates.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpAppointment;