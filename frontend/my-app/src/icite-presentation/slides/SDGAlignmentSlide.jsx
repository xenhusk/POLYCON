import React from "react";
import { motion } from "framer-motion";

const SDGAlignmentSlide = () => {
  const contributions = [
    {
      title: "Enhanced Student Support",
      description:
        "By streamlining access to faculty consultations, the system ensures students receive timely guidance and mentorship, directly supporting academic success and retention.",
    },
    {
      title: "Optimized Instructional Time",
      description:
        "Reducing the administrative burden of manual scheduling and documentation allows faculty to devote more quality time to teaching and student development.",
    },
    {
      title: "Data-Driven Educational Improvements",
      description:
        "The Descriptive and Concern Analytics provide institutional leaders with insights into student struggles, enabling data-informed interventions to improve the overall quality of education.",
    },
  ];

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[95vw] max-h-[90vh] flex flex-col justify-start px-[clamp(50px,7vw,90px)] py-[clamp(40px,5vh,60px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-[1.2vh] w-full"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(1.75rem,3.5vw,3rem)] font-bold text-gray-800 mb-[0.8vh]"
          >
            Alignment with UN Sustainable Development Goals
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-[1.2vh]"
          >
            <div className="bg-gradient-to-r from-[#057DCD] to-[#034a94] rounded-lg p-[1.5vw] shadow-md">
              <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-white mb-[0.4vh]">
                Primary Goal: SDG 4 - Quality Education
              </h2>
              <p className="text-[clamp(0.8rem,1.2vw,1rem)] text-blue-50 leading-[1.4]">
                Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-[0.8vh]"
          >
            <h3 className="text-[clamp(1rem,1.8vw,1.35rem)] font-bold text-gray-800">
              How POLYCON Contributes:
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-[1.2vw] flex-1"
          >
            {contributions.map((contribution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 + index * 0.1 }}
                className="flex flex-col bg-blue-50 rounded-xl p-[1.5vw] border-l-4 border-[#057DCD] shadow-sm h-full"
              >
                {/* Bullet Point */}
                <div className="flex items-center gap-[1vw] mb-[0.6vh]">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex-shrink-0 w-[clamp(28px,2.8vw,40px)] h-[clamp(28px,2.8vw,40px)] bg-gradient-to-br from-[#057DCD] to-[#034a94] rounded-full flex items-center justify-center shadow-md"
                  >
                    <span className="text-white font-bold text-[clamp(0.8rem,1.4vw,1.1rem)]">
                      {index + 1}
                    </span>
                  </motion.div>
                  <h3 className="text-[clamp(0.95rem,1.6vw,1.35rem)] font-bold text-gray-800">
                    {contribution.title}
                  </h3>
                </div>

                {/* Content */}
                <p className="text-[clamp(0.7rem,1.1vw,0.95rem)] text-gray-600 leading-[1.4] flex-1">
                  {contribution.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SDGAlignmentSlide;

