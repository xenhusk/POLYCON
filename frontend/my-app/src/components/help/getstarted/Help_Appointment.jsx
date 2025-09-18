import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const HelpAppointment = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role === "faculty");
  }, []);

  const studentFeatures = [
    {
      title: "Upcoming Appointments",
      description:
        "Easily view all your scheduled future consultations with teachers and classmates.",
    },
    {
      title: "Appointment Details",
      description:
        "Check details for each appointment, including teacher, time, participants, and location.",
    },
    {
      title: "Past Appointments",
      description:
        "Review your previous consultations and keep a record of your academic support sessions.",
    },
    {
      title: "Reload & Refresh",
      description:
        "Reload the page if appointments do not appear or if you need to refresh your data.",
    },
  ];

  const teacherFeatures = [
    {
      title: "Approve or Decline Appointments",
      description:
        "Review student appointment requests and approve or decline them directly from your dashboard.",
    },
    {
      title: "View All Bookings",
      description:
        "See a consolidated list of all upcoming and past appointments with students.",
    },
    {
      title: "Send Reminders",
      description:
        "Notify students about upcoming appointments or changes to the schedule.",
    },
    {
      title: "Manage Group Sessions",
      description:
        "Organize and manage group consultations, track attendance, and communicate with all participants.",
    },
  ];

  const tipsForStudents = [
    "Check your appointments regularly to avoid missing any sessions.",
    "Contact your teacher if you need to reschedule or cancel an appointment.",
    "Use the refresh button or reload the page to get the latest updates.",
  ];

  const tipsForTeachers = [
    "Regularly check your dashboard for new appointment requests.",
    "Communicate clearly with students about expectations and required materials.",
    "Use reminders to reduce no-shows and keep students informed.",
    "Update your availability to reflect your current schedule.",
  ];

  const filteredStudentFeatures = studentFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherFeatures = teacherFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTips = (isTeacher ? tipsForTeachers : tipsForStudents).filter(
    (tip) => tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_Appointments"
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">
              Appointments
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Managing Your Appointments
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            View, manage, and keep track of all your upcoming and past
            consultation appointments.
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Stay organized with your schedule
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Access all your appointments in one place and never miss a
                consultation with your teachers.
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="appointment_features">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Student Features */}
            {!isTeacher && filteredStudentFeatures.length > 0 ? (
              filteredStudentFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200"
                >
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))
            ) : null}

            {/* Teacher Features */}
            {isTeacher && filteredTeacherFeatures.length > 0 ? (
              filteredTeacherFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200"
                >
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))
            ) : null}
          </div>
          {/* No Features Found Message */}
          {(!isTeacher && filteredStudentFeatures.length === 0) ||
            (isTeacher && filteredTeacherFeatures.length === 0) ? (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No features found for "{searchQuery}".</p>
            </div>
          ) : null}
        </div>

        {/* Tips Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div
            className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-[#057DCD]"
            id="tips_section_appointments"
          >
            <h4 className="font-semibold text-[#057DCD] mb-2">
              Tips for Managing Appointments
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

export default HelpAppointment;