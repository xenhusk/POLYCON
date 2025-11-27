import React from "react";
import { motion } from "framer-motion";

const PresentationOverviewSlide = () => {
  const sections = [
    {
      number: "01",
      title: "Introduction",
      description: "Setting the stage for POLYCON's purpose.",
    },
    {
      number: "02",
      title: "Methodology",
      description: "How POLYCON was developed and tested.",
    },
    {
      number: "03",
      title: "Results",
      description: "Key findings and outcomes of the system.",
    },
    {
      number: "04",
      title: "Discussion",
      description: "Analyzing the implications and insights.",
    },
    {
      number: "05",
      title: "Conclusion",
      description: "Summarizing the impact and future direction.",
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
          className="space-y-[3vh]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-gray-800 text-center mb-[2vh]"
          >
            PRESENTATION OVERVIEW
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[2vw] mt-[3vh]">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-[#057DCD] to-[#034a94] rounded-2xl p-[2vw] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-center"
              >
                <div className="text-[clamp(2rem,4vw,3rem)] font-bold text-white mb-[1vh]">
                  {section.number}
                </div>
                <h3 className="text-[clamp(1.125rem,2vw,1.75rem)] font-bold text-white mb-[1vh]">
                  {section.title}
                </h3>
                <p className="text-[clamp(0.875rem,1.3vw,1.125rem)] text-blue-100 leading-[1.5]">
                  {section.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PresentationOverviewSlide;

