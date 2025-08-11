import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Help_Main_Content = () => {
  const location = useLocation();
  const [onThisPageLinks, setOnThisPageLinks] = useState([]);
  const [activeSection, setActiveSection] = useState("");

  const sidebarActive = (to) =>
  location.pathname === to
    ? "text-[#057DCD] bg-blue-50 font-md border-[#057DCD]"
    : "text-gray-600 hover:text-[#057DCD] hover:bg-blue-50 border-transparent";

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[id]");
      const scrollPosition = window.scrollY + 100; // Offset for better detection

      for (const section of sections) {
        if (
          section.offsetTop <= scrollPosition &&
          section.offsetTop + section.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.getAttribute("id"));
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const links = [];
    // Getting Started section links
    if (location.pathname === "/help/getstarted/") {
      links.push(
        {
          label: "Quickstart",
          href: "#quickstart",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Features",
          href: "#overview_features",
          className: "text-gray-600 hover:text-[#057DCD]",
        }
      );
    }
    if (location.pathname === "/help/getstarted/Info_Login") {
      links.push(
        {
          label: "Login Steps",
          href: "#login_steps",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Troubleshooting",
          href: "#trouble_shooting",
          className: "text-gray-600 hover:text-[#057DCD]",
        }
      );
    }

    if (location.pathname === "/help/getstarted/Info_Signup") {
      links.push(
        {
          label: "Registration Steps",
          href: "#registration_steps",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Email Verification",
          href: "#email_verification",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Account Activation",
          href: "#account_activation",
          className: "text-gray-600 hover:text-[#057DCD]",
        }
      );
    }

    // Info pages section links
    const infoPages = {
      Info_Bookings: ["#booking_features", "#tips_section_bookings"],
      Info_History: ["#history_features", "#tips_section_history"],
      Info_Appointments: [
        "#appointment_features",
        "#tips_section_appointments",
      ],
      Info_Student_Dashboard: [
        "#dashboard_features",
        "#tips_section_dashboard",
      ],
    };

    const currentPage = location.pathname.split("/").pop();
    if (infoPages[currentPage]) {
      links.push(
        {
          label: "Features",
          href: infoPages[currentPage][0],
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Tips",
          href: infoPages[currentPage][1],
          className: "text-gray-600 hover:text-[#057DCD]",
        }
      );
    }

    // Student Features section links
    const studentFeatures = {
      Info_Consultation_Booking: [
        { label: "Booking Steps", href: "#booking_steps" },
        { label: "Tips & Guidelines", href: "#tips_guidelines_booking" },
      ],
      Info_Calendar_Management: [
        { label: "Calendar Features", href: "#calendar_features" },
        {
          label: "Tips & Troubleshooting",
          href: "#tips_troubleshooting_calendar",
        },
      ],
      Info_Notifications: [
        { label: "Notification Types", href: "#notification_types" },
        { label: "Tips & Settings", href: "#tips_settings" },
      ],
    };

    if (studentFeatures[currentPage]) {
      studentFeatures[currentPage].forEach((item, index) => {
        links.push({
          label: item.label,
          href: item.href,
          className:
            activeSection === item.href.substring(1)
              ? "text-[#057DCD]"
              : "text-gray-600",
        });
      });
    }

    setOnThisPageLinks(links);
  }, [location.pathname]);

  const handleLinkClick = (href) => {
    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-screen overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-8">
        <div className="flex max-w-[1440px] mx-auto">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0 mr-4">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Getting Started
                </h3>
                <nav className="space-y-2">
                  <Link
                    to="/help/getstarted/"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/")}`}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Login"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Login")}`}
                  >
                    Account Login
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Signup"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Signup")}`}
                  >
                    Account Registration
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Student_Dashboard"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Student_Dashboard")}`}
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/help/getstarted/Info_History"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_History")}`}
                  >
                    History
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Appointments"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Appointments")}`}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Bookings"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Bookings")}`}
                  >
                    Booking Consultations
                  </Link>
                </nav>

                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 mt-8">
                  Student Features
                </h3>
                <nav className="space-y-2">
                  <Link
                    to="/help/studentfeatures/Info_Consultation_Booking"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Consultation_Booking")}`}
                  >
                    Consultation Booking
                  </Link>
                  <Link
                    to="/help/studentfeatures/Info_Calendar_Management"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Calendar_Management")}`}
                  >
                    Calendar Management
                  </Link>
                  <Link
                    to="/help/studentfeatures/Info_Notifications"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Info_Notifications")}`}
                  >
                    Notifications
                  </Link>
                </nav>

                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 mt-8">
                  Support
                </h3>
                <nav className="space-y-2">
                  <Link
                    to="/help/support/FAQ"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/FAQ")}`}
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/help/getstarted/Contact"
                    className={`block px-3 py-1 text-sm rounded-md transition-colors ${sidebarActive("/help/getstarted/Contact")}`}
                  >
                    Contact Support
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <Outlet />
          </div>
          {!(
            location.pathname.toLowerCase().includes("/faq") ||
            location.pathname.toLowerCase().includes("/contact")
          ) && (
            <div className="hidden lg:block ml-4 w-64 flex-shrink-0">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    On this page
                  </h4>
                  <nav className="space-y-1">
                    {onThisPageLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(link.href);
                        }}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          link.href.substring(1) === activeSection
                            ? "text-[#057DCD] bg-blue-50 font-medium"
                            : "text-gray-600 hover:text-[#057DCD] hover:bg-blue-50"
                        }`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Help_Main_Content;
