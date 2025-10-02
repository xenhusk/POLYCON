import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_ClassRecord = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
  }, []);

  const studentQuickActions = [
    {
      title: "View Class Record",
      description: "Dashboard → Class Record tab",
    },
    {
      title: "Check Details",
      description: "Class Record tab → Select subject → View breakdown",
    },
    {
      title: "Track Progress",
      description: "Class Record tab → Progress chart",
    },
  ];

  const teacherQuickActions = [
    {
      title: "Enter or Update Records",
      description: "Dashboard → Class Record tab → Select class/subject",
    },
    {
      title: "Review Details",
      description: "Class Record tab → Select learner → View breakdown",
    },
    {
      title: "Export Reports",
      description: "Class Record tab → Export/Download",
    },
  ];

  const studentFeatures = [
    {
      title: "Overview",
      description: [
        "Access all records for each subject in one place",
        "See the latest updates as soon as records are posted",
        "Review attendance, participation, and performance",
      ],
    },
    {
      title: "Detailed Breakdown",
      description: [
        "Check scores for quizzes, assignments, exams, and projects",
        "Understand how each component contributes to the overall record",
        "Identify strengths and areas for improvement",
      ],
    },
    {
      title: "Progress Tracking",
      description: [
        "Visualize progress with charts and graphs",
        "Monitor trends over time to stay on track",
        "Set personal goals based on record trends",
      ],
    },
  ];

  const teacherFeatures = [
    {
      title: "Record Entry & Updates",
      description: [
        "Input scores for quizzes, assignments, exams, and projects",
        "Edit or update records as needed throughout the term",
        "Save drafts before finalizing submissions",
      ],
    },
    {
      title: "Attendance & Participation Tracking",
      description: [
        "Monitor attendance and participation for each session",
        "Identify patterns and address concerns proactively",
        "Generate attendance reports as needed",
      ],
    },
    {
      title: "Feedback & Communication",
      description: [
        "Provide feedback on individual record items",
        "Communicate with learners about performance and improvement",
        "Respond to record inquiries directly through the platform",
      ],
    },
  ];

  const studentTips = [
    "Review class records regularly to stay informed about academic standing",
    "Use the breakdown to focus on areas that need improvement",
    "Reach out to instructors for clarification on any record item",
  ];

  const teacherTips = [
    "Update records promptly after each assessment or session",
    "Use analytics to identify learners who may need extra support",
    "Provide clear and constructive feedback with each record entry",
    "Double-check entries before finalizing submissions",
  ];

  const studentIssues = [
    "Missing records? Try refreshing the page or check back later",
    "Discrepancies? Contact the instructor for verification",
    "Trouble accessing records? Ensure you are logged in and have the correct permissions",
  ];

  const teacherIssues = [
    "Trouble saving records? Check your internet connection",
    "Missing items? Refresh the page or re-sync data",
    "Questions from learners? Use the platform's messaging tools for quick responses",
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
                This guide explains how to access and interpret class records in
                Polycon, including tips for tracking academic progress,
                attendance, and participation.
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
          <div className="p-4 sm:p-6 lg:p-8" id="grade_features">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Class Record Features
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
              Managing Class Records
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#00A3FF] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                This guide explains how to manage, update, and review class
                records in Polycon, including best practices for tracking
                attendance, performance, and providing feedback.
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
          <div className="p-4 sm:p-6 lg:p-8" id="grade_features">
            <h2 className="text-xl font-semibold text-[#057DCD] mb-6">
              Class Record Management Features
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
            id="tips_troubleshooting_grade"
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

export default Help_ClassRecord;