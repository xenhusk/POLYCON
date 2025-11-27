import React from "react";
import { motion } from "framer-motion";

const SlideNavigation = ({ currentSlide, totalSlides, onGoToSlide }) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onGoToSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#057DCD] scale-125 shadow-lg"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideNavigation;

