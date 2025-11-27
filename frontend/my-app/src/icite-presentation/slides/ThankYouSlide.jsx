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
        <div className="w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col items-center justify-center space-y-[3vh]">
          {/* Logos - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-[4vw]"
          >
            {/* STI Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-[20vw] h-auto min-w-[160px] max-w-[280px] flex items-center justify-center"
            >
              <motion.img
                src={`${process.env.PUBLIC_URL || ''}/sti-logo.png`}
                alt="STI Logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  if (e.target.src !== '/sti-logo.png') {
                    e.target.src = '/sti-logo.png';
                  } else {
                    e.target.style.display = 'none';
                  }
                }}
              />
            </motion.div>
            {/* POLYCON Logo Circle */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8, type: "spring" }}
                className="w-[20vw] h-[20vw] min-w-[150px] min-h-[150px] max-w-[250px] max-h-[250px] aspect-square bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden p-[1.5vw]"
              >
                <motion.img
                  src="/polycon-icon.png"
                  alt="POLYCON Logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-[clamp(3rem,6vw,5rem)] font-bold text-white text-center"
          >
            THANK YOU
          </motion.h1>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="space-y-[2vh] text-center"
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
        </div>
      </div>
    </div>
  );
};

export default ThankYouSlide;

