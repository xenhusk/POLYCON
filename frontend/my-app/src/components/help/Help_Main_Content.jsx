import React, { useState, useEffect, useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpContext, HelpProvider } from "../../components/help/HelpContext";

const Help_Main_Content = () => {
  const location = useLocation();
  const [onThisPageLinks, setOnThisPageLinks] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [isTeacher, setIsTeacher] = React.useState(false);
  const [isStudent, setIsStudent] = React.useState(false);
  const { searchQuery, setSearchQuery } = useContext(HelpContext);

  // Define Primary Color for consistent use
  const PRIMARY_COLOR = "#057DCD";

  // Function to determine link styling based on active route
  const sidebarActive = (to) =>
    location.pathname === to
      ? `text-[${PRIMARY_COLOR}] bg-blue-100 font-semibold border-l-4 border-[${PRIMARY_COLOR}]`
      : `text-gray-700 hover:text-[${PRIMARY_COLOR}] hover:bg-blue-50 transition-all duration-200 border-l-4 border-transparent`;

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
    if (location.pathname === "/help/getstarted/Info_Teacher_Consultation_Schedules") {
      links.push(
        {
          label: "Features",
          href: "#consultation-schedule-features",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Tips",
          href: "#consultation-schedule-tips",
          className: "text-gray-600 hover:text-[#057DCD]",
        }
      );
    }
    if (location.pathname === "/help/getstarted/Info_Teacher_Leaderboard") {
      links.push(
        {
          label: "Features",
          href: "#leaderboard-features",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Tips",
          href: "#leaderboard-tips",
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
          href: "#troubleshooting",
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
          href: "#email-verification",
          className: "text-gray-600 hover:text-[#057DCD]",
        },
        {
          label: "Account Activation",
          href: "#account_activation",
          className: "text-gray-600 hover:text-[#057DCD]",
        }
      );
    }

    // GetStart Features section links
    const infoPages = {
      Info_Grade: ["#grade_features", "#tips_troubleshooting_grade"],
      Info_History: ["#history_features", "#tips_section_history"],
      Info_Set_Schedule: [
        "#schedule_features",
        "#tips_troubleshooting_schedule",
      ],
      Info_Appointments: [
        "#appointment_features",
        "#tips_section_appointments",
      ],
      Info_Dashboard: ["#dashboard_features", "#tips_section_dashboard"],
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

    // Features section links
    const Features = {
      Info_Polycon_Analysis: [
        { label: "Analysis Features", href: "#analysis_features" },
        { label: "Tips & Troubleshooting", href: "#tips_analysis" },
      ],
      Info_Concern_Analysis: [
        { label: "Concern Features", href: "#concern_analysis_features" },
        { label: "Tips & Troubleshooting", href: "#tips_concern_analysis" },
      ],
      Info_Consultation_Booking: [
        { label: "Booking Steps", href: "#booking_steps" },
        { label: "Tips & Guidelines", href: "#tips_guidelines_booking" },
      ],
      Info_Enrolled_Student: [
        { label: "Enrolled Features", href: "#enrolled_features" },
        {
          label: "Tips & Troubleshooting",
          href: "#tips_troubleshooting_enrolled",
        },
      ],
      Info_Calendar_Management: [
        { label: "Calendar Features", href: "#Info_Calendar_Management" },
        {
          label: "Tips & Troubleshooting",
          href: "#tips_section_bookings",
        },
      ],
      Info_Notifications: [
        { label: "Notification Types", href: "#notification_types" },
        { label: "Tips & Settings", href: "#tips_settings" },
      ],
    };

    if (Features[currentPage]) {
      Features[currentPage].forEach((item, index) => {
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

  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsTeacher(userRole === "faculty");
    setIsStudent(userRole === "student");
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-screen overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-6">
        <div className="flex max-w-[1440px] mx-auto">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0 mr-4">
            <div className="fixed top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-64 h-[42rem] overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Getting Started
                </h3>
                <nav className="space-y-2">
                  <Link
                    to="/help/getstarted/"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/getstarted/"
                    )}`}
                  >
                    Overview
                  </Link>
                  {!isTeacher && !isStudent && (
                      <>
                        <Link
                          to="/help/getstarted/Info_Teacher_Consultation_Schedules"
                          className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                            "/help/getstarted/Info_Teacher_Consultation_Schedules"
                          )}`}
                        >
                          Teacher Consultation Schedules
                        </Link>
                        <Link
                          to="/help/getstarted/Info_Teacher_Leaderboard"
                          className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                            "/help/getstarted/Info_Teacher_Leaderboard"
                          )}`}
                        >
                          Teacher Leaderboard
                        </Link>
                        <Link
                          to="/help/getstarted/Info_Login"
                          className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                            "/help/getstarted/Info_Login"
                          )}`}
                        >
                          Account Login
                        </Link>
                        <Link
                          to="/help/getstarted/Info_Signup"
                          className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                            "/help/getstarted/Info_Signup"
                          )}`}
                        >
                          Account Registration
                        </Link>
                      </>
                    )}
                  <Link
                    to="/help/getstarted/Info_Dashboard"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/getstarted/Info_Dashboard"
                    )}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Appointments"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/getstarted/Info_Appointments"
                    )}`}
                  >
                    Appointments
                  </Link>
                  {isTeacher && (
                    <Link
                      to="/help/getstarted/Info_Set_Schedule"
                      className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                        "/help/getstarted/Info_Set_Schedule"
                      )}`}
                    >
                      Schedule
                    </Link>
                  )}
                  <Link
                    to="/help/getstarted/Info_History"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/getstarted/Info_History"
                    )}`}
                  >
                    History
                  </Link>
                  <Link
                    to="/help/getstarted/Info_Grade"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/getstarted/Info_Grade"
                    )}`}
                  >
                    Grade
                  </Link>
                </nav>

                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 mt-8">
                  Features
                </h3>
                <nav className="space-y-2">
                  {isTeacher && (
                    <>
                      <Link
                        to="/help/features/Info_Polycon_Analysis"
                        className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                          "/help/features/Info_Polycon_Analysis"
                        )}`}
                      >
                        Polycon Analysis
                      </Link>
                      <Link
                        to="/help/features/Info_Concern_Analysis"
                        className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                          "/help/features/Info_Concern_Analysis"
                        )}`}
                      >
                        Concern Analysis
                      </Link>
                    </>
                  )}
                  <Link
                    to="/help/features/Info_Consultation_Booking"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/features/Info_Consultation_Booking"
                    )}`}
                  >
                    Consultation Booking
                  </Link>
                  {isTeacher && (
                    <Link
                      to="/help/features/Info_Enrolled_Student"
                      className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                        "/help/features/Info_Enrolled_Student"
                      )}`}
                    >
                      Enrolled Students
                    </Link>
                  )}
                  <Link
                    to="/help/features/Info_Calendar_Management"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/features/Info_Calendar_Management"
                    )}`}
                  >
                    Calendar Management
                  </Link>
                  <Link
                    to="/help/features/Info_Notifications"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/features/Info_Notifications"
                    )}`}
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
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/support/FAQ"
                    )}`}
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/help/support/Contact"
                    className={`block px-3 py-1 text-sm rounded-md ${sidebarActive(
                      "/help/support/Contact"
                    )}`}
                  >
                    Contact Support
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search help articles..."
                className={`w-full px-4 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent`}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Outlet />
          </motion.div>
          {!(
            location.pathname.toLowerCase().includes("/faq") ||
            location.pathname.toLowerCase().includes("/contact")
          ) && (
            <div className="hidden lg:block ml-4 w-64 flex-shrink-0">
              <div className="sticky top-6">
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
                        className={`block px-3 py-2 text-sm rounded-md transition-all duration-200 border-l-4 ${
                          link.href.substring(1) === activeSection
                            ? `text-[${PRIMARY_COLOR}] bg-blue-100 font-medium border-[${PRIMARY_COLOR}]`
                            : `text-gray-600 hover:text-[${PRIMARY_COLOR}] hover:bg-blue-50 border-transparent`
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

export default () => (
  <HelpProvider>
    <Help_Main_Content />
  </HelpProvider>
);
