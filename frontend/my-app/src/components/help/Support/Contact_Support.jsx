import React from "react";
import { motion } from "framer-motion";

const Contact_Support = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto bg-white rounded-xl shadow-md border border-blue-100 p-8 mb-12"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0056a6] mb-2">
        Contact POLYCON Support
      </h1>
      <p className="text-gray-700 mb-6">
        Need help? Our support team is here for you. Choose your preferred
        contact method below or fill out the form and we’ll get back to you as
        soon as possible.
      </p>

      {/* Contact Options */}
      <div className="flex flex-col sm:flex-row justify-around items-center gap-4 mb-8 text-center sm:text-left">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-[#0056a6]">Email</span>
          <a
            href="mailto:polycon.support@wnu.sti.edu.ph"
            className="text-sm text-blue-700 hover:underline mt-1"
          >
            polycon.support@wnu.sti.edu.ph
          </a>
        </div>
        <div className="h-6 w-0.5 bg-gray-300 hidden sm:block"></div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-[#0056a6]">Phone</span>
          <span className="text-sm text-blue-700 mt-1">
            +63 912 345 6789
          </span>
        </div>
        <div className="h-6 w-0.5 bg-gray-300 hidden sm:block"></div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-[#0056a6]">Messenger</span>
          <a
            href="https://m.me/polycon.support"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 hover:underline mt-1"
          >
            m.me/polycon.support
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          alert(
            "Your message has been sent! Our support team will contact you soon."
          );
        }}
      >
        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="name"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0056a6] outline-none"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0056a6] outline-none"
            placeholder="your.email@wnu.sti.edu.ph"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="message"
          >
            Message
          </label>
          <textarea
            id="message"
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0056a6] outline-none"
            placeholder="How can we help you?"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#0056a6] to-[#00a3ff] text-white font-semibold py-2 rounded-md shadow hover:from-[#0078e7] hover:to-[#54beff] transition-all"
        >
          Send Message
        </button>
      </form>

      <div className="mt-8 text-xs text-gray-500 text-center">
        POLYCON Support is available Monday to Friday, 8:00 AM – 5:00 PM. For
        urgent concerns outside these hours, please use Messenger or email.
      </div>
    </motion.div>
  );
};

export default Contact_Support;