import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Notifications = () => {
  const { searchQuery } = useContext(HelpContext);

  const quickAccessItems = [
    {
      title: "View Notifications",
      description: "Click bell icon → View all",
    },
    {
      title: "Notification Settings",
      description: "Profile → Settings → Notifications",
    },
    {
      title: "Mobile Alerts",
      description: "Settings → Mobile notifications",
    },
  ];

  const notificationTypes = [
    {
      title: "Consultation Notifications",
      description: [
        "Booking confirmations",
        "Reminder 24 hours before consultation",
        "Reminder 1 hour before consultation",
        "Cancellation or rescheduling updates",
      ],
    },
    {
      title: "System Updates",
      description: [
        "Faculty availability changes",
        "System maintenance announcements",
        "New features and updates",
        "Important academic deadlines",
      ],
    },
    {
      title: "Support & Messages",
      description: [
        "Responses to support inquiries",
        "Important announcements from faculty",
        "System alerts and warnings",
        "Account-related notifications",
      ],
    },
  ];

  const tipsAndSettings = [
    {
      title: "Recommended Settings",
      description: [
        "Enable email notifications for important updates",
        "Keep browser notifications on for real-time alerts",
        "Set up mobile notifications for urgent matters",
      ],
    },
    {
      title: "Troubleshooting",
      description: [
        "Not receiving emails? Check spam folder",
        "Browser notifications blocked? Check permissions",
        "Update contact info for reliable delivery",
      ],
    },
  ];

  const filteredQuickAccessItems = quickAccessItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotificationTypes = notificationTypes.filter((type) =>
    type.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTipsAndSettings = tipsAndSettings.filter((setting) =>
    setting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="notifications"
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
            Notification System
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              Learn how to manage your Polycon notifications to stay updated on
              your consultations and important academic events.
            </p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Access
          </h2>
          {filteredQuickAccessItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuickAccessItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No quick access items found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Notification Types */}
        <div className="p-4 sm:p-6 lg:p-8" id="notification_types">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Types of Notifications
          </h2>
          {filteredNotificationTypes.length > 0 ? (
            <div className="space-y-6">
              {filteredNotificationTypes.map((type, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                    <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                      {index + 1}
                    </span>
                    {type.title}
                  </h3>
                  <div className="pl-8">
                    <ul className="list-disc text-gray-600 space-y-2 text-sm">
                      {type.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No notification types found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Tips & Settings */}
        <div
          className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200"
          id="tips_settings"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tips & Settings
          </h2>
          {filteredTipsAndSettings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTipsAndSettings.map((setting, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium text-[#057DCD] mb-2">
                    💡 {setting.title}
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {setting.description.map((desc, i) => (
                      <li key={i}>• {desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No tips and settings found for "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Help_Notifications;