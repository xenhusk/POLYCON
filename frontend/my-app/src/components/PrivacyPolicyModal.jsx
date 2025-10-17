import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  // Prevent rendering if not open
  if (!isOpen) return null;

  // Static content to be rendered inside the modal
  const policyContent = (
    <div className="space-y-6 text-gray-700">
      <p className="text-sm italic">
        Effective Date: October 7, 2025
      </p>
      <p>
        This Privacy Policy explains how <strong>Develorant Team</strong> ("we," "us," or "our") collects, uses, shares, and protects information in connection with your use of the Polycon web application (the "Service").
      </p>

      {/* --- Section 1 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">1. Information We Collect</h3>
      <p>
        We collect information directly from you when you use the Service, as well as automatically as you navigate the platform.
      </p>

      <h4 className="font-semibold text-gray-800">A. Information You Provide</h4>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>
          <strong>Account Information:</strong> Your name, email address, role (Student, Faculty), password (hashed), and <strong>Student ID/Faculty ID</strong> (required for verification and internal school system integration).
        </li>
        <li>
          <strong>Consultation Data:</strong> Details you provide when booking or scheduling appointments, including the subject/purpose of the consultation, time slots, and <strong>optional attached documents</strong> (e.g., homework, forms).
        </li>
        <li>
          <strong>Communication Data:</strong> Records of communications with us, such as support requests or feedback sent to us or through the application.
        </li>
      </ul>

      <h4 className="font-semibold text-gray-800">B. Automatically Collected Information</h4>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>
          <strong>Usage Data:</strong> Information about how you use the platform, such as pages viewed, features accessed, and the time and duration of your activity. This helps us understand feature popularity and workflow.
        </li>
        <li>
          <strong>Technical Data:</strong> Internet Protocol (IP) address, browser type and version, operating system, and unique device identifiers. This is used for security and troubleshooting.
        </li>
        <li>
          <strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to track activity on our Service and hold certain information. (See Section 6).
        </li>
      </ul>

      {/* --- Section 2 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">2. How We Use Your Information</h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>
          <strong>To Run Our Service:</strong> We use your data to power the core features, manage your account, and make sure appointments are processed correctly.
        </li>
        <li>
          <strong>To Make Polycon Better:</strong> We watch how people use the platform to spot areas for improvement, troubleshoot issues, and enhance features, which often involves reviewing data in a generalized or anonymous way.
        </li>
        <li>
          <strong>Communication:</strong> We send you necessary emails, confirmations, reminders, and updates about your appointments or service changes.
        </li>
        <li>
          <strong>Security:</strong> We use data to detect, prevent, and protect against fraud, abuse, and technical issues.
        </li>
        <li>
          <strong>Legal Compliance:</strong> We use data when necessary to meet our legal duties and handle any disputes.
        </li>
      </ul>

      {/* --- Section 3 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">3. Sharing Your Information</h3>
      <p>
        <strong>We will never sell your personal data.</strong> We only share your information in a few specific situations:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>
          <strong>With Other Users (Internal):</strong> Faculty schedules and names are visible to students for booking. Student booking details (name and consultation topic) are shared with the faculty member to prepare for the meeting.
        </li>
        <li>
          <strong>Service Providers:</strong> We work with trusted third parties (like hosting and database companies) to help us run the service. These partners are <strong>required by contract to protect the data</strong> and only use it for the specific task we define.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may have to disclose information if legally compelled by a court order or subpoena, or if we genuinely believe it’s needed to protect Polycon, our users, or the public.
        </li>
        <li>
          <strong>Business Transfers:</strong> If Polycon is bought or merged with another company, your data may be transferred as part of the business assets.
        </li>
      </ul>

      {/* --- Section 4 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">4. Data Security</h3>
      <p>
        We take <strong>common-sense technical and organizational security steps</strong> to protect the personal information we handle. This includes <strong>hashing passwords</strong> (encryption) and securing data transmissions with <strong>SSL/TLS</strong>. While we work hard to protect your data, please remember that no system on the internet is 100% secure.
      </p>

      {/* --- Section 5 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">5. Data Retention</h3>
      <p>
        We keep your personal information as long as your account is <strong>active</strong> or as long as necessary to provide the Service. If you delete your account, we will remove your personal data within **[30 days]**, unless we are legally required to keep some records for audit or compliance reasons. We will keep aggregated, anonymous usage data indefinitely for our analytics.
      </p>

      {/* --- Section 6 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">6. Cookies and Tracking Technologies</h3>
      <p>
        We use cookies, which are small files stored on your device, to:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>
          <strong>Authentication:</strong> Maintain your login session and track your authentication status.
        </li>
        <li>
          <strong>Preferences:</strong> Remember user preferences.
        </li>
      </ul>
      <p>
        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you choose to refuse essential cookies, you may not be able to use certain authenticated portions of our Service.
      </p>

      {/* --- Section 7 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">7. Your Privacy Rights</h3>
      <p>
        Depending on your location (e.g., if you are in the EU or California), you may have the following rights regarding your personal data:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>
          <strong>Right of Access:</strong> The right to request copies of your personal data we hold.
        </li>
        <li>
          <strong>Right to Rectification:</strong> The right to request that we correct any information you believe is inaccurate or incomplete.
        </li>
        <li>
          <strong>Right to Erasure ("Right to be Forgotten"):</strong> The right to request that we erase your personal data under certain conditions.
        </li>
        <li>
          <strong>Account Modification:</strong> You can update or correct your account information directly in the <strong>Profile Settings area</strong>.
        </li>
        <li>
          <strong>Account Deletion:</strong> If you wish to terminate your account, please send an email request to the contact address below.
        </li>
      </ul>

      {/* --- Section 8 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">8. Changes to This Privacy Policy</h3>
      <p>
        We may update our Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of this policy. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      {/* --- Section 9 --- */}
      <h3 className="text-xl font-semibold text-gray-900 pt-2 border-t mt-4">9. Contact Us</h3>
      <p>
        If you have any questions about this Privacy Policy, please contact the Develorant Team:
      </p>
      <p className="font-medium">
        <strong>By Email:</strong> <a href="mailto:Develorant@gmail.com" className="text-[#057DCD] hover:text-blue-700 underline">Develorant@gmail.com</a>
      </p>
    </div>
  );

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose} // Close on backdrop click
        >
          <motion.div
            key="privacy-modal"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" 
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#057DCD] p-5 flex justify-between items-center z-10 shadow-md">
              <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-white hover:bg-white/20 transition-colors focus:outline-none"
                aria-label="Close Privacy Policy"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {policyContent}
            </div>

            {/* Modal Footer (Optional: You can add a static "I understand" button here) */}
             <div className="sticky bottom-0 bg-white border-t p-4 text-right">
                <button
                    onClick={onClose}
                    className="bg-[#057DCD] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                    Close
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPolicyModal;