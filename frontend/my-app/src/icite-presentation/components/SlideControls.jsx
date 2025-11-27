import React from "react";
import { motion } from "framer-motion";

const SlideControls = ({
  currentSlide,
  totalSlides,
  onNext,
  onPrev,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <>
      {/* Previous Button */}
      {currentSlide > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPrev}
          className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-full shadow-xl hover:bg-white transition-colors"
          aria-label="Previous slide"
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-[#057DCD]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>
      )}

      {/* Next Button */}
      {currentSlide < totalSlides - 1 && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-full shadow-xl hover:bg-white transition-colors"
          aria-label="Next slide"
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-[#057DCD]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      )}

      {/* Fullscreen Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleFullscreen}
        className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-full shadow-xl hover:bg-white transition-colors"
        aria-label="Toggle fullscreen"
      >
        {isFullscreen ? (
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-[#057DCD]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-[#057DCD]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        )}
      </motion.button>

      {/* Slide Counter */}
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
        <span className="text-sm sm:text-base font-semibold text-[#057DCD]">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>
    </>
  );
};

export default SlideControls;

