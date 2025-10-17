import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Added motion
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import { X } from "lucide-react";

const Terms_ConditionsModal = ({ isOpen, onClose }) => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Handles the Escape key for accessibility
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!isOpen) return null;

  // Variants for motion (using simple fade/scale for a quick transition)
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
        >
          {/* Modal content container */}
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-xl w-full relative transform transition-all flex flex-col max-h-[90vh]" // Added flex-col and max-h
          >
            {/* Header: Fixed background color for visual separation */}
            <div className="sticky top-0 bg-[#057DCD] p-5 rounded-t-xl flex justify-between items-center shadow-lg z-10">
              <h2 id="terms-modal-title" className="text-xl font-extrabold text-white">
                Terms and Conditions
              </h2>
              <button
                className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
                onClick={onClose}
                aria-label="Close Terms and Conditions modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-base text-gray-700">
              
              {/* Section 1 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  1. Introduction and Acceptance of Terms
                </h3>
                <p>
                  By creating an account and using Polycon, you agree to be bound by
                  these Terms and Conditions. If you do not agree with any part of
                  these terms, please do not use this service.
                </p>
              </div>
              
              {/* Section 2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  2. User Rights and Responsibilities
                </h3>
                <ul className="list-disc ml-5 space-y-2">
                  <li className="pl-1">
                    <span className="font-semibold text-gray-800">Acceptable Use:</span> Polycon is
                    intended for academic and personal use within the institution.
                    Use of the platform for commercial or unauthorized purposes is
                    prohibited.
                  </li>
                  <li className="pl-1">
                    <span className="font-semibold text-gray-800">Prohibited Activities:</span>{" "}
                    Users must not engage in illegal activities, harassment,
                    spamming, or infringe on intellectual property while using
                    Polycon.
                  </li>
                </ul>
              </div>
              
              {/* Section 3 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">3. Intellectual Property</h3>
                <p>
                  All content, branding, and intellectual property on Polycon,
                  including logos and design, are owned by the institution. By
                  submitting content, you grant Polycon a license to use, display,
                  and distribute your content as needed for platform functionality.
                </p>
              </div>
              
              {/* Section 4 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  4. Limitation of Liability and Disclaimers
                </h3>
                <p>
                  Polycon is provided "as-is" without warranties of any kind. The
                  institution is not liable for any damages or losses resulting from
                  use of the platform, including inaccuracies, interruptions, or
                  third-party content.
                </p>
              </div>
              
              {/* Section 5 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">5. Termination of Service</h3>
                <p>
                  Polycon reserves the right to suspend or terminate accounts at its
                  discretion, especially in cases of terms violations.
                </p>
              </div>
              
              {/* Section 6 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  6. Governing Law and Dispute Resolution
                </h3>
                <p>
                  These terms are governed by the laws of the institution's
                  jurisdiction. Disputes will be resolved according to institutional
                  procedures or as otherwise specified.
                </p>
              </div>
              
              {/* Section 7 - Privacy Policy Link */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">7. Privacy Policy</h3>
                <p>
                  Please review our{" "}
                  <button
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-[#057DCD] underline font-semibold hover:text-blue-700 transition-colors duration-200"
                  >
                    Privacy Policy
                  </button>
                  {" "}to understand how your data is collected, used, and protected.
                </p>
                
                {/* Nested Privacy Policy Modal */}
                <PrivacyPolicyModal
                  isOpen={isPrivacyModalOpen}
                  onClose={() => setIsPrivacyModalOpen(false)}
                />
              </div>
              
              {/* Section 8 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">8. Contact Information</h3>
                <p>
                  For questions or legal inquiries, contact us at{" "}
                  <a
                    href="mailto:polycon@wnu.sti.edu.ph"
                    className="text-[#057DCD] underline font-semibold hover:text-blue-700 transition-colors duration-200"
                  >
                    polycon@wnu.sti.edu.ph
                  </a>
                  .
                </p>
              </div>
              
              {/* Disclaimer */}
              <div className="text-sm text-gray-500 pt-4 border-t mt-4 text-center">
                This document is a summary. For full legal terms, please consult
                with the institution or a legal advisor.
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-200 text-right rounded-b-xl">
                <button
                    onClick={onClose}
                    className="bg-[#057DCD] text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                    Acknowledge & Close
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Terms_ConditionsModal;