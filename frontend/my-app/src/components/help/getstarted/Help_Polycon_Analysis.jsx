import React from "react";
import { motion } from "framer-motion";

const Help_Polycon_Analysis = () => (
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
            Polycon Analysis provides insights and visualizations to help track academic performance, identify trends, and support data-driven decisions for continuous improvement.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200" id="quick_actions">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Common Tasks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">📊</div>
            <div>
              <h3 className="font-medium text-gray-900">View Performance Charts</h3>
              <p className="text-sm text-gray-600">
                Dashboard → Analysis tab
              </p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">🔎</div>
            <div>
              <h3 className="font-medium text-gray-900">Explore Trends</h3>
              <p className="text-sm text-gray-600">
                Analysis tab → Select metric → View trend lines
              </p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="text-[#057DCD] text-xl mr-3">📥</div>
            <div>
              <h3 className="font-medium text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-600">
                Analysis tab → Export/Download
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="p-4 sm:p-6 lg:p-8" id="analysis_features">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Polycon Analysis Features
        </h2>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                1
              </span>
              Visual Performance Dashboards
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Interactive charts for grades, attendance, and participation</li>
                <li>Compare performance across subjects and terms</li>
                <li>Identify strengths and areas for improvement at a glance</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                2
              </span>
              Trend Analysis
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Track academic progress over time with trend lines</li>
                <li>Spot patterns in attendance, grades, and engagement</li>
                <li>Use filters to focus on specific subjects or periods</li>
              </ul>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <span className="bg-[#057DCD] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                3
              </span>
              Custom Reports & Export
            </h3>
            <div className="pl-8">
              <ul className="list-disc text-gray-600 space-y-2 text-sm">
                <li>Generate detailed reports for academic records and attendance</li>
                <li>Export data for further analysis or sharing</li>
                <li>Download charts and tables in various formats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200" id="tips_analysis">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tips & Best Practices
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-[#057DCD] mb-2">💡 Making the Most of Analysis</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Review dashboards regularly to stay informed about progress</li>
              <li>• Use trend analysis to set goals and monitor improvements</li>
              <li>• Export reports for meetings, reviews, or personal records</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-[#057DCD] mb-2">⚠️ Troubleshooting</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Data not updating? Try refreshing the page or check your filters</li>
              <li>• Trouble exporting? Ensure pop-ups are enabled in your browser</li>
              <li>• For further assistance, contact support through the Help section</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default Help_Polycon_Analysis;