import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Dashboard = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role === "faculty");
  }, []);

  const dashboardFeatures = [
    {
      title: "Profile Overview",
      description:
        "Instantly view your name, program, year/section, and other personal details.",
      role: "student",
    },
    {
      title: "Consultation Calendar",
      description:
        "See all your scheduled and upcoming consultations in a calendar view.",
      role: "student",
    },
    {
      title: "Quick Actions",
      description:
        "Book a new consultation, view your appointments, or update your profile with just a click.",
      role: "student",
    },
    {
      title: "Notifications",
      description:
        "Stay updated with reminders and important announcements from faculty.",
      role: "student",
    },
    {
      title: "Consultation Management",
      description:
        "Set available slots, approve or decline student requests, and keep your consultation calendar organized.",
      role: "teacher",
    },
    {
      title: "Student Progress Tracking",
      description:
        "Monitor student attendance, participation, and follow-up on academic concerns.",
      role: "teacher",
    },
    {
      title: "Communication Tools",
      description:
        "Send announcements, reminders, and feedback to your students efficiently.",
      role: "teacher",
    },
    {
      title: "Analytics & Reports",
      description:
        "Access analytics on student engagement and generate reports for your classes.",
      role: "teacher",
    },
  ];

  const tipsForStudents = [
    "Check your dashboard regularly to stay on top of your academic schedule.",
    "Use the “View My Appointments” button on mobile for a streamlined experience.",
    "Update your profile to ensure your information is always current.",
  ];

  const tipsForTeachers = [
    "Regularly update your consultation slots to reflect your availability.",
    "Use the dashboard analytics to identify students who may need extra support.",
    "Communicate proactively with students to encourage participation.",
    "Review your dashboard notifications for important updates and requests.",
  ];

  const filteredFeatures = dashboardFeatures.filter((feature) => {
    const titleMatch = feature.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const descriptionMatch = feature.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const roleMatch = isTeacher
      ? feature.role === "teacher"
      : feature.role === "student";
    return (titleMatch || descriptionMatch) && (feature.role === "both" || roleMatch);
  });

  const filteredTips = (isTeacher ? tipsForTeachers : tipsForStudents).filter(
    (tip) => tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Info_Dashboard"
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">
              Dashboard
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Your Personalized Dashboard
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            The dashboard is your main hub for managing your academic journey,
            tracking consultations, and staying updated.
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Everything you need in one place
              </h3>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Access your profile, view your consultation calendar, and
                receive important notifications—all from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="dashboard_features">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Key Features
          </h3>
          {filteredFeatures.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 auto-rows-auto sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:grid-cols-2">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200"
                >
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
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
            id="tips_section_dashboard"
          >
            <h4 className="font-semibold text-[#057DCD] mb-2">
              Tips for {isTeacher ? "Teachers" : "Students"}
            </h4>
            {filteredTips.length > 0 ? (
              <ul className="list-disc ml-6 text-sm sm:text-base text-gray-700">
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

export default Help_Dashboard;