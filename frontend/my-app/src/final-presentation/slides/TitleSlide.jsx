import React from "react";
import { motion } from "framer-motion";

const TitleSlide = () => {
  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]">
      {/* Floating Background Elements - Scale with viewport */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10vh] left-[5vw] w-[5vw] h-[5vw] min-w-[40px] min-h-[40px] max-w-[80px] max-h-[80px] bg-blue-400 rounded-full opacity-20"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10vh] right-[5vw] w-[8vw] h-[8vw] min-w-[60px] min-h-[60px] max-w-[120px] max-h-[120px] bg-blue-300 rounded-full opacity-15"
      />
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 right-[25vw] w-[4vw] h-[4vw] min-w-[30px] min-h-[30px] max-w-[60px] max-h-[60px] bg-blue-200 rounded-full opacity-25"
      />

      {/* Safe zone padding for navigation controls */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <div className="w-full h-full max-w-[95vw] max-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-[2vh] lg:gap-[3vw] items-center">
          {/* Left Side - Icon Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-start order-2 lg:order-1"
          >
            <div className="relative">
              {/* White Circle - Responsive sizing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, type: "spring" }}
                className="w-[30vw] h-[30vw] min-w-[200px] min-h-[200px] max-w-[400px] max-h-[400px] aspect-square bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden p-[2vw]"
              >
                {/* Logo */}
                <motion.img
                  src="/polycon-icon.png"
                  alt="POLYCON Logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white space-y-[2vh] order-1 lg:order-2"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.1]"
            >
              POLYCON
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-[clamp(1rem,2.5vw,2rem)] font-light text-blue-100 leading-[1.3]"
            >
              A CROSS-PLATFORM CONSULTATION SYSTEM WITH DESCRIPTIVE ANALYSIS
              AND AI-DRIVEN TRANSCRIPTION
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="pt-[1vh] space-y-[1vh]"
            >
              <h3 className="text-[clamp(1.125rem,2vw,1.5rem)] font-bold">
                Proponents
              </h3>
              <ul className="space-y-[0.5vh] text-[clamp(0.875rem,1.5vw,1.25rem)] text-blue-100">
                <li>David Paul C. Desuyo</li>
                <li>Kurt Zhynkent R. Canja</li>
                <li>Clark Jim A. Gabiota</li>
                <li>Kyrell O. Santillan</li>
              </ul>
              <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-blue-200 pt-[1vh]">
                STI West Negros University
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TitleSlide;

