import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const HelpCalendarManagement = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role === "faculty");
  }, []);

  const studentFeatures = [
    {
      title: "Teacher Search",
      description:
        "Search for teachers by name or subject to find the right person for your consultation.",
    },
    {
      title: "Available Time Slots",
      description:
        "View and select from available consultation slots that fit your schedule.",
    },
    {
      title: "Group Consultations",
      description:
        "Invite other students to join your consultation for group discussions and collaborative learning.",
    },
    {
      title: "Confirmation & Reminders",
      description:
        "Receive confirmation once your booking is approved and get reminders before your session.",
    },
  ];

  const teacherFeatures = [
    {
      title: "Set Available Slots",
      description:
        "Define your available times for consultations so students can book sessions that fit your schedule.",
    },
    {
      title: "Approve or Decline Requests",
      description:
        "Review student booking requests and approve or decline them with a single click.",
    },
    {
      title: "Group Session Management",
      description:
        "Manage group consultations, see all invited students, and communicate important details.",
    },
    {
      title: "Automated Reminders",
      description:
        "Receive reminders for upcoming consultations and notify students of any changes.",
    },
  ];

  const studentTips = [
    "Book early to secure your preferred time slot.",
    "Double-check the time zone of your booking.",
    "Communicate with your teacher about any specific topics or questions you have.",
    "Keep your software updated for the best virtual consultation experience.",
  ];

  const teacherTips = [
    "Regularly update your available slots to reflect your true schedule.",
    "Communicate expectations and required materials to students ahead of time.",
    "Use group sessions for topics that benefit from peer discussion.",
    "Check your notifications for new booking requests and reminders.",
  ];

  const filteredFeatures = (isTeacher ? teacherFeatures : studentFeatures).filter(
    (feature) =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTips = (isTeacher ? teacherTips : studentTips).filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_Calendar_Management"
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">
              Calendar Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {isTeacher
              ? "Manage Your Consultation Bookings"
              : "Booking a Consultation"}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            {isTeacher
              ? "Efficiently manage your consultation slots, approve or decline student requests, and keep track of your upcoming sessions."
              : "Schedule new consultations with your teachers and invite fellow students for group sessions."}
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                {isTeacher ? "Stay Organized and Connected" : "Easy and flexible booking"}
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                {isTeacher
                  ? "Keep your consultation schedule organized and help your students succeed."
                  : "Find available teachers, select time slots, and invite classmates for collaborative consultations."}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="booking_features">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
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
            id="tips_section_bookings"
          >
            <h4 className="font-semibold text-[#057DCD] mb-2">
              Tips for {isTeacher ? "Teachers" : "Students"}
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

        {/* CTA Section */}
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Ready to {isTeacher ? "Manage Your Bookings?" : "Book a Consultation?"}
          </h3>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            {isTeacher
              ? "Keep your consultation schedule organized and help your students succeed. Visit your dashboard to manage bookings now."
              : "Take the next step in your learning journey. Book a consultation now and get the help you need to succeed."}
          </p>
          <a
            href="#"
            className="inline-block bg-[#057DCD] text-white text-base sm:text-lg font-semibold rounded-lg px-6 py-3 shadow-md hover:bg-[#046BB1] transition-all duration-200"
          >
            {isTeacher ? "Go to Booking Dashboard" : "Book a Consultation"}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpCalendarManagement;