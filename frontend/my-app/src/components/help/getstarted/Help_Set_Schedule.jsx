import React from "react";
import { motion } from "framer-motion";

const Help_Set_Schedule = () => {
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
  }, []);

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
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200" id="quick_actions_schedule">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Common Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">📅</div>
                <div>
                  <h3 className="font-medium text-gray-900">View Schedule</h3>
                  <p className="text-sm text-gray-600">
                    Dashboard → Schedule tab
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">🔔</div>
                <div>
                  <h3 className="font-medium text-gray-900">Set Reminders</h3>
                  <p className="text-sm text-gray-600">
                    Schedule tab → Enable notifications
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">🗓️</div>
                <div>
                  <h3 className="font-medium text-gray-900">Sync Calendar</h3>
                  <p className="text-sm text-gray-600">
                    Schedule tab → Sync with Google/Outlook
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="schedule_features">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Schedule Features
            </h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Centralized View
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>See all upcoming classes, consultations, and deadlines in one place</li>
                    <li>Color-coded events for easy identification</li>
                  </ul>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Reminders & Alerts
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Set up reminders for important events</li>
                    <li>Receive notifications before each session</li>
                  </ul>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Calendar Sync
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Sync your Polycon schedule with Google or Outlook calendar</li>
                    <li>Stay updated across all your devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Troubleshooting */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_troubleshooting_schedule">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">💡 Helpful Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Check your schedule daily to avoid missing sessions</li>
                  <li>• Enable notifications for timely reminders</li>
                  <li>• Use calendar sync for better organization</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Common Issues</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Events not showing? Try refreshing the page</li>
                  <li>• Sync issues? Reconnect your calendar account</li>
                  <li>• Notification problems? Check browser and app permissions</li>
                </ul>
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
          <div className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF]" id="quick_actions_schedule_teacher">
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Common Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">🗓️</div>
                <div>
                  <h3 className="font-medium text-gray-900">Set Consultation Slots</h3>
                  <p className="text-sm text-gray-600">
                    Dashboard → Schedule tab → Add availability
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">🔄</div>
                <div>
                  <h3 className="font-medium text-gray-900">Update Schedule</h3>
                  <p className="text-sm text-gray-600">
                    Schedule tab → Edit or remove slots
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">📤</div>
                <div>
                  <h3 className="font-medium text-gray-900">Export Schedule</h3>
                  <p className="text-sm text-gray-600">
                    Schedule tab → Export/Download
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="schedule_features">
            <h2 className="text-xl font-semibold text-[#057DCD] mb-6">
              Schedule Management Features
            </h2>
            <div className="space-y-6">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Availability Management
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Set available times for consultations and classes</li>
                    <li>Edit or remove slots as your schedule changes</li>
                    <li>Block out holidays or unavailable periods</li>
                  </ul>
                </div>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Calendar Integration
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Sync Polycon schedule with Google or Outlook calendar</li>
                    <li>Keep all appointments and classes in one view</li>
                  </ul>
                </div>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Notifications & Reminders
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Receive reminders for upcoming consultations and classes</li>
                    <li>Get notified of booking requests and schedule changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Troubleshooting */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-[#54BEFF]" id="tips_troubleshooting_schedule">
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">💡 Best Practices</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Update your availability regularly to reflect changes</li>
                  <li>• Use calendar sync for seamless organization</li>
                  <li>• Enable notifications for timely responses to requests</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">⚠️ Common Issues</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Trouble saving slots? Check your internet connection</li>
                  <li>• Sync issues? Reconnect your calendar account</li>
                  <li>• Not receiving notifications? Check your settings and permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Help_Set_Schedule;