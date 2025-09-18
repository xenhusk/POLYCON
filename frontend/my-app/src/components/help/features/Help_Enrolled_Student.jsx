import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Enrolled_Student = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
  }, []);

  const studentQuickActions = [
    {
      title: "View Enrolled Subjects",
      description: "Dashboard → Enrolled tab",
    },
    {
      title: "Check Subject Details",
      description: "Enrolled tab → Select subject → View info",
    },
    {
      title: "See Schedule",
      description: "Enrolled tab → Subject schedule",
    },
  ];

  const studentFeatures = [
    {
      title: "Subject Overview",
      description: [
        "See a list of all current subjects",
        "Access subject codes, instructors, and credits",
        "Stay updated with subject announcements",
      ],
    },
    {
      title: "Subject Details & Resources",
      description: [
        "View subject syllabus and requirements",
        "Access learning materials and resources",
        "Check grading policies and assessment breakdown",
      ],
    },
    {
      title: "Schedule & Announcements",
      description: [
        "See class schedules and important dates",
        "Receive updates on class changes or cancellations",
        "Stay informed about upcoming assessments",
      ],
    },
  ];

  const studentTips = [
    "Review enrolled subjects regularly to stay updated",
    "Use subject details to prepare for classes and assessments",
    "Check announcements for important updates",
  ];

  const studentIssues = [
    "Missing subjects? Try refreshing or contact support",
    "Incorrect info? Reach out to the instructor or admin",
    "Trouble accessing resources? Check your permissions",
  ];

  const teacherQuickActions = [
    {
      title: "View Enrolled Students",
      description: "Dashboard → Enrolled tab → Select class",
    },
    {
      title: "Manage Student List",
      description: "Enrolled tab → Add/Remove students",
    },
    {
      title: "Track Progress",
      description: "Enrolled tab → Select student → View performance",
    },
  ];

  const teacherFeatures = [
    {
      title: "Student List Management",
      description: [
        "View all enrolled students for each class or subject",
        "Add or remove students as needed",
        "Update student information and status",
      ],
    },
    {
      title: "Progress Tracking & Analytics",
      description: [
        "Monitor attendance, grades, and participation",
        "Identify students who may need additional support",
        "Generate reports for academic performance",
      ],
    },
    {
      title: "Communication & Announcements",
      description: [
        "Send announcements and updates to all enrolled students",
        "Communicate individually for feedback or concerns",
        "Share resources and important dates",
      ],
    },
  ];

  const teacherTips = [
    "Keep student lists updated for accurate records",
    "Use analytics to identify students needing support",
    "Communicate regularly to keep everyone informed",
  ];

  const teacherIssues = [
    "Trouble updating lists? Check your internet connection",
    "Missing students? Refresh or re-sync data",
    "Communication issues? Use the platform's messaging tools",
  ];

  const filteredStudentQuickActions = studentQuickActions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentFeatures = studentFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentTips = studentTips.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentIssues = studentIssues.filter((issue) =>
    issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherQuickActions = teacherQuickActions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherFeatures = teacherFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherTips = teacherTips.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeacherIssues = teacherIssues.filter((issue) =>
    issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Learn how to view and manage enrolled subjects in Polycon, track
                academic progress, and access important subject information.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b border-gray-200"
            id="quick_actions_enrolled"
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
          <div className="p-4 sm:p-6 lg:p-8" id="enrolled_features">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Enrolled Subjects Features
            </h2>
            {filteredStudentFeatures.length > 0 ? (
              <div className="space-y-6">
                {filteredStudentFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
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
            id="tips_troubleshooting_enrolled"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-[#057DCD] mb-2">💡 Helpful Tips</h3>
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
                <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Common Issues</h3>
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
              Managing Enrolled Students
            </h1>
            <div className="bg-blue-50 border-l-4 border-[#00A3FF] p-4 rounded-r-md">
              <p className="text-gray-700 text-sm sm:text-base">
                This guide explains how to view, manage, and support enrolled
                students in Polycon, including best practices for tracking
                progress and communicating important information.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-4 sm:p-6 lg:p-8 border-b border-[#54BEFF]"
            id="quick_actions_enrolled_teacher"
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
          <div className="p-4 sm:p-6 lg:p-8" id="enrolled_features_teacher">
            <h2 className="text-xl font-semibold text-[#057DCD] mb-6">
              Enrolled Student Management Features
            </h2>
            {filteredTeacherFeatures.length > 0 ? (
              <div className="space-y-6">
                {filteredTeacherFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                  >
                    <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
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
            id="tips_troubleshooting_enrolled_teacher"
          >
            <h2 className="text-lg font-semibold text-[#057DCD] mb-4">
              Tips & Troubleshooting
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-[#00A3FF] mb-2">💡 Best Practices</h3>
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
                <h3 className="font-medium text-[#00A3FF] mb-2">⚠️ Common Issues</h3>
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

export default Help_Enrolled_Student;