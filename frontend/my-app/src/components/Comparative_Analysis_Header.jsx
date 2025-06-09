import React from 'react';

const ComparativeAnalysisHeader = ({ openSelectionModal, allFieldsProvided }) => {
  return (
    <div className="mb-12 text-center max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[#0065A8] mb-4">
          Polycon Analysis
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] mx-auto rounded-full"></div>
      </div>

      <p className="text-gray-600 text-md mb-6 px-4">
        Welcome to the Polycon Analysis tool, your comprehensive solution for
        evaluating student performance and academic progress. This analysis
        combines grades, consultation records, and academic events to provide
        actionable insights.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 px-4">
        {/* Performance Tracking Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-[#0065A8] mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">Performance Tracking</h3>
          <p className="text-sm text-gray-500">
            Track academic progress across different periods
          </p>
        </div>

        {/* Consultation History Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-[#0065A8] mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">Consultation History</h3>
          <p className="text-sm text-gray-500">
            Review past consultations and their outcomes
          </p>
        </div>

        {/* Academic Events Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-[#0065A8] mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">Academic Events</h3>
          <p className="text-sm text-gray-500">
            Monitor participation and impact of events
          </p>
        </div>
      </div>

      {/* Analysis Button */}
      <div className="mb-8">
        <button
          onClick={openSelectionModal}
          className="group px-8 py-4 bg-[#0065A8] text-white rounded-xl hover:bg-[#54BEFF] transition-all transform hover:scale-105 duration-300 shadow-md hover:shadow-lg"
        >
          <span className="flex items-center justify-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-lg">Start Analysis</span>
          </span>
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Click to select semester, student, and course options
        </p>
      </div>

      {/* Empty State Message */}
      {!allFieldsProvided && (
        <div className="text-center text-gray-500 my-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-full mx-auto">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#0065A8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Ready to Begin Analysis?
          </h3>
          <p className="text-gray-600">
            Please select a semester, teacher, student, and course to generate
            a comprehensive performance analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparativeAnalysisHeader;