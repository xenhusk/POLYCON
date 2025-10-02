import React, { useEffect } from "react";

const TermsModal = ({ open, onClose }) => {
  // Add a useEffect hook to handle the Escape key for accessibility
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

  if (!open) return null;

  return (
    // Backdrop for the modal, which also handles closing when clicked
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Modal content container */}
      <div
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full m-4 p-6 relative transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
      >
        {/* Close button with SVG icon for better accessibility and style */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors duration-200"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
        </button>
        <h2 className="text-xl font-bold text-[#057DCD] mb-4 text-center">
          Terms and Conditions
        </h2>
        <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <h3 className="font-semibold mb-1">
              1. Introduction and Acceptance of Terms
            </h3>
            <p>
              By creating an account and using Polycon, you agree to be bound
              by these Terms and Conditions. If you do not agree with any part
              of these terms, please do not use this service.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              2. User Rights and Responsibilities
            </h3>
            <ul className="list-disc ml-5">
              <li>
                <span className="font-medium">Acceptable Use:</span> Polycon
                is intended for academic and personal use within the
                institution. Use of the platform for commercial or unauthorized
                purposes is prohibited.
              </li>
              <li>
                <span className="font-medium">Prohibited Activities:</span>{" "}
                Users must not engage in illegal activities, harassment,
                spamming, or infringe on intellectual property while using
                Polycon.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">3. Intellectual Property</h3>
            <p>
              All content, branding, and intellectual property on Polycon,
              including logos and design, are owned by the institution. By
              submitting content, you grant Polycon a license to use, display,
              and distribute your content as needed for platform functionality.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              4. Limitation of Liability and Disclaimers
            </h3>
            <p>
              Polycon is provided "as-is" without warranties of any kind. The
              institution is not liable for any damages or losses resulting from
              use of the platform, including inaccuracies, interruptions, or
              third-party content.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">5. Termination of Service</h3>
            <p>
              Polycon reserves the right to suspend or terminate accounts at its
              discretion, especially in cases of terms violations.
            </p>
          </div>
          {/* <div>
            <h3 className="font-semibold mb-1">6. Payment and Billing</h3>
            <p>
              If Polycon offers paid services, payment terms, billing cycles,
              and refund policies will be clearly stated. For any transactions,
              please review the relevant policies.
            </p>
          </div> */}
          <div>
            <h3 className="font-semibold mb-1">
              6. Governing Law and Dispute Resolution
            </h3>
            <p>
              These terms are governed by the laws of the institution's
              jurisdiction. Disputes will be resolved according to institutional
              procedures or as otherwise specified.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">7. Privacy Policy</h3>
            <p>
              Please review our{" "}
              <a href="/privacy-policy" className="text-[#057DCD] underline">
                Privacy Policy
              </a>{" "}
              to understand how your data is collected, used, and protected.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">8. Contact Information</h3>
            <p>
              For questions or legal inquiries, contact us at{" "}
              <a
                href="Develorant@gmail.com"
                className="text-[#057DCD] underline"
              >
                Develorant@gmail.com
              </a>
              .
            </p>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            This document is a summary. For full legal terms, please consult
            with the institution or a legal advisor.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
