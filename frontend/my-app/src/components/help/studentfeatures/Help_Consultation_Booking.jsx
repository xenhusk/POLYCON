import React from "react";
import { motion } from "framer-motion";

const Help_Consultation_Booking = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Consultation_Booking" 
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header section */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">Help Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Consultation Booking
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              Learn how to book and manage consultation sessions with faculty members through Polycon's booking system.
            </p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div className="text-[#057DCD] text-xl mr-3">📅</div>
              <div>
                <h3 className="font-medium text-gray-900">New Booking</h3>
                <p className="text-sm text-gray-600">Dashboard → Book Consultation</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div className="text-[#057DCD] text-xl mr-3">✏️</div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Bookings</h3>
                <p className="text-sm text-gray-600">Dashboard → My Consultations</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div className="text-[#057DCD] text-xl mr-3">🔍</div>
              <div>
                <h3 className="font-medium text-gray-900">View Faculty</h3>
                <p className="text-sm text-gray-600">Book Consultation → Faculty List</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="p-4 sm:p-6 lg:p-8" id="booking_steps">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Process</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                Select Faculty & Time
              </h3>
              <div className="pl-8">
                <ul className="list-disc text-gray-600 space-y-2 text-sm">
                  <li>Click "Book Consultation" on your dashboard</li>
                  <li>Choose a faculty member from the available list</li>
                  <li>Select an available time slot from their calendar</li>
                  <li>Check the consultation duration (usually 30-60 minutes)</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                Add Consultation Details
              </h3>
              <div className="pl-8">
                <ul className="list-disc text-gray-600 space-y-2 text-sm">
                  <li>Specify your consultation topic</li>
                  <li>Add any specific questions or concerns</li>
                  <li>Upload relevant documents (if needed)</li>
                  <li>Choose your preferred meeting method (online/in-person)</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                Confirm and Schedule
              </h3>
              <div className="pl-8">
                <ul className="list-disc text-gray-600 space-y-2 text-sm">
                  <li>Review all booking details</li>
                  <li>Check faculty's consultation policies</li>
                  <li>Confirm your booking</li>
                  <li>Receive confirmation email and calendar invite</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Guidelines */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_guidelines_booking">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Important Notes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-[#057DCD] mb-2">💡 Booking Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Book at least 24 hours in advance</li>
                <li>• Check faculty availability calendar</li>
                <li>• Be specific about your consultation needs</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Policies</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Cancellations: At least 12 hours notice</li>
                <li>• Late arrival: Max 10 minutes grace period</li>
                <li>• No-shows may affect future bookings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <a href="/help/studentfeatures" className="text-[#057DCD] hover:text-[#54BEFF] text-sm">
              ← Back to Student Features
            </a>
            <div className="flex gap-4">
              <a href="#booking_steps" className="text-[#057DCD] hover:text-[#54BEFF] text-sm">
                Jump to Steps
              </a>
              <a href="/help/contact" className="text-[#057DCD] hover:text-[#54BEFF] text-sm">
                Need Help? →
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Help_Consultation_Booking;