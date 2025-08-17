import React from "react";
import { motion } from "framer-motion";

const Help_ClassRecord = () => {
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
      id="class_record_management"
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
              Viewing Class Records
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                This guide explains how to access and interpret class records in Polycon, including tips for tracking academic progress, attendance, and participation.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b border-gray-200"
            id="quick_actions_class_record"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Common Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">📄</div>
                <div>
                  <h3 className="font-medium text-gray-900">View Class Record</h3>
                  <p className="text-sm text-gray-600">
                    Dashboard → Class Record tab
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">🔍</div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Check Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Class Record tab → Select subject → View breakdown
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="text-[#057DCD] text-xl mr-3">📈</div>
                <div>
                  <h3 className="font-medium text-gray-900">Track Progress</h3>
                  <p className="text-sm text-gray-600">
                    Class Record tab → Progress chart
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="grade_features">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Class Record Features
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Overview
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Access all records for each subject in one place</li>
                    <li>See the latest updates as soon as records are posted</li>
                    <li>Review attendance, participation, and performance</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Detailed Breakdown
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>
                      Check scores for quizzes, assignments, exams, and projects
                    </li>
                    <li>
                      Understand how each component contributes to the overall record
                    </li>
                    <li>Identify strengths and areas for improvement</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Progress Tracking
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Visualize progress with charts and graphs</li>
                    <li>Monitor trends over time to stay on track</li>
                    <li>Set personal goals based on record trends</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Troubleshooting */}
          <div
            className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200"
            id="tips_troubleshooting_grade"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">
                  💡 Helpful Tips
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>
                    • Review class records regularly to stay informed about academic standing
                  </li>
                  <li>
                    • Use the breakdown to focus on areas that need improvement
                  </li>
                  <li>
                    • Reach out to instructors for clarification on any record item
                  </li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">
                  ⚠️ Common Issues
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>
                    • Missing records? Try refreshing the page or check back later
                  </li>
                  <li>
                    • Discrepancies? Contact the instructor for verification
                  </li>
                  <li>
                    • Trouble accessing records? Ensure you are logged in and have the correct permissions
                  </li>
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
              Managing Class Records
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#00A3FF] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                This guide explains how to manage, update, and review class records in Polycon, including best practices for tracking attendance, performance, and providing feedback.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF]"
            id="quick_actions_class_record"
          >
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Common Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">📝</div>
                <div>
                  <h3 className="font-medium text-gray-900">Enter or Update Records</h3>
                  <p className="text-sm text-gray-600">
                    Dashboard → Class Record tab → Select class/subject
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">🔍</div>
                <div>
                  <h3 className="font-medium text-gray-900">Review Details</h3>
                  <p className="text-sm text-gray-600">
                    Class Record tab → Select learner → View breakdown
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-[#00A3FF] text-xl mr-3">📤</div>
                <div>
                  <h3 className="font-medium text-gray-900">Export Reports</h3>
                  <p className="text-sm text-gray-600">
                    Class Record tab → Export/Download
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features */}
          <div className="p-4 sm:p-6 lg:p-8" id="grade_features">
            <h2 className="text-xl font-semibold text-[#057DCD] mb-6">
              Class Record Management Features
            </h2>

            <div className="space-y-6">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Record Entry & Updates
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Input scores for quizzes, assignments, exams, and projects</li>
                    <li>Edit or update records as needed throughout the term</li>
                    <li>Save drafts before finalizing submissions</li>
                  </ul>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Attendance & Participation Tracking
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Monitor attendance and participation for each session</li>
                    <li>Identify patterns and address concerns proactively</li>
                    <li>Generate attendance reports as needed</li>
                  </ul>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                  <span className="bg-[#00A3FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Feedback & Communication
                </h3>
                <div className="pl-8">
                  <ul className="list-disc text-gray-600 space-y-2 text-sm">
                    <li>Provide feedback on individual record items</li>
                    <li>Communicate with learners about performance and improvement</li>
                    <li>Respond to record inquiries directly through the platform</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Troubleshooting */}
          <div
            className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-[#54BEFF]"
            id="tips_troubleshooting_grade"
          >
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">💡 Best Practices</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Update records promptly after each assessment or session</li>
                  <li>• Use analytics to identify learners who may need extra support</li>
                  <li>• Provide clear and constructive feedback with each record entry</li>
                  <li>• Double-check entries before finalizing submissions</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">
                  ⚠️ Common Issues
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Trouble saving records? Check your internet connection</li>
                  <li>• Missing items? Refresh the page or re-sync data</li>
                  <li>• Questions from learners? Use the platform's messaging tools for quick responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Help_ClassRecord;  