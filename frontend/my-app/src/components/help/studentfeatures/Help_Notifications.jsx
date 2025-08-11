import React from "react";
import { motion } from "framer-motion";

const Help_Notifications = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    id="notifications" 
    className="flex-1">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <div className="mb-2">
          <span className="text-sm text-[#057DCD] font-medium">Help Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Notification System
        </h1>
        <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
          <p className="text-gray-700 text-sm sm:text-base">
            Learn how to manage your Polycon notifications to stay updated on your consultations and important academic events.
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">🔔</div>
            <div>
              <h3 className="font-medium text-gray-900">View Notifications</h3>
              <p className="text-sm text-gray-600">Click bell icon → View all</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">⚙️</div>
            <div>
              <h3 className="font-medium text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-600">Profile → Settings → Notifications</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">📱</div>
            <div>
              <h3 className="font-medium text-gray-900">Mobile Alerts</h3>
              <p className="text-sm text-gray-600">Settings → Mobile notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="p-4 sm:p-6 lg:p-8" id="notification_types">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Types of Notifications</h2>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
              Consultation Notifications
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Booking confirmations</li>
                <li>Reminder 24 hours before consultation</li>
                <li>Reminder 1 hour before consultation</li>
                <li>Cancellation or rescheduling updates</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
              System Updates
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Faculty availability changes</li>
                <li>System maintenance announcements</li>
                <li>New features and updates</li>
                <li>Important academic deadlines</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
              Support & Messages
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Responses to support inquiries</li>
                <li>Important announcements from faculty</li>
                <li>System alerts and warnings</li>
                <li>Account-related notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Settings */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_settings">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips & Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-[#057DCD] mb-2">💡 Recommended Settings</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Enable email notifications for important updates</li>
              <li>• Keep browser notifications on for real-time alerts</li>
              <li>• Set up mobile notifications for urgent matters</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Troubleshooting</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Not receiving emails? Check spam folder</li>
              <li>• Browser notifications blocked? Check permissions</li>
              <li>• Update contact info for reliable delivery</li>
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
            <a href="#notifications" className="text-[#057DCD] hover:text-[#54BEFF] text-sm">
              Jump to Top
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

export default Help_Notifications;