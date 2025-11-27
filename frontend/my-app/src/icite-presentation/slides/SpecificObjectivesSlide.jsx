import React from "react";
import { motion } from "framer-motion";

const SpecificObjectivesSlide = () => {
  const objectives = [
    {
      title: "Optimized Scheduling",
      description:
        "Develop a scheduling system that aligns with faculty availability for seamless appointments.",
    },
    {
      title: "AI-Powered Documentation",
      description:
        "Integrate AI-driven transcription and summarization capabilities for all consultation sessions, ensuring comprehensive and automated records.",
    },
    {
      title: "Role-Based User Interfaces",
      description:
        "Create intuitive and tailored user interfaces for students, faculty, and administrators, optimizing their specific interactions with the system.",
    },
    {
      title: "Performance Tracking & Insights",
      description:
        "Implement robust mechanisms to track key performance metrics and provide data-driven insights through descriptive analysis for continuous service improvement.",
    },
  ];

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[95vw] max-h-[90vh] flex flex-col justify-center px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-[2vh]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-gray-800 mb-[1.5vh]"
          >
            Specific Objectives
          </motion.h1>

          <div className="space-y-[1.5vh] max-h-[60vh] overflow-y-auto pr-[1vw] scrollbar-thin scrollbar-thumb-[#057DCD] scrollbar-track-gray-100">
            {objectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-[1.5vw]"
              >
                {/* Number Badge */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex-shrink-0 w-[clamp(40px,4vw,60px)] h-[clamp(40px,4vw,60px)] bg-blue-200 rounded-xl flex items-center justify-center shadow-md"
                >
                  <span className="text-[clamp(1.125rem,2vw,1.75rem)] font-bold text-gray-800">
                    {index + 1}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[clamp(1rem,1.8vw,1.5rem)] font-bold text-gray-800 mb-[0.5vh]">
                    {objective.title}
                  </h3>
                  <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-600 leading-[1.5]">
                    {objective.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpecificObjectivesSlide;

