import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Polycon_Analysis = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
  }, []);

  const keyMetrics = [
    {
      title: "Grade Comparison",
      description:
        "Compare student grades before and after consultation sessions.",
    },
    {
      title: "Improvement Tracking",
      description: "Track student grade improvement across different periods.",
    },
    {
      title: "Class Overview",
      description:
        "View overall class performance and improvement statistics.",
    },
    {
      title: "Consultation Effectiveness",
      description: "Measure the impact of consultations on student performance.",
    },
  ];

  const analysisFeatures = [
    {
      title: "Simple Grade Comparison",
      description: [
        "Compare student grades before and after consultation sessions",
        "Visual bar charts showing grade progression",
        "Clear before/after grade display with improvement metrics",
      ],
    },
    {
      title: "Period-Based Analysis",
      description: [
        "Select consultation period (Prelim, Midterm, Pre-Finals, Finals)",
        "Automatic comparison to the next period",
        "Track improvement across different academic terms",
      ],
    },
    {
      title: "Class Performance Overview",
      description: [
        "View overall class improvement statistics",
        "See percentage of students who improved",
        "Average improvement points across all students",
      ],
    },
  ];

  const tipsAndBestPractices = [
    {
      title: "Making the Most of Analysis",
      description: [
        "Review dashboards regularly to stay informed about student progress",
        "Use trend analysis to identify students who may need additional support",
        "Export reports for meetings with students, parents, or administrators",
      ],
    },
    {
      title: "Troubleshooting",
      description: [
        "Data not updating? Try refreshing the page or check your filters",
        "Trouble exporting? Ensure pop-ups are enabled in your browser",
        "For further assistance, contact support through the Help section",
      ],
    },
  ];

  const filteredKeyMetrics = keyMetrics.filter(
    (metric) =>
      metric.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnalysisFeatures = analysisFeatures.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTipsAndBestPractices = tipsAndBestPractices.filter((tip) =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="polycon_analysis"
      className="flex-1"
    >
      { isTeacher && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Header section */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">
              Help Guide
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Grade Improvement Analysis
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              Grade Improvement Analysis provides simple, clear comparisons of student performance before and after consultation sessions. 
              Track grade improvements across different academic periods and view overall class performance statistics.
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Key Metrics
          </h2>
          {filteredKeyMetrics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredKeyMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium text-gray-900">{metric.title}</h3>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No key metrics found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Analysis Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="analysis_features">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Analysis Features
          </h2>
          {filteredAnalysisFeatures.length > 0 ? (
            <div className="space-y-6">
              {filteredAnalysisFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <div className="pl-2">
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
              <p>No analysis features found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Tips & Best Practices */}
        <div
          className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200"
          id="tips_analysis"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tips & Best Practices
          </h2>
          {filteredTipsAndBestPractices.length > 0 ? (
            <div className="space-y-4">
              {filteredTipsAndBestPractices.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium text-[#057DCD] mb-2">
                    {tip.title}
                  </h3>
                  <ul className="list-disc text-sm text-gray-600 space-y-2 ml-5">
                    {tip.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No tips and best practices found for "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
      )}
    </motion.div>
  );
};

export default Help_Polycon_Analysis;