import React from "react";
import { motion } from "framer-motion";

const HelpBookings = () => {
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role === "faculty");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_Bookings"
      className="flex-1"
    >
      { !isTeacher && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
            <div className="mb-2">
              <span className="text-sm text-[#057DCD] font-medium">
                Booking Consultations
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Booking a Consultation
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
              Schedule new consultations with your teachers and invite fellow
              students for group sessions.
            </p>
          </div>

          {/* Feature highlight */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-2/3">
                <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">
                  Easy and flexible booking
                </h3>
                <p className="text-base sm:text-lg opacity-90 mb-4">
                  Find available teachers, select time slots, and invite
                  classmates for collaborative consultations.
                </p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-32 h-24 sm:w-48 sm:h-32 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-4xl sm:text-6xl">📝</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="booking_features">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Teacher Search
                </h4>
                <p className="text-gray-600">
                  Search for teachers by name or subject to find the right person
                  for your consultation.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Available Time Slots
                </h4>
                <p className="text-gray-600">
                  View and select from available consultation slots that fit your
                  schedule.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Group Consultations
                </h4>
                <p className="text-gray-600">
                  Invite other students to join your consultation for group
                  discussions and collaborative learning.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Confirmation & Reminders
                </h4>
                <p className="text-gray-600">
                  Receive confirmation once your booking is approved and get
                  reminders before your session.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div
              className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#057DCD]"
              id="tips_section_bookings"
            >
              <h4 className="font-semibold text-[#057DCD] mb-2">
                Tips for Booking
              </h4>
              <ul className="list-disc ml-6 text-gray-700">
                <li>Book early to secure your preferred time slot.</li>
                <li>Double-check the time zone of your booking.</li>
                <li>
                  Communicate with your teacher about any specific topics or
                  questions you have.
                </li>
                <li>
                  Keep your software updated for the best virtual consultation
                  experience.
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">
              Ready to Book a Consultation?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
              Take the next step in your learning journey. Book a consultation now
              and get the help you need to succeed.
            </p>
            <a
              href="#"
              className="inline-block bg-[#057DCD] text-white text-base sm:text-lg font-semibold rounded-lg px-6 py-3 shadow-md hover:bg-[#046BB1] transition-all duration-200"
            >
              Book a Consultation
            </a>
          </div>
        </div>
      )}

      {isTeacher && (
        <div className="bg-white rounded-lg shadow-sm border border-[#54BEFF]">
          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF] bg-gradient-to-r from-[#e6f3ff] to-[#fafdff]">
            <div className="mb-2">
              <span className="text-sm text-[#00A3FF] font-medium">
                Teacher Booking Management
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#057DCD] mb-2 sm:mb-4">
              Managing Your Consultation Bookings
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
              You can efficiently manage your consultation slots,
              approve or decline student requests, and keep track of your
              upcoming sessions.
            </p>
          </div>

          {/* Teacher Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="teacher_booking_features">
            <h3 className="text-lg sm:text-2xl font-bold text-[#057DCD] mb-4 sm:mb-6">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Set Available Slots
                </h4>
                <p className="text-gray-600">
                  Define your available times for consultations so students can
                  book sessions that fit your schedule.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Approve or Decline Requests
                </h4>
                <p className="text-gray-600">
                  Review student booking requests and approve or decline them
                  with a single click.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Group Session Management
                </h4>
                <p className="text-gray-600">
                  Manage group consultations, see all invited students, and
                  communicate important details.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Automated Reminders
                </h4>
                <p className="text-gray-600">
                  Receive reminders for upcoming consultations and notify
                  students of any changes.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div
            className="p-4 sm:p-6 lg:p-8 bg-gray-50"
            id="teacher_tips_section"
          >
            <div
              className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#00A3FF]"
              id="tips_section_teacher_bookings"
            >
              <h4 className="font-semibold text-[#00A3FF] mb-2">
                Tips for Teachers
              </h4>
              <ul className="list-disc ml-6 text-gray-700">
                <li>
                  Regularly update your available slots to reflect your true
                  schedule.
                </li>
                <li>
                  Communicate expectations and required materials to students
                  ahead of time.
                </li>
                <li>
                  Use group sessions for topics that benefit from peer
                  discussion.
                </li>
                <li>
                  Check your notifications for new booking requests and
                  reminders.
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-[#54BEFF]">
            <h3 className="text-lg sm:text-2xl font-bold text-[#057DCD] mb-4">
              Ready to Manage Your Bookings?
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
              Keep your consultation schedule organized and help your students
              succeed. Visit your dashboard to manage bookings now.
            </p>
            <a
              href="#"
              className="inline-block bg-[#00A3FF] text-white text-base sm:text-lg font-semibold rounded-lg px-6 py-3 shadow-md hover:bg-[#057DCD] transition-all duration-200"
            >
              Go to Booking Dashboard
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HelpBookings;
