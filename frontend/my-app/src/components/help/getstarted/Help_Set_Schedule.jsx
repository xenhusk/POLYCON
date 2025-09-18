import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Set_Schedule = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
  }, []);

  const studentQuickActions = [
    {
      title: "View Schedule",
      description: "Dashboard → Schedule tab",
    },
    {
      title: "Set Reminders",
      description: "Schedule tab → Enable notifications",
    },
    {
      title: "Sync Calendar",
      description: "Schedule tab → Sync with Google/Outlook",
    },
  ];

  const teacherQuickActions = [
    {
      title: "Set Consultation Slots",
      description: "Dashboard → Schedule tab → Add availability",
    },
    {
      title: "Update Schedule",
      description: "Schedule tab → Edit or remove slots",
    },
    {
      title: "Export Schedule",
      description: "Schedule tab → Export/Download",
    },
  ];

  const studentFeatures = [
    {
      title: "Centralized View",
      description: [
        "See all upcoming classes, consultations, and deadlines in one place",
        "Color-coded events for easy identification",
      ],
    },
    {
      title: "Reminders & Alerts",
      description: [
        "Set up reminders for important events",
        "Receive notifications before each session",
      ],
    },
    {
      title: "Calendar Sync",
      description: [
        "Sync your Polycon schedule with Google or Outlook calendar",
        "Stay updated across all your devices",
      ],
    },
  ];

  const teacherFeatures = [
    {
      title: "Availability Management",
      description: [
        "Set available times for consultations and classes",
        "Edit or remove slots as your schedule changes",
        "Block out holidays or unavailable periods",
      ],
    },
    {
      title: "Calendar Integration",
      description: [
        "Sync Polycon schedule with Google or Outlook calendar",
        "Keep all appointments and classes in one view",
      ],
    },
    {
      title: "Notifications & Reminders",
      description: [
        "Receive reminders for upcoming consultations and classes",
        "Get notified of booking requests and schedule changes",
      ],
    },
  ];

  const studentTips = [
    "Check your schedule daily to avoid missing sessions",
    "Enable notifications for timely reminders",
    "Use calendar sync for better organization",
  ];

  const teacherTips = [
    "Update your availability regularly to reflect changes",
    "Use calendar sync for seamless organization",
    "Enable notifications for timely responses to requests",
  ];

  const studentIssues = [
    "Events not showing? Try refreshing the page",
    "Sync issues? Reconnect your calendar account",
    "Notification problems? Check browser and app permissions",
  ];

  const teacherIssues = [
    "Trouble saving slots? Check your internet connection",
    "Sync issues? Reconnect your calendar account",
    "Not receiving notifications? Check your settings and permissions",
  ];

  const filteredStudentQuickActions = studentQuickActions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherQuickActions = teacherQuickActions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentFeatures = studentFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherFeatures = teacherFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentTips = studentTips.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherTips = teacherTips.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentIssues = studentIssues.filter((issue) =>
    issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherIssues = teacherIssues.filter((issue) =>
    issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="set_schedule"
      className="flex-1"
    >
      {/* For learners */}
      {!isTeacher && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
          {/* Header section */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
            <div className="mb-2">
              <span className="text-sm text-[#057DCD] font-medium">
                Help Guide
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Viewing Your Schedule
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                Learn how to view and manage your class and consultation schedules in Polycon. Stay organized and never miss an important session or appointment.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b border-gray-200"
            id="quick_actions_schedule"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Common Tasks
            </h2>
            {filteredStudentQuickActions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudentQuickActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg py-8">
                <p>No quick actions found for "{searchQuery}".</p>
              </div>
            )}
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="schedule_features">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Schedule Features
            </h2>
            {filteredStudentFeatures.length > 0 ? (
              <div className="space-y-6">
                {filteredStudentFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                      <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                        {index + 1}
                      </span>
                      {feature.title}
                    </h3>
                    <div className="pl-8">
                      <ul className="list-disc text-gray-600 space-y-2 text-sm">
                        {feature.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg py-8">
                <p>No features found for "{searchQuery}".</p>
              </div>
            )}
          </div>

          {/* Tips & Troubleshooting */}
          <div
            className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200"
            id="tips_troubleshooting_schedule"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">
                  💡 Helpful Tips
                </h3>
                {filteredStudentTips.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-2">
                    {filteredStudentTips.map((tip, index) => (
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
                <h3 className="font-medium text-[#057DCD] mb-2">
                  ⚠️ Common Issues
                </h3>
                {filteredStudentIssues.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-2">
                    {filteredStudentIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 text-lg py-8">
                    <p>No issues found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* For teachers */}
      {isTeacher && (
        <div className="bg-white rounded-lg shadow-sm border border-[#54BEFF] max-w-7xl mx-auto">
          {/* Header section */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF] bg-gradient-to-r from-[#e6f3ff] to-[#fafdff]">
            <div className="mb-2">
              <span className="text-sm text-[#00A3FF] font-medium">
                Help Guide
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#057DCD] mb-3">
              Setting and Managing Your Schedule
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#00A3FF] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                This guide explains how to set, update, and manage your availability and schedule in Polycon, including best practices for organizing consultation slots and class sessions.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF]"
            id="quick_actions_schedule_teacher"
          >
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Common Tasks
            </h2>
            {filteredTeacherQuickActions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeacherQuickActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-blue-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg py-8">
                <p>No quick actions found for "{searchQuery}".</p>
              </div>
            )}
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="schedule_features">
            <h2 className="text-xl font-semibold text-[#057DCD] mb-6">
              Schedule Management Features
            </h2>
            {filteredTeacherFeatures.length > 0 ? (
              <div className="space-y-6">
                {filteredTeacherFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                  >
                    <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                      <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                        {index + 1}
                      </span>
                      {feature.title}
                    </h3>
                    <div className="pl-8">
                      <ul className="list-disc text-gray-600 space-y-2 text-sm">
                        {feature.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg py-8">
                <p>No features found for "{searchQuery}".</p>
              </div>
            )}
          </div>

          {/* Tips & Troubleshooting */}
          <div
            className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-[#54BEFF]"
            id="tips_troubleshooting_schedule"
          >
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">
                  💡 Best Practices
                </h3>
                {filteredTeacherTips.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-2">
                    {filteredTeacherTips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 text-lg py-8">
                    <p>No tips found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">
                  ⚠️ Common Issues
                </h3>
                {filteredTeacherIssues.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-2">
                    {filteredTeacherIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 text-lg py-8">
                    <p>No issues found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Help_Set_Schedule;