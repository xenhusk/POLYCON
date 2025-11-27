import React from "react";
import { motion } from "framer-motion";

const ConclusionSlide = () => {
  const findings = [
    {
      title: "Usability",
      description:
        "Users strongly agreed the system is simple, easy to learn, and efficient.",
    },
    {
      title: "Information",
      description:
        "High satisfaction with the clarity of error messages and on-screen documentation.",
    },
    {
      title: "Design",
      description:
        "Interface quality received the highest rating, confirming a successful user-centric, cross-platform approach.",
    },
  ];

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94] flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[95vw] max-h-[90vh] flex flex-col justify-center space-y-[2vh] px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-[1.5vh]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white"
          >
            CONCLUSION AND KEY FINDINGS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-blue-100 leading-[1.6] max-w-[85vw]"
          >
            Users and experts alike praised POLYCON's design, usability, and
            effectiveness.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-[1.5vh] flex-1 flex flex-col justify-center mt-[2vh]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5vw]">
            {findings.map((finding, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-[2vw] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-center"
              >
                <h3 className="text-[clamp(1.125rem,2vw,1.75rem)] font-bold text-gray-800 mb-[1vh]">
                  {finding.title}
                </h3>
                <p className="text-[clamp(0.875rem,1.3vw,1.125rem)] text-gray-600 leading-[1.5]">
                  {finding.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConclusionSlide;

