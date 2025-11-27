import React from "react";
import { motion } from "framer-motion";

const IntroductionSlide = () => {
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
            INTRODUCTION
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-[2vh] text-[clamp(1.125rem,2.5vw,2rem)] text-gray-700 leading-[1.6]"
          >
            <p>
              Faculty-student consultations are essential for academic success.
            </p>
            <p>
              Traditional methods often rely on manual processes, leading to
              significant inefficiencies that hinder effective mentorship and
              academic support within the institution.{" "}
              <span className="font-bold text-[#057DCD]">POLYCON</span> aims
              to modernize this critical interaction.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroductionSlide;

