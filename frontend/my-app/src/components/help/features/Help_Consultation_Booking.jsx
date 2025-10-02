import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Consultation_Booking = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role === "faculty");
  }, []);

  const teacherFeatures = [
    {
      title: "Set Available Slots",
      description:
        "Define your consultation hours so students can book sessions that fit your availability.",
    },
    {
      title: "Approve or Decline Requests",
      description:
        "Review student booking requests and approve or decline them directly from your dashboard.",
    },
    {
      title: "Send Reminders",
      description:
        "Notify students about upcoming consultations or changes to the schedule.",
    },
    {
      title: "Manage Group Sessions",
      description:
        "Organize group consultations and communicate with all participants efficiently.",
    },
  ];

  const studentBookingSteps = [
    {
      step: 1,
      title: "Select Faculty & Time",
      description: [
        "Click 'Book Consultation' on your dashboard",
        "Choose a faculty member from the available list",
        "Select an available time slot from their calendar",
        "Check the consultation duration (usually 30-60 minutes)",
      ],
    },
    {
      step: 2,
      title: "Add Consultation Details",
      description: [
        "Specify your consultation topic",
        "Add any specific questions or concerns",
        "Upload relevant documents (if needed)",
        "Choose your preferred meeting method (online/in-person)",
      ],
    },
    {
      step: 3,
      title: "Confirm and Schedule",
      description: [
        "Review all booking details",
        "Check faculty's consultation policies",
        "Confirm your booking",
        "Receive confirmation email and calendar invite",
      ],
    },
  ];

  const bookingTips = [
    "Book at least 24 hours in advance",
    "Check faculty availability calendar",
    "Be specific about your consultation needs",
  ];

  const bookingPolicies = [
    "Cancellations: At least 12 hours notice",
    "Late arrival: Max 10 minutes grace period",
    "No-shows may affect future bookings",
  ];

  const filteredTeacherFeatures = teacherFeatures.filter(
    (feature) =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookingSteps = studentBookingSteps.filter((step) =>
    step.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookingTips = bookingTips.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookingPolicies = bookingPolicies.filter((policy) =>
    policy.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-sm text-[#057DCD] font-medium">
              Help Guide
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Consultation Booking
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              Learn how to book and manage consultation sessions with faculty
              members through Polycon's booking system.
            </p>
          </div>
        </div>

        {/* Teacher-specific section */}
        {isTeacher && (
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#e6f3ff] to-[#fafdff] border-b border-[#54BEFF]">
            <div className="mb-2">
              <span className="text-sm text-[#00A3FF] font-medium">
                Teachers
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#057DCD] mb-3">
              Manage Consultation Bookings
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4">
              You can set your available consultation slots, review and approve
              student requests, and keep your schedule organized.
            </p>
            {filteredTeacherFeatures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredTeacherFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg py-8">
                <p>No features found for "{searchQuery}".</p>
              </div>
            )}

            <div className="mt-6 bg-white rounded-lg p-4 border-l-4 border-[#00A3FF]">
              <h4 className="font-semibold text-[#00A3FF] mb-2">
                Tips for Teachers
              </h4>
              {filteredBookingTips.length > 0 ? (
                <ul className="list-disc ml-6 text-gray-700 text-sm">
                  {filteredBookingTips.map((tip, index) => (
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
        )}

        {/* Booking Steps */}
        <div className="p-4 sm:p-6 lg:p-8" id="booking_steps">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Booking Process
          </h2>
          {filteredBookingSteps.length > 0 ? (
            <div className="space-y-6">
              {filteredBookingSteps.map((step, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                    <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                      {step.step}
                    </span>
                    {step.title}
                  </h3>
                  <div className="pl-8">
                    <ul className="list-disc text-gray-600 space-y-2 text-sm">
                      {step.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No booking steps found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Tips & Guidelines */}
        <div
          className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200"
          id="tips_guidelines_booking"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Important Notes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-[#057DCD] mb-2">💡 Booking Tips</h3>
              {filteredBookingTips.length > 0 ? (
                <ul className="text-sm text-gray-600 space-y-2">
                  {filteredBookingTips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500 text-lg py-8">
                  <p>No tips found for "{searchQuery}".</p>
                </div>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Policies</h3>
              {filteredBookingPolicies.length > 0 ? (
                <ul className="text-sm text-gray-600 space-y-2">
                  {filteredBookingPolicies.map((policy, index) => (
                    <li key={index}>• {policy}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500 text-lg py-8">
                  <p>No policies found for "{searchQuery}".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Help_Consultation_Booking;