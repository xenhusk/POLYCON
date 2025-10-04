import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showAddForm, setShowAddForm] = useState(false);

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
    if (!academicEventName.trim()) {
      setRatingError("Please enter an event name");
      return;
    }

    if (academicEventRating === "" || Number(academicEventRating) < 1 || Number(academicEventRating) > 5) {
      setRatingError("Rating must be between 1 and 5");
      return;
    }
    setRatingError("");
    addAcademicEvent();
    setShowAddForm(false);
    setAcademicEventName("");
    setAcademicEventRating("");
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setRatingError("");
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setRatingError("");
    setAcademicEventName("");
    setAcademicEventRating("");
  };

  return (
    <>
      {allFieldsProvided && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          {/* Enhanced Section Header */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#0065A8] to-transparent opacity-30"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="bg-white px-8 py-4 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
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
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0065A8]">Academic Events</h3>
                    <p className="text-sm text-gray-600">Track student participation and impact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
              {/* Events List with Add Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">
                    Academic Events ({academicEvents.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Add Event Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-[#0065A8]/5 to-[#54BEFF]/5 p-6 rounded-2xl border-2 border-dashed border-[#0065A8]/30 hover:border-[#0065A8]/50 transition-all duration-300 cursor-pointer group"
                    onClick={handleOpenAddForm}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-[#0065A8] mb-2">
                        Add New Event
                      </h4>
                      <p className="text-sm text-gray-600">
                        Click to add a new academic event
                      </p>
                    </div>
                  </motion.div>
                    {academicEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                      >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#0065A8]/5 to-[#54BEFF]/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                        
                        <div className="relative">
                          {/* Event Header */}
                          <div className="mb-6 pr-10">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-800 line-clamp-2 mb-1">
                                  {event.name}
                                </h4>
                                <p className="text-sm text-gray-500">Academic Event</p>
                              </div>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeAcademicEvent(index)}
                            className="absolute right-2 top-2 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
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

                          {/* Enhanced Rating Section */}
                          <div
                            className={`rounded-2xl border-2 ${
                              parseInt(event.rating) === 5
                                ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                                : parseInt(event.rating) === 4
                                ? "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200"
                                : parseInt(event.rating) === 3
                                ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                                : parseInt(event.rating) === 2
                                ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
                                : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                            }`}
                          >
                            {/* Rating Badge */}
                            <div className="px-5 py-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  parseInt(event.rating) === 5
                                    ? "bg-gradient-to-r from-green-500 to-green-600"
                                    : parseInt(event.rating) === 4
                                    ? "bg-gradient-to-r from-[#00D1B2] to-[#00B4B4]"
                                    : parseInt(event.rating) === 3
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                    : parseInt(event.rating) === 2
                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                    : "bg-gradient-to-r from-red-500 to-red-600"
                                }`}>
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                  Impact Rating
                                </span>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm ${
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
                            <div className="px-5 pb-4">
                              <div className="relative h-3 bg-white/60 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(parseInt(event.rating) / 5) * 100}%`,
                                  }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className={`absolute h-full rounded-full shadow-sm ${
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

              {/* Enhanced Empty State */}
              {academicEvents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white"
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
                  </div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">
                    No academic events added yet
                  </h4>
                  <p className="text-gray-500 text-base mb-6">
                    Add events to include them in your improvement analysis
                  </p>
                  <motion.button
                    onClick={handleOpenAddForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#0065A8] to-[#54BEFF] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
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
                    Add Your First Event
                  </motion.button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Events help track student engagement and learning impact</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Event Popup Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseAddForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#0065A8]">Add New Event</h3>
                <motion.button
                  onClick={handleCloseAddForm}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Event Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={academicEventName}
                    onChange={(e) => setAcademicEventName(e.target.value)}
                    placeholder="Enter academic event name"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 placeholder-gray-400"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#00D1B2] to-[#00B4B4] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={academicEventRating}
                    onChange={handleRatingChange}
                    placeholder="1-5"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 ${ratingError ? "border-red-400" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 placeholder-gray-400`}
                  />
                  {ratingError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-2 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {ratingError}
                    </motion.p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={handleCloseAddForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleAddEvent}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
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
                    Add Event
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ComparativeAcademicEvents;
