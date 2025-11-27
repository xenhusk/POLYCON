import React from "react";
import { motion } from "framer-motion";

const MethodologyTitleSlide = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94] flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[90vw] max-h-[90vh] flex flex-col justify-center px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-[3vh] text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white mb-[2vh]"
          >
            Methodology
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(1.125rem,2.5vw,2rem)] text-blue-100 leading-[1.6]"
          >
            The research and development of POLYCON rigorously followed the
            Agile Development Methodology.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default MethodologyTitleSlide;

