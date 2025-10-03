import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Help_Concern_Analysis = () => {
  const { searchQuery } = useContext(HelpContext);
  const [isTeacher, setIsTeacher] = React.useState(false);

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
  }, []);

  const keyMetrics = [
    {
      title: "Grade Distribution",
      description: "View the distribution of grades across subjects.",
    },
    {
      title: "Attendance Rate",
      description: "Track student attendance over time.",
    },
    {
      title: "Participation Level",
      description: "Measure student engagement in class activities.",
    },
  ];

  const analysisFeatures = [
    {
      title: "Visual Performance Dashboards",
      description:
        "Interactive charts for grades, attendance, and participation. Compare performance across subjects and terms.",
    },
    {
      title: "Trend Analysis",
      description:
        "Track academic progress over time with trend lines. Spot patterns in attendance, grades, and engagement.",
    },
    {
      title: "Custom Reports & Export",
      description:
        "Generate detailed reports for academic records and attendance. Export data for further analysis or sharing.",
    },
  ];

  const tips = [
    "Review dashboards regularly to stay informed about progress.",
    "Use trend analysis to set goals and monitor improvements.",
    "Export reports for meetings, reviews, or personal records.",
    "Data not updating? Try refreshing the page or check your filters.",
    "Trouble exporting? Ensure pop-ups are enabled in your browser.",
    "For further assistance, contact support through the Help section.",
  ];

  const filteredMetrics = keyMetrics.filter(
    (metric) =>
      metric.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeatures = analysisFeatures.filter(
    (feature) =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTips = tips.filter((tip) =>
    tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="polycon_analysis"
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
            Polycon Analysis Overview
          </h1>
          <div className="bg-blue-50 border-l-4 border-[#057DCD] p-4 rounded-r-md">
            <p className="text-gray-700 text-sm sm:text-base">
              Polycon Analysis provides insights and visualizations to help track
              academic performance, identify trends, and support data-driven
              decisions for continuous improvement.
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Key Metrics
          </h2>
          {filteredMetrics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric, index) => (
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
              <p>No metrics found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Analysis Features */}
        <div className="p-4 sm:p-6 lg:p-8" id="analysis_features">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Analysis Features
          </h2>
          {filteredFeatures.length > 0 ? (
            <div className="space-y-6">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <div className="pl-2">
                    <p className="text-gray-600 text-sm">{feature.description}</p>
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

        {/* Tips & Best Practices */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_analysis">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tips & Best Practices
          </h2>
          {filteredTips.length > 0 ? (
            <div className="space-y-4">
              {filteredTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <p className="text-sm text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No tips found for "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Help_Concern_Analysis;