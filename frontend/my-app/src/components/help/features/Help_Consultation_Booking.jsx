import React from "react";
import { motion } from "framer-motion";

const Help_Consultation_Booking = () => {

  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    // Simulate a check to see if the user is a teacher
    const role = localStorage.getItem("userRole"); // This would come from your auth logic
    setIsTeacher(role === "faculty");
  }, []);

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
        
        {/* Teacher-specific section */}
        { isTeacher && (
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#e6f3ff] to-[#fafdff] border-b border-[#54BEFF]">
            <div className="mb-2">
              <span className="text-sm text-[#00A3FF] font-medium">Teachers</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#057DCD] mb-3">
              Manage Consultation Bookings
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4">
              You can set your available consultation slots, review and approve student requests, and keep your schedule organized.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Set Available Slots</h4>
                <p className="text-gray-600 text-sm">
                  Define your consultation hours so students can book sessions that fit your availability.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Approve or Decline Requests</h4>
                <p className="text-gray-600 text-sm">
                  Review student booking requests and approve or decline them directly from your dashboard.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Send Reminders</h4>
                <p className="text-gray-600 text-sm">
                  Notify students about upcoming consultations or changes to the schedule.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Manage Group Sessions</h4>
                <p className="text-gray-600 text-sm">
                  Organize group consultations and communicate with all participants efficiently.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-white rounded-lg p-4 border-l-4 border-[#00A3FF]">
              <h4 className="font-semibold text-[#00A3FF] mb-2">Tips for Teachers</h4>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                <li>Update your available slots regularly to reflect your true schedule.</li>
                <li>Use reminders to reduce no-shows and keep students informed.</li>
                <li>Communicate expectations and required materials to students ahead of time.</li>
                <li>Check your dashboard notifications for new booking requests.</li>
              </ul>
            </div>
          </div>
        )}

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
      </div>
    </motion.div>
  );
};

export default Help_Consultation_Booking;