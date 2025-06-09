import React, { useState } from "react";
import { motion } from "framer-motion";

const ComparativeAcademicEvents = ({
  allFieldsProvided,
  academicEventName,
  setAcademicEventName,
  academicEventRating,
  setAcademicEventRating,
  addAcademicEvent,
  removeAcademicEvent,
  academicEvents,
}) => {
  const [ratingError, setRatingError] = useState("");

  const handleRatingChange = (e) => {
    const value = e.target.value;
    setAcademicEventRating(value);
    if (value === "" || (Number(value) >= 1 && Number(value) <= 5)) {
      setRatingError("");
    } else {
      setRatingError("Rating must be between 1 and 5");
    }
  };

  const handleAddEvent = () => {
    if (academicEventRating === "" || Number(academicEventRating) < 1 || Number(academicEventRating) > 5) {
      setRatingError("Rating must be between 1 and 5");
      return;
    }
    setRatingError("");
    addAcademicEvent();
  };

  return (
    <>
      {allFieldsProvided && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <h3 className="text-2xl font-bold text-[#0065A8] flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Academic Events
            </h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
            whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Input Section */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={academicEventName}
                      onChange={(e) => setAcademicEventName(e.target.value)}
                      placeholder="Enter academic event name"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:bg-white transition-all duration-200 placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={academicEventRating}
                        onChange={handleRatingChange}
                        placeholder="1-5"
                        className={`w-28 px-4 py-3.5 bg-gray-50 border ${ratingError ? "border-red-400" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:bg-white transition-all duration-200 placeholder-gray-400`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleAddEvent}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3.5 bg-[#0065A8] text-white rounded-lg hover:bg-[#54BEFF] transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Add Event</span>
                    </motion.button>
                  </div>
                  {ratingError && (
                    <p className="text-xs text-red-500 mt-1">{ratingError}</p>
                  )}
                </div>
              </div>

              {/* Events List */}
              {academicEvents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#0065A8]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Added Events ({academicEvents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {academicEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative">
                          {/* Event Header */}
                          <div className="mb-4 pr-8">
                            <h4 className="font-semibold text-lg text-gray-800 line-clamp-2">
                              {event.name}
                            </h4>
                          </div>

                          {/* Delete Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeAcademicEvent(index)}
                            className="absolute right-0 top-0 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </motion.button>

                          {/* Rating Section */}
                          <div
                            className={`mt-4 rounded-xl ${
                              parseInt(event.rating) === 5
                                ? "bg-green-50"
                                : parseInt(event.rating) === 4
                                ? "bg-teal-50"
                                : parseInt(event.rating) === 3
                                ? "bg-blue-50"
                                : parseInt(event.rating) === 2
                                ? "bg-yellow-50"
                                : "bg-red-50"
                            }`}
                          >
                            {/* Rating Badge */}
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">
                                Rating
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                                  parseInt(event.rating) === 5
                                    ? "bg-gradient-to-r from-green-500 to-green-400"
                                    : parseInt(event.rating) === 4
                                    ? "bg-gradient-to-r from-[#00D1B2] to-[#00B4B4]"
                                    : parseInt(event.rating) === 3
                                    ? "bg-gradient-to-r from-blue-500 to-blue-400"
                                    : parseInt(event.rating) === 2
                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                    : "bg-gradient-to-r from-red-500 to-red-400"
                                }`}
                              >
                                {event.rating}/5
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="px-4 pb-3">
                              <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(parseInt(event.rating) / 5) * 100}%`,
                                  }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`absolute h-full rounded-full ${
                                    parseInt(event.rating) === 5
                                      ? "bg-gradient-to-r from-green-500 to-green-400"
                                      : parseInt(event.rating) === 4
                                      ? "bg-gradient-to-r from-[#00D1B2] to-[#00B4B4]"
                                      : parseInt(event.rating) === 3
                                      ? "bg-gradient-to-r from-blue-500 to-blue-400"
                                      : parseInt(event.rating) === 2
                                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                      : "bg-gradient-to-r from-red-500 to-red-400"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {academicEvents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    No academic events added yet
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Add events to include them in your analysis
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ComparativeAcademicEvents;
