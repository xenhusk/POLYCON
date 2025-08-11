import React from "react";
import { motion } from "framer-motion";

const Help_Calendar_Management = () => ( 
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    id="calendar_management" 
    className="flex-1">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <div className="mb-2">
          <span className="text-sm text-[#057DCD] font-medium">Help Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Calendar Management
        </h1>
        <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
          <p className="text-gray-700 text-sm sm:text-base">
            This guide explains how to use Polycon's calendar system to manage your consultation appointments and academic schedule.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200" id="quick_actions_calendar">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">📅</div>
            <div>
              <h3 className="font-medium text-gray-900">View Appointments</h3>
              <p className="text-sm text-gray-600">Dashboard → Calendar tab</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">✏️</div>
            <div>
              <h3 className="font-medium text-gray-900">Reschedule Meeting</h3>
              <p className="text-sm text-gray-600">Calendar → Select event → Edit</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">🔔</div>
            <div>
              <h3 className="font-medium text-gray-900">Set Reminders</h3>
              <p className="text-sm text-gray-600">Event details → Notification settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="p-4 sm:p-6 lg:p-8" id="calendar_features">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Calendar Features</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
              Appointment Overview
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Monthly, weekly, and daily calendar views</li>
                <li>Color-coded appointments by type (consultation, group session)</li>
                <li>Quick view of upcoming appointments</li>
                <li>Filter options for different appointment types</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
              Managing Appointments
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Click on any appointment to view details</li>
                <li>Use the reschedule option to change appointment time</li>
                <li>Cancel appointments with proper notification</li>
                <li>Add notes or topics for upcoming consultations</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
              Notifications & Reminders
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Email notifications for new appointments</li>
                <li>Browser notifications for upcoming sessions</li>
                <li>Customizable reminder timing</li>
                <li>SMS alerts (if enabled in your settings)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Troubleshooting */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_troubleshooting_calendar">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips & Troubleshooting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-[#057DCD] mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Enable browser notifications for timely reminders</li>
              <li>• Use the calendar sync feature with your phone</li>
              <li>• Add consultation topics in the appointment notes</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Common Issues</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Calendar not syncing? Check your internet connection</li>
              <li>• Missing notifications? Review your browser settings</li>
              <li>• Can't reschedule? Contact the faculty member first</li>
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
            <a href="#calendar_features" className="text-[#057DCD] hover:text-[#54BEFF] text-sm">
              Jump to Features
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

export default Help_Calendar_Management;