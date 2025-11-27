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

      {/* STI Logo - Bottom Left Corner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute bottom-[3vh] left-[3vw] z-20 w-[10vw] h-auto min-w-[80px] max-w-[150px] flex items-center justify-center"
      >
        <motion.img
          src={`${process.env.PUBLIC_URL || ''}/sti-logo.png`}
          alt="STI Logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full h-auto object-contain"
          onError={(e) => {
            console.error("STI Logo failed to load. Trying alternative path...");
            if (e.target.src !== '/sti-logo.png') {
              e.target.src = '/sti-logo.png';
            } else {
              e.target.style.display = 'none';
            }
          }}
        />
      </motion.div>

      {/* Safe zone padding for navigation controls */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-[clamp(40px,5vw,80px)] py-[clamp(40px,5vh,70px)]">
        <div className="w-full h-full max-w-[95vw] max-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-[2vh] lg:gap-[2vw] items-center overflow-hidden">
          {/* Left Side - POLYCON Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center order-2 lg:order-1 h-full"
          >
            {/* POLYCON Logo Circle */}
            <div className="relative flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, type: "spring" }}
                className="w-[30vw] h-[30vw] min-w-[200px] min-h-[200px] max-w-[400px] max-h-[400px] aspect-square bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden p-[2vw]"
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
          </motion.div>

          {/* Right Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white space-y-[1.5vh] order-1 lg:order-2 h-full flex flex-col justify-center overflow-hidden"
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-[clamp(1.5rem,4vw,3.5rem)] font-bold leading-[1.15]"
            >
              POLYCON: A Cross-Platform Consultation System with Descriptive Analysis and AI-Driven Transcription
            </motion.h1>

            {/* Authors */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="pt-[1vh] space-y-[0.75vh]"
            >
              <h3 className="text-[clamp(1rem,1.8vw,1.4rem)] font-bold text-blue-100">
                Authors
              </h3>
              <div className="flex flex-wrap gap-x-[1.5vw] gap-y-[0.5vh]">
                <p className="text-[clamp(0.75rem,1.3vw,1.1rem)] text-blue-100">
                  David Paul C. Desuyo
                </p>
                <span className="text-blue-100">|</span>
                <p className="text-[clamp(0.75rem,1.3vw,1.1rem)] text-blue-100">
                  Kurt Zhynkent R. Canja
                </p>
                <span className="text-blue-100">|</span>
                <p className="text-[clamp(0.75rem,1.3vw,1.1rem)] text-blue-100">
                  Clark Jim A. Gabiota
                </p>
                <span className="text-blue-100">|</span>
                <p className="text-[clamp(0.75rem,1.3vw,1.1rem)] text-blue-100">
                  Kyrell O. Santillan
                </p>
                <span className="text-blue-100">|</span>
                <p className="text-[clamp(0.75rem,1.3vw,1.1rem)] text-blue-100">
                  Lynol I. Ibarra
                </p>
                <span className="text-blue-100">|</span>
                <p className="text-[clamp(0.75rem,1.3vw,1.1rem)] text-blue-100">
                  Orvilla V. Balangue
                </p>
              </div>
            </motion.div>

            {/* Affiliation */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-[clamp(0.75rem,1.2vw,1rem)] text-blue-200 pt-[0.5vh]"
            >
              STI West Negros University, Bacolod City, Negros Occidental Philippines
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TitleSlide;

