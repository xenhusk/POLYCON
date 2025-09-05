import React from "react";
import { motion } from "framer-motion";

const Help_Enrolled_Student = () => {
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
      id="enrolled_student"
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
              Enrolled Subjects Overview
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                Learn how to view and manage enrolled subjects in Polycon, track academic progress, and access important subject information.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200" id="quick_actions_enrolled">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Common Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">📚</div>
                <div>
                  <h3 className="font-medium text-gray-900">View Enrolled Subjects</h3>
                  <p className="text-sm text-gray-600">
                    Dashboard → Enrolled tab
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">🔍</div>
                <div>
                  <h3 className="font-medium text-gray-900">Check Subject Details</h3>
                  <p className="text-sm text-gray-600">
                    Enrolled tab → Select subject → View info
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">📅</div>
                <div>
                  <h3 className="font-medium text-gray-900">See Schedule</h3>
                  <p className="text-sm text-gray-600">
                    Enrolled tab → Subject schedule
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="enrolled_features">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Enrolled Subjects Features
            </h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Subject Overview
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>See a list of all current subjects</li>
                    <li>Access subject codes, instructors, and credits</li>
                    <li>Stay updated with subject announcements</li>
                  </ul>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Subject Details & Resources
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>View subject syllabus and requirements</li>
                    <li>Access learning materials and resources</li>
                    <li>Check grading policies and assessment breakdown</li>
                  </ul>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Schedule & Announcements
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>See class schedules and important dates</li>
                    <li>Receive updates on class changes or cancellations</li>
                    <li>Stay informed about upcoming assessments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Troubleshooting */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_troubleshooting_enrolled">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">💡 Helpful Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Review enrolled subjects regularly to stay updated</li>
                  <li>• Use subject details to prepare for classes and assessments</li>
                  <li>• Check announcements for important updates</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Common Issues</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Missing subjects? Try refreshing or contact support</li>
                  <li>• Incorrect info? Reach out to the instructor or admin</li>
                  <li>• Trouble accessing resources? Check your permissions</li>
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
              Managing Enrolled Students
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#00A3FF] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                This guide explains how to view, manage, and support enrolled students in Polycon, including best practices for tracking progress and communicating important information.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF]" id="quick_actions_enrolled_teacher">
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Common Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">👥</div>
                <div>
                  <h3 className="font-medium text-gray-900">View Enrolled Students</h3>
                  <p className="text-sm text-gray-600">
                    Dashboard → Enrolled tab → Select class
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">📋</div>
                <div>
                  <h3 className="font-medium text-gray-900">Manage Student List</h3>
                  <p className="text-sm text-gray-600">
                    Enrolled tab → Add/Remove students
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">📈</div>
                <div>
                  <h3 className="font-medium text-gray-900">Track Progress</h3>
                  <p className="text-sm text-gray-600">
                    Enrolled tab → Select student → View performance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="enrolled_features_teacher">
            <h2 className="text-xl font-semibold text-[#057DCD] mb-6">
              Enrolled Student Management Features
            </h2>
            <div className="space-y-6">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Student List Management
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>View all enrolled students for each class or subject</li>
                    <li>Add or remove students as needed</li>
                    <li>Update student information and status</li>
                  </ul>
                </div>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Progress Tracking & Analytics
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Monitor attendance, grades, and participation</li>
                    <li>Identify students who may need additional support</li>
                    <li>Generate reports for academic performance</li>
                  </ul>
                </div>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Communication & Announcements
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Send announcements and updates to all enrolled students</li>
                    <li>Communicate individually for feedback or concerns</li>
                    <li>Share resources and important dates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Troubleshooting */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-[#54BEFF]" id="tips_troubleshooting_enrolled_teacher">
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">💡 Best Practices</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Keep student lists updated for accurate records</li>
                  <li>• Use analytics to identify students needing support</li>
                  <li>• Communicate regularly to keep everyone informed</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">⚠️ Common Issues</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Trouble updating lists? Check your internet connection</li>
                  <li>• Missing students? Refresh or re-sync data</li>
                  <li>• Communication issues? Use the platform's messaging tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Help_Enrolled_Student;