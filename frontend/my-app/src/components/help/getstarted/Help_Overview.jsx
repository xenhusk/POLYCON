import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const Overview = () => {
  const { searchQuery } = useContext(HelpContext);

  const quickstartItems = [
    {
      title: "Access your dashboard",
      description:
        "Learn how to navigate your personalized student dashboard with our guide.",
      link: "#dashboard",
      linkLabel: "View dashboard guide →",
    },
    {
      title: "Book consultations",
      description:
        "Learn how to book consultation sessions with faculty members.",
      link: "#bookings",
      linkLabel: "Start booking →",
    },
    {
      title: "Manage appointments",
      description: "Learn how to view and manage your upcoming appointments.",
      link: "#appointments",
      linkLabel: "Manage appointments →",
    },
    {
      title: "View history",
      description:
        "Get started quickly with our step-by-step documentation.",
      link: "#history",
      linkLabel: "View history guide →",
    },
  ];

  const features = [
    {
      title: "Dashboard",
      description:
        "Modules for managing your academic journey with personalized insights and calendar integration.",
    },
    {
      title: "Consultation Booking",
      description:
        "Advanced booking system for scheduling consultations with faculty and group sessions.",
    },
    {
      title: "Academic History",
      description:
        "Comprehensive tracking of your consultation history and academic progress over time.",
    },
  ];

  const filteredQuickstartItems = quickstartItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeatures = features.filter(
    (feature) =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="Overview"
      className="flex-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
        {/* Hero section */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-[#057DCD] font-medium">
              Getting started
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Polycon System Documentation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Build with our comprehensive student consultation platform
          </p>
        </div>

        {/* Feature highlight */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-2/3">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Consultation platform
              </h2>
              <p className="text-base sm:text-lg opacity-90 mb-4">
                Your academic success depends on effective communication. Make
                sure you build connections with the best support system.
              </p>
            </div>
          </div>
        </div>

        {/* Quickstart section */}
        <div className="p-4 sm:p-6 lg:p-8" id="quickstart">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Quickstart
          </h2>
          {filteredQuickstartItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredQuickstartItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    {item.description}
                  </p>
                  <a
                    href={item.link}
                    className="text-[#057DCD] text-sm sm:text-base font-medium hover:underline"
                  >
                    {item.linkLabel}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No quickstart items found for "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Features section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50" id="overview_features">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Features
          </h2>
          {filteredFeatures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200"
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-8">
              <p>No features found for "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;