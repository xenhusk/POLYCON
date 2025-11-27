import React from "react";
import { motion } from "framer-motion";

const ResearchProblemSlide2 = () => {
  const problems = [
    {
      title: "Poor Resource Utilization",
      description:
        "Faculty time and institutional resources are underutilized due to disorganized and inefficient management practices.",
    },
    {
      title: "Lack of Actionable Insights",
      description:
        "Without digital records, consultation trends cannot be analyzed, making it impossible to identify areas for service improvement.",
    },
    {
      title: "Administrative Burden",
      description:
        "Manual processes create significant delays and errors, increasing the workload for administrative staff and making consultations hard to manage.",
    },
  ];

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
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
            className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-gray-800"
          >
            RESEARCH PROBLEM
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-700 leading-[1.6] max-w-[85vw]"
          >
            These systemic issues create a ripple effect, negatively impacting
            resource management and institutional effectiveness.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-[1.5vh] flex-1 flex flex-col justify-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5vw] mt-[2vh]">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-[2vw] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-center"
              >
                <h3 className="text-[clamp(1.125rem,2vw,1.75rem)] font-bold text-gray-800 mb-[1vh]">
                  {problem.title}
                </h3>
                <p className="text-[clamp(0.875rem,1.3vw,1.125rem)] text-gray-600 leading-[1.5]">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResearchProblemSlide2;

