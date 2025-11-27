import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlideNavigation from "./components/SlideNavigation";
import SlideControls from "./components/SlideControls";
import ProgressIndicator from "./components/ProgressIndicator";
import TitleSlide from "./slides/TitleSlide";
import PresentationOverviewSlide from "./slides/PresentationOverviewSlide";
import IntroductionSlide from "./slides/IntroductionSlide";
import ResearchProblemSlide1 from "./slides/ResearchProblemSlide1";
import ResearchProblemSlide2 from "./slides/ResearchProblemSlide2";
import ResearchSolutionSlide from "./slides/ResearchSolutionSlide";
import GeneralObjectivesSlide from "./slides/GeneralObjectivesSlide";
import SpecificObjectivesSlide from "./slides/SpecificObjectivesSlide";
import LiteraryReviewSlide from "./slides/LiteraryReviewSlide";
import MethodologyTitleSlide from "./slides/MethodologyTitleSlide";
import MethodologyPhases1_3Slide from "./slides/MethodologyPhases1_3Slide";
import MethodologyPhases4_5Slide from "./slides/MethodologyPhases4_5Slide";
import MethodologyPhases6_7Slide from "./slides/MethodologyPhases6_7Slide";
import ResultsTitleSlide from "./slides/ResultsTitleSlide";
import ResultsPSSUQChartSlide from "./slides/ResultsPSSUQChartSlide";
import ResultsExpertEvaluationSlide from "./slides/ResultsExpertEvaluationSlide";
import ConclusionSlide from "./slides/ConclusionSlide";
import ThankYouSlide from "./slides/ThankYouSlide";

const slides = [
  { id: 0, component: TitleSlide },
  { id: 1, component: PresentationOverviewSlide },
  { id: 2, component: IntroductionSlide },
  { id: 3, component: ResearchProblemSlide1 },
  { id: 4, component: ResearchProblemSlide2 },
  { id: 5, component: ResearchSolutionSlide },
  { id: 6, component: GeneralObjectivesSlide },
  { id: 7, component: SpecificObjectivesSlide },
  { id: 8, component: LiteraryReviewSlide },
  { id: 9, component: MethodologyTitleSlide },
  { id: 10, component: MethodologyPhases1_3Slide },
  { id: 11, component: MethodologyPhases4_5Slide },
  { id: 12, component: MethodologyPhases6_7Slide },
  { id: 13, component: ResultsTitleSlide },
  { id: 14, component: ResultsExpertEvaluationSlide },
  { id: 15, component: ResultsPSSUQChartSlide },
  { id: 16, component: ConclusionSlide },
  { id: 17, component: ThankYouSlide },
];

const IcitePresentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = slides.length;

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < totalSlides) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  }, [currentSlide, totalSlides]);

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (currentSlide < totalSlides - 1) {
          goToSlide(currentSlide + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(totalSlides - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, totalSlides, goToSlide, toggleFullscreen]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Touch/swipe gestures
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.5 },
  };

  // Show placeholder if no slides
  if (totalSlides === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">ICITE Presentation</h1>
          <p className="text-xl text-gray-600">Slides will be added here</p>
        </div>
      </div>
    );
  }

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div
      className="w-screen h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress Indicator */}
      <ProgressIndicator current={currentSlide + 1} total={totalSlides} />

      {/* Slide Container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 w-full h-full"
          >
            <CurrentSlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <SlideControls
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onNext={nextSlide}
        onPrev={prevSlide}
        onGoToSlide={goToSlide}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Navigation Dots */}
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onGoToSlide={goToSlide}
      />
    </div>
  );
};

export default IcitePresentation;

