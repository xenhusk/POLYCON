import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordResetModal from "./PasswordResetModal";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../contexts/ToastContext";
import { clearUserAuth } from "../utils/authUtils";
import {
  areBrowserNotificationsSupported,
  hasNotificationPermission,
  requestNotificationPermissionWithInstructions,
  areNotificationsEnabled,
  toggleNotifications,
  areSoundNotificationsEnabled,
  toggleSoundNotifications,
  showAppointmentReminder,
  showNotification,
  isMobileDevice,
  registerNotificationServiceWorker,
} from "../utils/notificationUtils";

const SettingsPopup = ({
  isVisible,
  onClose,
  position,
  userEmail,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { clearNotificationsOnLogout } = useToast();
  const isAdmin = localStorage.getItem("userRole") === "admin";
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Notification states
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");
  const [deviceType, setDeviceType] = useState("desktop");

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize notification states
  useEffect(() => {
    if (isVisible) {
      setNotificationsSupported(areBrowserNotificationsSupported());
      setNotificationsEnabled(areNotificationsEnabled());
      setSoundEnabled(areSoundNotificationsEnabled());
      setPermissionStatus(
        areBrowserNotificationsSupported()
          ? Notification.permission
          : "not-supported"
      );
      setDeviceType(isMobileDevice() ? "mobile" : "desktop");
    }
  }, [isVisible]);

  // Effect to prevent background scrolling when modal is open
  useEffect(() => {
    if (isVisible || showPasswordModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible, showPasswordModal]);

  // Use fallback from localStorage in case userEmail prop is undefined
  const effectiveEmail = userEmail || localStorage.getItem("userEmail");
  const handleLogout = () => {
    // Clear notifications from localStorage
    clearNotificationsOnLogout();

    // Clear auth data consistently
    clearUserAuth();
    onClose();
    if (typeof onLogout === "function") {
      onLogout();
    }
    navigate("/login", { replace: true });
  };

  // New handler for Change Password click
  const handleChangePasswordClick = () => {
    setShowPasswordModal(true); // Show password modal first
    onClose(); // Then close settings popup
  };

  // Handle close for password modal
  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  // Notification handlers with mobile support
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // User wants to enable notifications
      if (!hasNotificationPermission()) {
        // Need to request permission first - use mobile-enhanced version
        try {
          if (deviceType === "mobile") {
            // Register SW on mobile before requesting permission
            await registerNotificationServiceWorker();
          }
          const granted = await requestNotificationPermissionWithInstructions(true);

          if (granted) {
            const result = toggleNotifications(true);
            setNotificationsEnabled(result);
            setPermissionStatus(Notification.permission);
          } else {
            setNotificationsEnabled(false);
            setPermissionStatus(Notification.permission);
          }
        } catch (e) {
          console.error("Mobile notification enable failed:", e);
          setNotificationsEnabled(false);
        }
      } else {
        // Already have permission, just enable
        const result = toggleNotifications(true);
        setNotificationsEnabled(result);
      }
    } else {
      // User wants to disable notifications
      const result = toggleNotifications(false);
      setNotificationsEnabled(result);
    }
  };

  const handleToggleSounds = () => {
    const newStatus = !soundEnabled;
    toggleSoundNotifications(newStatus);
    setSoundEnabled(newStatus);
  };

  const testNotification = () => {
    try {
      showNotification("Test Notification", {
        body: `This is a test ${deviceType} notification from POLYCON!`,
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: "test-notification",
        requireInteraction: deviceType === "mobile",
        actions:
          deviceType === "mobile"
            ? [
                { action: "view", title: "View" },
                { action: "dismiss", title: "Dismiss" },
              ]
            : undefined,
      });
    } catch (error) {
      console.error("Test notification failed:", error);
    }
  };

  const getPermissionStatusInfo = () => {
    switch (permissionStatus) {
      case "granted":
        return {
          text: "Enabled",
          bgColor: "bg-green-100",
          color: "text-green-700",
        };
      case "denied":
        return {
          text: "Blocked",
          bgColor: "bg-red-100",
          color: "text-red-700",
        };
      case "default":
        return {
          text: "Pending",
          bgColor: "bg-yellow-100",
          color: "text-yellow-700",
        };
      default:
        return {
          text: "Unknown",
          bgColor: "bg-gray-100",
          color: "text-gray-700",
        };
    }
  };

  if (!isVisible && !showPasswordModal) return null;

  return (
    <>
      {/* Backdrop - only apply darkening and blur on mobile */}
      <div
        className={`fixed inset-0 z-[999] ${
          isMobile ? "bg-black bg-opacity-60 backdrop-blur-sm" : ""
        }`}
        onClick={showPasswordModal ? handleClosePasswordModal : onClose}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* Settings Popup - Only shown when isVisible is true */}
      {isVisible &&
        (isMobile ? (
          // Mobile: Modern bottom sheet style popup
          <div className="fixed inset-x-0 bottom-0 z-[1000]">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl border-t border-white/20 w-full py-4"
            >
              {/* Header with gradient background and close button */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94] rounded-t-3xl opacity-10"></div>
                <div className="relative flex justify-between items-center px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Settings</h3>
                      <p className="text-xs text-gray-600">Manage your preferences</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-600"
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
                  </motion.button>
                </div>
              </div>

              {/* Settings Options */}
              <div className="py-2">
                {/* Security Section */}
                <div className="px-6 py-3">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#057DCD] rounded-full"></div>
                    Security
                  </p>
                  <motion.button
                    onClick={handleChangePasswordClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:bg-gray-100 rounded-xl flex items-center transition-all duration-200 border border-transparent hover:border-blue-200"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Change Password</span>
                      <p className="text-xs text-gray-500">Update your account security</p>
                    </div>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                {/* Notifications Section */}
                {notificationsSupported && (
                  <>
                    <div className="px-6 py-3">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#057DCD] rounded-full"></div>
                        Notifications
                      </p>

                      {/* Browser Notifications Toggle */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 mb-2"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                          </div>
                          <div>
                            <span className="text-base font-medium text-gray-700">
                              {deviceType === "mobile"
                                ? "Push Notifications"
                                : "Desktop Alerts"}
                            </span>
                            <p className="text-xs text-gray-500">
                              {deviceType === "mobile"
                                ? "Receive notifications with vibration & actions"
                                : "System tray notifications"}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsEnabled}
                            onChange={handleToggleNotifications}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#057DCD]"></div>
                        </label>
                      </motion.div>

                      {/* Sound Notifications Toggle */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5 text-white" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor"
                            >
                              <path 
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                              />
                            </svg>
                          </div>
                          <div>
                            <span className="text-base font-medium text-gray-700">
                              Sound Alerts
                            </span>
                            <p className="text-xs text-gray-500">
                              {deviceType === "mobile"
                                ? "App sounds (vibration handled by system)"
                                : "Play notification sounds"}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={handleToggleSounds}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#057DCD]"></div>
                        </label>
                      </motion.div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
                  </>
                )}

                {!isAdmin && (
                  <div className="px-6 py-2">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Security
                    </p>
                    <a
                      href="/help/getstarted/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="#fff"
                        />
                        <path
                          d="M12 16h.01M12 12a2 2 0 10-2-2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 14v-1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Get Help
                    </a>
                  </div>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                {/* Logout Section */}
                <div className="px-6 py-3">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-3 text-base text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 active:bg-red-100 rounded-xl flex items-center transition-all duration-200 border border-transparent hover:border-red-200"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Logout</span>
                      <p className="text-xs text-red-500">Sign out of your account</p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Desktop: Modern dropdown at the specified position
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-72 py-4 z-[1000]"
            style={{
              left: '20px',
              top: '50%',
              marginTop: '-180px', // Half of modal height (approximately 360px total)
            }}
          >
            {/* Header with gradient background */}
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94] rounded-t-2xl opacity-10"></div>
              <div className="relative px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Settings</h3>
                    <p className="text-xs text-gray-600">Manage preferences</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#057DCD] rounded-full"></div>
                Security
              </p>
              <motion.button
                onClick={handleChangePasswordClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg flex items-center transition-all duration-200 border border-transparent hover:border-blue-200"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-md flex items-center justify-center mr-2 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <span className="font-medium text-sm">Change Password</span>
              </motion.button>
            </div>

            {/* Notifications Section */}
            {notificationsSupported && (
              <>
                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#057DCD] rounded-full"></div>
                    Notifications
                  </p>

                  {/* Browser Notifications Toggle */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 mb-1"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-md flex items-center justify-center mr-2 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Desktop Alerts</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={handleToggleNotifications}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#057DCD]"></div>
                    </label>
                  </motion.div>

                  {/* Sound Notifications Toggle */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-md flex items-center justify-center mr-2 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Sound Alerts</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={handleToggleSounds}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#057DCD]"></div>
                    </label>
                  </motion.div>
                </div>
              </>
            )}
{/* 
            <div className="h-[1px] bg-gray-200 my-2" />

            <div className="px-4 py-2">
              <p className="text-sm font-semibold text-gray-500">Help</p>
              <a
                href="/help/getstarted/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="#fff"
                  />
                  <path
                    d="M12 16h.01M12 12a2 2 0 10-2-2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 14v-1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Get Help
              </a>
            </div> */}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

            {/* Logout Section */}
            <div className="px-4 py-2">
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg flex items-center transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center mr-2 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <span className="font-medium text-sm">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        ))}{" "}
      {/* Password Reset Modal - No separate backdrop needed */}
      {showPasswordModal && (
        <PasswordResetModal
          isVisible={showPasswordModal}
          onClose={handleClosePasswordModal}
          userEmail={userEmail}
        />
      )}
    </>
  );
};

export default SettingsPopup;
