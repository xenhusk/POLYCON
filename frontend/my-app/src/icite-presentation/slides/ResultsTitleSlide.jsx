import React from "react";
import { motion } from "framer-motion";

const ResultsTitleSlide = () => {
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
            RESULTS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-700 leading-[1.6]"
          >
            The Post-Study System Usability Questionnaire (PSSUQ) provided
            critical insights into user satisfaction.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex-1 flex flex-col justify-center space-y-[2vh]"
        >
          <div className="bg-blue-50 rounded-2xl p-[2vw] space-y-[1.5vh]">
            <h2 className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-gray-800">
              Crucial Point: Scoring
            </h2>
            <div className="space-y-[0.5vh] text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-700">
              <p>
                <span className="font-bold">1 = "Strongly Agree"</span>{" "}
                (Excellent/Highly Satisfied)
              </p>
              <p>
                <span className="font-bold">7 = "Strongly Disagree"</span>{" "}
                (Poor)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-[2vw] space-y-[1.5vh]">
            <h2 className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-gray-800">
              Dimensions Measured
            </h2>
            <ul className="space-y-[0.5vh] text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-700">
              <li>• System Usefulness (SYSUSE)</li>
              <li>• Information Quality (INFOQUAL)</li>
              <li>• Interface Quality (INTERQUAL)</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsTitleSlide;

