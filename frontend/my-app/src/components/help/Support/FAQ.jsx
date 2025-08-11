import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqData = [
  {
    question: "How do I book a consultation?",
    answer:
      "Go to the 'Booking Consultations' section, select your preferred faculty and time slot, then confirm your booking. You will receive a notification once your booking is successful.",
  },
  {
    question: "I forgot my password. What should I do?",
    answer:
      "Click the 'Forgot Password' link on the login page. Enter your institutional email and follow the instructions sent to your inbox to reset your password.",
  },
  {
    question: "Why am I not receiving email notifications?",
    answer:
      "Check your spam or junk folder. Make sure your email address is correct in your profile. If the issue persists, contact POLYCON support.",
  },
  {
    question: "Can I reschedule or cancel a booking?",
    answer:
      "Yes, go to your 'Appointments' or 'History' section, select the booking, and choose the reschedule or cancel option. Please note cancellation policies may apply.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Navigate to your dashboard and click on 'Profile'. Here you can update your personal information and change your password.",
  },
  {
    question: "Who do I contact for technical issues?",
    answer:
      "Use the 'Contact Support' page to reach out via email, phone, or Messenger. Our support team is ready to assist you.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto bg-white rounded-xl shadow-md border border-blue-100 p-8 mb-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0056a6] mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-gray-700 mb-6">
        Find answers to common questions about using POLYCON. If you need more help, please contact support.
      </p>
      <div className="space-y-4">
        {faqData.map((item, idx) => (
          <div key={idx} className="border rounded-lg">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#0056a6] transition"
              onClick={() => toggleFAQ(idx)}
              aria-expanded={openIndex === idx}
            >
              <span className="font-medium text-[#0056a6]">{item.question}</span>
              {openIndex === idx ? (
                <FaChevronUp className="text-[#0056a6]" />
              ) : (
                <FaChevronDown className="text-[#0056a6]" />
              )}
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 text-gray-700 text-sm bg-blue-50 rounded-b-lg">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 text-xs text-gray-500 text-center">
        Still have questions? <a href="/help/support/contact" className="text-[#0056a6] underline">Contact Support</a>
      </div>
    </div>
  );
};

export default FAQ;