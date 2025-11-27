import React from "react";
import { motion } from "framer-motion";

const ThankYouSlide = () => {
  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]">
      {/* Floating Background Elements */}
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

      {/* Safe zone padding for navigation controls */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <div className="w-full h-full max-w-[95vw] max-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-[2vh] lg:gap-[3vw] items-center">
          {/* Left Side - Logos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-[3vh] order-2 lg:order-1"
          >
            {/* POLYCON Logo Circle */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, type: "spring" }}
                className="w-[25vw] h-[25vw] min-w-[180px] min-h-[180px] max-w-[300px] max-h-[300px] aspect-square bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden p-[2vw]"
              >
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
            {/* STI Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="w-[20vw] h-[20vw] min-w-[150px] min-h-[150px] max-w-[250px] max-h-[250px] flex items-center justify-center"
            >
              <img
                src="/sti-logo.png"
                alt="STI Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Right Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white space-y-[2vh] order-1 lg:order-2 text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-[clamp(3rem,6vw,5rem)] font-bold"
            >
              THANK YOU
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-[2vh]"
            >
              <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-blue-100">
                POLYCON: A Cross-Platform Consultation System with Descriptive
                Analysis and AI-Driven Transcription
              </h2>
              <p className="text-[clamp(1.125rem,2vw,1.75rem)] text-blue-200">
                Presented By: David Paul Desuyo
              </p>
              <p className="text-[clamp(1rem,1.8vw,1.5rem)] text-blue-200">
                November 2025
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouSlide;

