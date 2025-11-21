import React from "react";
import { motion } from "framer-motion";

const AbstractSlide = () => {
  return (
    <div className="w-screen h-screen bg-[#FAF8F3] flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[90vw] max-h-[90vh] flex flex-col justify-center px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
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
            className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-gray-800 mb-[2vh]"
          >
            Abstract
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-[2vh] text-[clamp(1rem,2vw,1.5rem)] text-gray-700 leading-[1.6]"
          >
            <p>
              Traditional consultation methods face challenges including
              scheduling conflicts and inconsistent documentation.
            </p>
            <p>
              POLYCON integrates{" "}
              <span className="font-bold text-[#057DCD]">
                AI-driven transcription
              </span>{" "}
              and{" "}
              <span className="font-bold text-[#057DCD]">
                Descriptive Analytics
              </span>{" "}
              to enhance efficiency.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AbstractSlide;

