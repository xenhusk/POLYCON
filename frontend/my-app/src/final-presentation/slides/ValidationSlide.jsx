import React from "react";
import { motion } from "framer-motion";

const ValidationSlide = () => {
  return (
    <div className="w-screen h-screen bg-[#FAF8F3] flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[95vw] max-h-[90vh] flex flex-col justify-center space-y-[2vh] px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-gray-800 text-center mb-[2vh]"
        >
          Evaluation & Validation Results
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2vw] flex-1 items-center">
          {/* Technical System Evaluation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl p-[2vw] shadow-xl h-full flex flex-col justify-center"
          >
            <h2 className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-gray-800 mb-[1.5vh]">
              Technical System Evaluation (IT Experts)
            </h2>
            <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-600 mb-[1.5vh]">
              Evaluation using a{" "}
              <span className="font-semibold">
                3-point Likert Scale (1=Needs Improvement, 3=Good)
              </span>
            </p>
            <div className="text-center py-[1.5vh]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
                className="inline-block"
              >
                <span className="text-[clamp(3rem,8vw,6rem)] font-bold text-[#057DCD]">
                  2.65
                </span>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-[clamp(0.875rem,1.5vw,1.25rem)] font-semibold text-[#057DCD] text-center mt-[1.5vh]"
            >
              PASSED - System is technically robust and meets acceptable
              quality standards.
            </motion.p>
          </motion.div>

          {/* User Acceptance */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-2xl p-[2vw] shadow-xl h-full flex flex-col justify-center"
          >
            <h2 className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-gray-800 mb-[1.5vh]">
              User Acceptance (Dry Run/PSSUQ)
            </h2>
            <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-600 mb-[1.5vh]">
              Assessment using the{" "}
              <span className="font-semibold">
                Post-Study System Usability Questionnaire (PSSUQ) on a scale of
                1-7, where 1=Highly Satisfied
              </span>
            </p>
            <div className="text-center py-[1.5vh]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
                className="inline-block"
              >
                <span className="text-[clamp(3rem,8vw,6rem)] font-bold text-[#057DCD]">
                  1.31
                </span>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-[clamp(0.875rem,1.5vw,1.25rem)] font-semibold text-[#057DCD] text-center mt-[1.5vh]"
            >
              Users are extremely satisfied
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-[clamp(0.75rem,1.1vw,0.9375rem)] text-gray-600 text-center mt-[1vh]"
            >
              Users achieved satisfactory scores overall, reflecting positive
              system usability.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ValidationSlide;

