import React from "react";
import { motion } from "framer-motion";

const ProgressIndicator = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94]"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ProgressIndicator;

