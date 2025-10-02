import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const faqData = [
  {
    question: "How do I book a consultation?",
    answer:
      "To book a consultation, go to the 'Consultation Booking' section, select your preferred faculty and a suitable time slot, and then confirm your booking. You will receive a notification once your booking is successful.",
  },
  {
    question: "I forgot my password. What should I do?",
    answer:
      "If you forget your password, simply click the 'Forgot Password' link on the login page. Enter your institutional email address and follow the instructions sent to your inbox to reset your password.",
  },
  {
    question: "Why am I not receiving email notifications?",
    answer:
      "Please check your spam or junk folder first. Also, ensure that your email address is correctly entered in your user profile. If the issue persists, contact POLYCON support for assistance.",
  },
  {
    question: "Can I reschedule or cancel a booking?",
    answer:
      "Yes, you can manage your bookings. Navigate to the 'Appointments' section, select the booking you wish to change, and choose the 'Reschedule' or 'Cancel' option. Please be aware that certain cancellation policies may apply.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "You can update your personal information by going to the 'Dashboard' and clicking on 'Profile'. From there, you can edit your details and change your password as needed.",
  },
  {
    question: "Who do I contact for technical issues?",
    answer:
      "For any technical issues, please use the 'Contact Support' page to reach out to our team via email, phone, or Messenger. We are ready to assist you.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { searchQuery } = useContext(HelpContext);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const filteredFaqs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto bg-white rounded-xl shadow-md border border-blue-100 p-8 mb-12"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0056a6] mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-gray-700 mb-6">
        Find answers to common questions about using POLYCON. If you need more help, please contact support.
      </p>
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50"
                onClick={() => toggleFAQ(idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="font-medium text-[#0056a6]">
                  {item.question}
                </span>
                <span className="text-sm text-gray-500 hover:underline">
                  {openIndex === idx ? "Hide Answer" : "Show Answer"}
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-4 pb-4 pt-4 text-gray-700 text-sm bg-blue-50 rounded-b-lg border-t border-gray-200">
                  {item.answer}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-lg py-8">
            No results found for "{searchQuery}".
          </p>
        )}
      </div>
      <div className="mt-8 text-xs text-gray-500 text-center">
        Still have questions?{" "}
        <a href="/help/support/contact" className="text-[#0056a6] hover:text-[#0078e7] underline transition-colors duration-200">
          Contact Support
        </a>
      </div>
    </motion.div>
  );
};

export default FAQ;