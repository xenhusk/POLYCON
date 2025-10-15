import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../apiConfig';

// Modal animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const FeedbackPopup = ({ 
  isOpen, 
  onClose, 
  consultationSessionId, 
  studentId, 
  teacherId, 
  onFeedbackSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    // Optional: Add hover effects if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultation_session_id: consultationSessionId,
          student_id: studentId,
          teacher_id: teacherId,
          rating: rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onFeedbackSubmitted && onFeedbackSubmitted(data);
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/20 mx-2 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                    Rate Your Consultation
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm truncate">
                    Help us improve our services
                  </p>
                </div>
              </div>
              <button 
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-2"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Rating Section */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700">
                    How would you rate this consultation?
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500">
                    💡 Tip: Click on stars to rate your consultation
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= rating;
                      const isHalfFilled = star - 0.5 <= rating && rating < star;
                      
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-3xl sm:text-4xl md:text-5xl transition-all duration-200 relative"
                          onClick={() => handleStarClick(star)}
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isHalfFilled ? (
                            <div className="relative w-full h-full">
                              {/* Base gray star */}
                              <span className="absolute inset-0 text-gray-300">★</span>
                              {/* Left half yellow overlay */}
                              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                <span className="text-yellow-400">★</span>
                              </div>
                            </div>
                          ) : (
                            <span className={isFilled ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                    {rating > 0 && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm sm:text-base text-gray-600 ml-3"
                      >
                        {rating % 1 === 0 ? rating : rating.toFixed(1)} star{rating !== 1 ? 's' : ''}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Comment Section */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="comment" className="block text-sm sm:text-base font-semibold text-gray-700">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about the consultation..."
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Thank you for your feedback! Your rating has been submitted.
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white rounded-xl font-medium hover:from-[#046bb8] hover:to-[#034a94] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    disabled={isSubmitting || rating === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackPopup;
