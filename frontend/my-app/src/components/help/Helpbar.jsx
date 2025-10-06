import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { X } from "lucide-react"; // Using 'X' instead of unimported 'FaTimes'
import logo from "../../components/icons/logo2.png";
import Help_Main_Content from "./Help_Main_Content";

// --- Constants & Configuration (Best Practice: put custom colors in Tailwind config) ---
const PRIMARY_COLOR_CLASS = "text-[#057DCD]";
const ACTIVE_BG_CLASS = "bg-blue-100";
const ACTIVE_BORDER_CLASS = "border-[#057DCD]";

// --- Sub-Components for Modularity ---

// Component for the dynamic sidebar links
const SidebarLinkGroup = ({ title, links, setIsMenuOpen, locationPathname }) => (
  <>
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
      {title}
    </h3>
    <div className="space-y-2 mb-6">
      {links.map((link) => {
        if (link.condition === false) return null; // Skip if condition is false

        const isActive = locationPathname === link.to;
        const baseClasses = "block text-sm p-2 rounded-md transition-colors";
        const linkClasses = isActive
          ? `font-semibold ${PRIMARY_COLOR_CLASS} ${ACTIVE_BG_CLASS} border-l-4 ${ACTIVE_BORDER_CLASS}`
          : "text-gray-700 hover:text-[#0056a6] hover:bg-blue-50 border-l-4 border-transparent";

        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setIsMenuOpen(false)}
            className={`${baseClasses} ${linkClasses}`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  </>
);


// Mobile Menu Panel Component
const MobileMenuPanel = ({ 
    isMenuOpen, 
    setIsMenuOpen, 
    isTeacher, 
    isStudent, 
    buttonlink, 
    buttontext, 
    navigate,
    locationPathname
}) => {
    
    // Define all menu links here based on role state
    const linkGroups = useMemo(() => [
        {
            title: "Getting Started",
            links: [
                { to: "/help/getstarted/", label: "Overview", condition: true },
                { 
                    to: "/help/getstarted/Info_Login", 
                    label: "Account Login", 
                    condition: !isTeacher || isStudent 
                },
                { 
                    to: "/help/getstarted/Info_Signup", 
                    label: "Account Registration", 
                    condition: !isTeacher || isStudent 
                },
                { to: "/help/getstarted/Info_Dashboard", label: "Dashboard", condition: true },
                { to: "/help/getstarted/Info_Appointments", label: "Appointments", condition: true },
                { 
                    to: "/help/getstarted/Info_Set_Schedule", 
                    label: "Schedule", 
                    condition: isTeacher 
                },
                { to: "/help/getstarted/Info_History", label: "History", condition: true },
                { to: "/help/getstarted/Info_Grade", label: "Grade", condition: true },
            ]
        },
        {
            title: "Features",
            links: [
                { 
                    to: "/help/features/Info_Polycon_Analysis", 
                    label: "Polycon Analysis", 
                    condition: isTeacher 
                },
                { 
                    to: "/help/features/Info_Concern_Analysis", 
                    label: "Concern Analysis", 
                    condition: isTeacher 
                },
                { 
                    to: "/help/features/Info_Consultation_Booking", 
                    label: "Consultation Booking", 
                    condition: true 
                },
                { 
                    to: "/help/features/Info_Calendar_Management", 
                    label: "Calendar Management", 
                    condition: true 
                },
                // Note: The original code had two links to /help/features/Info_Calendar_Management.
                // I'm keeping the link path but changing the label for clarity based on role.
                { 
                    to: "/help/features/Info_Calendar_Management", 
                    label: "Enrolled Students", 
                    condition: isTeacher 
                }, 
                { 
                    to: "/help/features/Info_Notifications", 
                    label: "Notifications", 
                    condition: true 
                },
            ]
        },
        {
            title: "Support",
            links: [
                { to: "/help/support/FAQ", label: "FAQ", condition: true },
                { to: "/help/support/Contact", label: "Contact Support", condition: true },
            ]
        }
    ], [isTeacher, isStudent]); // Re-run if roles change

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: isMenuOpen ? 0 : "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex lg:hidden fixed right-0 top-0 h-full w-full md:w-80 max-w-full bg-white z-50 shadow-lg flex-col"
        >
            {/* Menu Header */}
            <div className="flex items-center justify-between py-5 px-6 border-b bg-gradient-to-r from-[#057DCD] to-[#00a3ff]">
                <button 
                    onClick={() => {navigate("/"); setIsMenuOpen(false);}} // Added close menu on logo click
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <img
                        src={logo}
                        alt="POLYCON Logo"
                        className="h-10 w-10 object-contain"
                    />
                    <span className="text-white font-bold text-lg">POLYCON</span>
                </button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none"
                >
                    <X className="w-6 h-6" /> {/* Use imported X icon */}
                </motion.button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <nav className="flex flex-col">
                    {linkGroups.map((group) => (
                        <SidebarLinkGroup
                            key={group.title}
                            title={group.title}
                            links={group.links}
                            setIsMenuOpen={setIsMenuOpen}
                            locationPathname={locationPathname}
                        />
                    ))}
                </nav>
            </div>

            {/* Menu Footer */}
            <div className="p-3 border-t border-gray-200 bg-white shadow-xl">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setIsMenuOpen(false);
                        navigate(buttonlink);
                    }}
                    className="bg-[#0056a6] text-white text-base w-full px-4 py-3 rounded-lg font-semibold
                                transition-all duration-200 hover:bg-[#0078e7] shadow-lg"
                >
                    {buttontext}
                </motion.button>
            </div>
        </motion.div>
    );
};

// --- Main Help Component ---

const Help = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [roles, setRoles] = useState({ isTeacher: false, isStudent: false, isLoggedIn: false });

  const { isTeacher, isStudent, isLoggedIn } = roles;

  // 1. Initial Load: Check roles and login status
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setRoles({
      isTeacher: role === "faculty",
      isStudent: role === "student",
      isLoggedIn: !!localStorage.getItem("token"), // Check if token exists
    });
  }, []);

  // 2. Side Effect: Handle body overflow when menu is open
  useEffect(() => {
    const body = document.body;
    const isMobileView = window.innerWidth < 1024;

    if (isMenuOpen && isMobileView) {
      body.style.overflow = "hidden";
      // This scrollbar compensation logic is complex and prone to errors.
      // A more robust solution is to use a modern UI library or CSS for modal/drawer.
      // Keeping it simple here to avoid complex DOM manipulation unless strictly necessary.
      
      // Removed complex scrollbar compensation. A simple overflow: hidden usually suffices.

    } else {
      body.style.overflow = "";
      body.style.paddingRight = ""; // Ensure padding is reset
    }

    // Cleanup function
    return () => {
      body.style.overflow = "";
      body.style.paddingRight = "";
    };
  }, [isMenuOpen]);

  // Use useMemo to prevent unnecessary recalculations on every render
  const { buttontext, buttonlink } = useMemo(() => ({
    buttontext: isLoggedIn ? "Dashboard" : "Sign In",
    buttonlink: isLoggedIn ? "/dashboard" : "/login",
  }), [isLoggedIn]);

  // Function to determine link styling based on active route (for future desktop sidebar)
  // Note: This function is currently UNUSED in the provided structure, as the Mobile Menu logic is handled internally.
  const sidebarActive = (to) =>
    location.pathname === to
      ? `text-[${PRIMARY_COLOR_CLASS}] ${ACTIVE_BG_CLASS} font-semibold border-l-4 ${ACTIVE_BORDER_CLASS}`
      : `text-gray-700 hover:text-[#057DCD] hover:bg-blue-50 transition-all duration-200 border-l-4 border-transparent`;


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header (Visible on all screens, but menu button is mobile-only) */}
      <div className="border-b bg-[#057DCD] shadow-lg relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Left: Logo */}
            <Link
              to="/"
              className="focus:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <img
                  src={logo}
                  alt="POLYCON Logo"
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                />
                <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">
                  POLYCON
                </span>
              </motion.div>
            </Link>

            {/* Right: Sign In & Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop Sign In/Dashboard Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(buttonlink)}
                className={`hidden lg:block bg-white text-base lg:text-lg text-[#0056a6] w-[7rem] lg:w-[9rem] px-4 py-2
                  rounded-full font-semibold transition-all duration-200
                  hover:bg-[#e6f3ff] hover:text-[#0078e7] hover:shadow-md`}
              >
                {buttontext}
              </motion.button>

              {/* Burger Menu Button (Mobile/Tablet Only) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="block lg:hidden text-white p-2 rounded-md hover:bg-white/20 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <span className="text-2xl">☰</span>}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-40 z-40" // Increased opacity for better focus
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel (Extracted to Sub-Component) */}
      <AnimatePresence>
        {isMenuOpen && (
            <MobileMenuPanel 
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                isTeacher={isTeacher}
                isStudent={isStudent}
                buttonlink={buttonlink}
                buttontext={buttontext}
                navigate={navigate}
                locationPathname={location.pathname}
            />
        )}
      </AnimatePresence>

      {/* Main Content Area (Help_Main_Content) */}
      <main className="flex-1 overflow-y-auto">
        <Help_Main_Content />
      </main>
    </div>
  );
};

export default Help;