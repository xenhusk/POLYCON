import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DemonstrationSlide = () => {
  const features = [
    {
      number: "01",
      title: "Booking an Appointment",
      description:
        "Scheduling Feature - demonstrating the smart scheduling system with buffer time management.",
    },
    {
      number: "02",
      title: "AI Transcription and Documentation",
      description:
        "AI Summarization - showing how sessions are automatically transcribed and summarized.",
    },
    {
      number: "03",
      title: "Faculty Leaderboard & Analytics Dashboard",
      description:
        "Concern Analysis - displaying performance metrics and descriptive analytics.",
    },
    {
      number: "04",
      title: "Post-Consultation Review and Session History",
      description:
        "Documentation and tracking of all consultation sessions for future reference.",
    },
  ];

  const [activeFeature, setActiveFeature] = useState(0);
  const scrollContainerRef = useRef(null);
  const featureRefs = useRef([]);

  // Auto-scroll to active feature
  useEffect(() => {
    if (featureRefs.current[activeFeature] && scrollContainerRef.current) {
      const element = featureRefs.current[activeFeature];
      const container = scrollContainerRef.current;
      const elementTop = element.offsetTop - container.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [activeFeature]);

  // Keyboard navigation for features
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowDown" && activeFeature < features.length - 1) {
        e.preventDefault();
        setActiveFeature(activeFeature + 1);
      } else if (e.key === "ArrowUp" && activeFeature > 0) {
        e.preventDefault();
        setActiveFeature(activeFeature - 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [activeFeature, features.length]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
          {/* Left Side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center order-2 lg:order-1"
          >
            <div className="bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94] rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl w-full max-w-lg">
              {/* Mock Dashboard UI */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {/* Sidebar Mock */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-12 sm:w-16 bg-[#003d6b] rounded-xl p-2 sm:p-3 flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full"></div>
                    <div className="w-full h-1.5 sm:h-2 bg-white/30 rounded"></div>
                    <div className="w-full h-1.5 sm:h-2 bg-white/30 rounded"></div>
                    <div className="w-full h-1.5 sm:h-2 bg-white/30 rounded"></div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    {/* Calendar Grid */}
                    <div className="bg-blue-50 rounded-xl p-2 sm:p-4">
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day, i) => (
                            <div
                              key={i}
                              className="text-xs font-semibold text-gray-600 text-center"
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-6 sm:h-8 rounded ${
                              i % 3 === 0
                                ? "bg-[#057DCD]"
                                : "bg-gray-200"
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-blue-50 rounded-xl p-2 sm:p-3">
                        <div className="text-xs text-gray-600 mb-1">
                          Appointments
                        </div>
                        <div className="text-base sm:text-lg font-bold text-[#057DCD]">
                          58,900
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 sm:p-3">
                        <div className="text-xs text-gray-600 mb-1">Users</div>
                        <div className="text-base sm:text-lg font-bold text-[#057DCD]">
                          1,288
                        </div>
                      </div>
                    </div>

                    {/* Chart Mock */}
                    <div className="bg-blue-50 rounded-xl p-2 sm:p-4 h-24 sm:h-32 flex items-end gap-1 sm:gap-2">
                      {[40, 60, 45, 80, 55, 70, 65].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#057DCD] rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Interactive Feature List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 flex flex-col h-full max-h-[85vh]"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6"
            >
              System Demonstration
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-4 sm:mb-6"
            >
              The following features will be demonstrated in the live software
              demonstration:
            </motion.p>

            {/* Scrollable Feature Container */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-[#057DCD] scrollbar-track-gray-100"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#057DCD #f3f4f6",
              }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  ref={(el) => (featureRefs.current[index] = el)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                  onClick={() => setActiveFeature(index)}
                  className={`border-2 rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? "border-[#057DCD] bg-blue-50 shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <motion.span
                      className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                        activeFeature === index
                          ? "text-[#057DCD]"
                          : "text-gray-400"
                      }`}
                    >
                      {feature.number}
                    </motion.span>
                    <div className="flex-1">
                      <h3
                        className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 transition-colors duration-300 ${
                          activeFeature === index
                            ? "text-[#057DCD]"
                            : "text-gray-800"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Indicators */}
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                    activeFeature === index
                      ? "w-8 sm:w-12 bg-[#057DCD]"
                      : "w-2 sm:w-3 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>

            {/* Scroll Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-xs sm:text-sm text-gray-400 text-center mt-2 sm:mt-4"
            >
              Click on features or use ↑↓ keys to navigate
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DemonstrationSlide;
