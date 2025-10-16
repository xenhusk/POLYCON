import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../apiConfig';
import { useQuery } from "react-query";
import AppointmentItem from "../components/AppointmentItem";
import { showErrorNotification, showAppointmentReminder as browserAppointmentNotification } from '../utils/notificationUtils';
import { useToast } from '../contexts/ToastContext';
import { parseUTCTimestamp } from '../utils/timezoneUtils';
import FeedbackPopup from '../components/FeedbackPopup';

// Request notification permission on component load
if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  Notification.requestPermission();
}

// Fetch student appointments via React Query
const fetchStudentAppointments = async () => {
  const studentID = localStorage.getItem("studentID");
  // Artificial 2-second delay:
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${API_URL}/bookings/get_bookings?role=student&idNumber=${studentID}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

function StudentAppointments() {
  // Enhanced drag-to-scroll for desktop with better performance
  const pendingRef = useRef(null);
  const upcomingRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const setupDragScroll = (el) => {
      if (!el) return;
      
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let velocity = 0;
      let lastX = 0;
      let animationFrame = null;

      const onMouseDown = (e) => {
        // Don't start drag if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        el.classList.add('cursor-grabbing', 'select-none');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.pageX;
        velocity = 0;
        
        // Prevent text selection
        e.preventDefault();
      };

      const onMouseLeave = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
      };

      const onMouseUp = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
        
        // Add momentum scrolling
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.8;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.95;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5; // Increased sensitivity
        el.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity for momentum
        velocity = e.pageX - lastX;
        lastX = e.pageX;
      };

      // Touch events for mobile
      const onTouchStart = (e) => {
        // Don't start drag if touching interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        startX = e.touches[0].pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.touches[0].pageX;
        velocity = 0;
      };

      const onTouchMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.touches[0].pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
        
        velocity = e.touches[0].pageX - lastX;
        lastX = e.touches[0].pageX;
      };

      const onTouchEnd = () => {
        isDown = false;
        setIsDragging(false);
        
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.6;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.9;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      // Add event listeners
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseup', onMouseUp);
      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('touchstart', onTouchStart, { passive: false });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd);

      return () => {
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    };

    const cleanups = [];
    if (pendingRef.current) cleanups.push(setupDragScroll(pendingRef.current));
    if (upcomingRef.current) cleanups.push(setupDragScroll(upcomingRef.current));
    return () => cleanups.forEach((dispose) => dispose && dispose());
  }, []); // Remove appointments dependency to avoid initialization error

  const { showBookingCreated, showBookingConfirmed, showBookingCancelled, showAppointmentReminder, socket, isConnected } = useToast();
  
  const {
    data: bookings = [],
    refetch,
    isLoading,
  } = useQuery("studentAppointments", fetchStudentAppointments, {
    staleTime: 30000, // 30 seconds caching
    refetchOnWindowFocus: false,
  });

  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
  });

  // Re-initialize drag functionality when appointments change
  useEffect(() => {
    const setupDragScroll = (el) => {
      if (!el) return;
      
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let velocity = 0;
      let lastX = 0;
      let animationFrame = null;

      const onMouseDown = (e) => {
        // Don't start drag if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        el.classList.add('cursor-grabbing', 'select-none');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.pageX;
        velocity = 0;
        
        // Prevent text selection
        e.preventDefault();
      };

      const onMouseLeave = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
      };

      const onMouseUp = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
        
        // Add momentum scrolling
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.8;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.95;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5; // Increased sensitivity
        el.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity for momentum
        velocity = e.pageX - lastX;
        lastX = e.pageX;
      };

      // Touch events for mobile
      const onTouchStart = (e) => {
        // Don't start drag if touching interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        startX = e.touches[0].pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.touches[0].pageX;
        velocity = 0;
      };

      const onTouchMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.touches[0].pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
        
        velocity = e.touches[0].pageX - lastX;
        lastX = e.touches[0].pageX;
      };

      const onTouchEnd = () => {
        isDown = false;
        setIsDragging(false);
        
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.6;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.9;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      // Add event listeners
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseup', onMouseUp);
      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('touchstart', onTouchStart, { passive: false });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd);

      return () => {
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    };

    const cleanups = [];
    if (pendingRef.current) cleanups.push(setupDragScroll(pendingRef.current));
    if (upcomingRef.current) cleanups.push(setupDragScroll(upcomingRef.current));
    return () => cleanups.forEach((dispose) => dispose && dispose());
  }, [appointments]); // Now this is safe to use

  useEffect(() => {
    const categorizedAppointments = { pending: [], upcoming: [] };
    console.log("Appointments.js - Raw bookings data:", bookings); // Log raw bookings
    bookings.forEach((booking) => {      // Build appointment object for displaying in AppointmentItem
      const appointmentItem = {
        id: booking.id,
        teacher: {
          profile_picture: booking.teacherProfile,
          teacherName: booking.teacherName,
        },
        studentNames: booking.studentNames,
        // Transform studentProfiles to match AppointmentItem expected fields
        info: Array.isArray(booking.studentProfiles) ? booking.studentProfiles.map((s) => {
          const [firstName, ...rest] = s.name.split(" ");
          return {
            id: s.id,
            profile_picture: s.profile,
            firstName,
            lastName: rest.join(" "),
          };
        }) : [], // Default to empty array if studentProfiles is not an array
        schedule: booking.schedule,
        venue: booking.venue,
        status: booking.status,
        created_at: booking.created_at,
      };
      console.log("Appointments.js - Raw booking.created_at:", booking.created_at, typeof booking.created_at);
      console.log("Appointments.js - Constructed appointmentItem:", appointmentItem); // Log constructed item
      if (booking.status === "pending") {
        categorizedAppointments.pending.push(appointmentItem);
      } else if (booking.status === "confirmed") {
        categorizedAppointments.upcoming.push(appointmentItem);
      }
    });

    categorizedAppointments.pending.sort(
      (a, b) => parseUTCTimestamp(a.created_at) - parseUTCTimestamp(b.created_at)
    );
    categorizedAppointments.upcoming.sort(
      (a, b) => parseUTCTimestamp(a.schedule) - parseUTCTimestamp(b.schedule)
    );

    setAppointments(categorizedAppointments);
  }, [bookings]);

  // Student appointment reminder handler with browser notifications
  const handleAppointmentReminder = useCallback((data) => {
    console.log("⏰ appointment_reminder received:", data);
    const message = `Your appointment with ${data.teacherName || 'your teacher'} is starting in ${data.timeUntil || data.minutesUntil + ' minutes'} at ${data.venue || 'the scheduled location'}`;
    
    // Show in-app toast notification
    showAppointmentReminder(message);
    
    // Show browser/system tray notification
    browserAppointmentNotification({
      teacher: data.teacherName || 'your teacher',
      student: 'You',
      timeUntil: data.timeUntil || (data.minutesUntil + ' minutes'),
      venue: data.venue || 'the scheduled location'
    });
  }, [showAppointmentReminder]);

  useEffect(() => {
    // Only set up event listeners if socket is available and connected
    if (!socket || !isConnected) {
      console.log('� StudentAppointments: Socket not ready, waiting...', { socket: !!socket, isConnected });
      return;
    }

    console.log('� StudentAppointments: Setting up socket event listeners');
    
    // Only handle events that need immediate UI updates (not toast notifications)
    const handleBookingStatusUpdate = data => {
      console.log("📋 booking_status_update received:", data);
      if (data.action === 'completed') {
        console.log(`🎯 Booking ${data.bookingID} completed - Session ${data.sessionID} finalized`);
        // Immediately refetch to update the UI
        refetch();
      }
    };

    const handleBookingUpdated = data => {
      console.log("🔄 booking_updated received:", data);
      if (data.action === 'delete') {
        console.log(`🗑️ StudentAppointments: Booking ${data.bookingID} deleted - Session finalized`);
      }
      refetch();
    };

    // Note: booking_created, booking_confirmed, booking_cancelled, appointment_reminder are handled globally by ToastProvider
    socket.on('booking_updated', handleBookingUpdated);
    socket.on('booking_status_update', handleBookingStatusUpdate);

    console.log("📱 StudentAppointments: Socket event listeners attached");

    return () => {
      console.log("📱 StudentAppointments: Removing Socket.IO listeners");
      if (socket) {
        socket.off('booking_updated', handleBookingUpdated);
        socket.off('booking_status_update', handleBookingStatusUpdate);
      }
    };
  }, [socket, isConnected, refetch]);


  return (
    <div className="space-y-8">
      {/* Pending Appointments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    </div>
              <div>
                <h3 className="text-2xl font-bold">Pending Appointments</h3>
                <p className="text-blue-100">Awaiting teacher confirmation</p>
                  </div>
                        </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              <span className="text-lg font-bold">{appointments?.pending?.length || 0}</span>
                    </div>
                  </div>
                    </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 overflow-x-auto pb-4"
              >
                {Array.from({ length: 2 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-[320px] bg-gray-50 rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
          ) : appointments?.pending?.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <div 
                  ref={pendingRef} 
                  className={`flex gap-6 overflow-x-auto pb-4 scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {appointments.pending.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="min-w-[320px] flex-shrink-0"
                    >
                    <AppointmentItem
                      appointment={app}
                      role="student"
                    />
                    </motion.div>
                  ))}
            </div>
                
                {/* Navigation arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => pendingRef.current && pendingRef.current.scrollBy({ left: -320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-[#057DCD] hover:bg-[#057DCD] hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => pendingRef.current && pendingRef.current.scrollBy({ left: 320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-[#057DCD] hover:bg-[#057DCD] hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
            </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Appointments</h3>
                <p className="text-gray-600">You don't have any pending appointments at the moment.</p>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Upcoming Appointments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    </div>
              <div>
                <h3 className="text-2xl font-bold">Upcoming Appointments</h3>
                <p className="text-emerald-100">Confirmed and ready to attend</p>
                  </div>
                        </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              <span className="text-lg font-bold">{appointments?.upcoming?.length || 0}</span>
                    </div>
                  </div>
                    </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 overflow-x-auto pb-4"
              >
                {Array.from({ length: 2 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-[320px] bg-gray-50 rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  </motion.div>
              ))}
              </motion.div>
          ) : appointments?.upcoming?.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <div 
                  ref={upcomingRef} 
                  className={`flex gap-6 overflow-x-auto pb-4 scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {appointments.upcoming.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="min-w-[320px] flex-shrink-0"
                    >
                    <AppointmentItem
                      appointment={app}
                      role="student"
                    />
                    </motion.div>
                  ))}
            </div>
                
                {/* Navigation arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => upcomingRef.current && upcomingRef.current.scrollBy({ left: -320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => upcomingRef.current && upcomingRef.current.scrollBy({ left: 320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
            </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Upcoming Appointments</h3>
                <p className="text-gray-600">You don't have any confirmed appointments scheduled.</p>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
}

// Fetch teacher appointments via React Query
const fetchTeacherAppointments = async () => {
  const teacherID = localStorage.getItem("teacherID");
  const res = await fetch(
    `${API_URL}/bookings/get_bookings?role=faculty&idNumber=${teacherID}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

function TeacherAppointments() {
  // Enhanced drag-to-scroll for desktop with better performance
  const pendingRef = useRef(null);
  const upcomingRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const setupDragScroll = (el) => {
      if (!el) return;
      
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let velocity = 0;
      let lastX = 0;
      let animationFrame = null;

      const onMouseDown = (e) => {
        // Don't start drag if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        el.classList.add('cursor-grabbing', 'select-none');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.pageX;
        velocity = 0;
        
        // Prevent text selection
        e.preventDefault();
      };

      const onMouseLeave = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
      };

      const onMouseUp = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
        
        // Add momentum scrolling
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.8;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.95;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5; // Increased sensitivity
        el.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity for momentum
        velocity = e.pageX - lastX;
        lastX = e.pageX;
      };

      // Touch events for mobile
      const onTouchStart = (e) => {
        // Don't start drag if touching interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        startX = e.touches[0].pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.touches[0].pageX;
        velocity = 0;
      };

      const onTouchMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.touches[0].pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
        
        velocity = e.touches[0].pageX - lastX;
        lastX = e.touches[0].pageX;
      };

      const onTouchEnd = () => {
        isDown = false;
        setIsDragging(false);
        
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.6;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.9;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      // Add event listeners
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseup', onMouseUp);
      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('touchstart', onTouchStart, { passive: false });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd);

      return () => {
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    };

    const cleanups = [];
    if (pendingRef.current) cleanups.push(setupDragScroll(pendingRef.current));
    if (upcomingRef.current) cleanups.push(setupDragScroll(upcomingRef.current));
    return () => cleanups.forEach((dispose) => dispose && dispose());
  }, []); // Remove sortedAppointments dependency to avoid initialization error
  
  const { showBookingCreated, showBookingConfirmed, showBookingCancelled, showAppointmentReminder, socket, isConnected } = useToast();
  
  const {
    data: appointmentsData = [], // Renamed to avoid conflict
    refetch,
    isLoading,
  } = useQuery("teacherAppointments", fetchTeacherAppointments, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const [sortedAppointments, setSortedAppointments] = useState({
    pending: [],
    upcoming: [],
  });
  const [confirmInputs, setConfirmInputs] = useState({});

  // Re-initialize drag functionality when appointments change
  useEffect(() => {
    const setupDragScroll = (el) => {
      if (!el) return;
      
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let velocity = 0;
      let lastX = 0;
      let animationFrame = null;

      const onMouseDown = (e) => {
        // Don't start drag if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        el.classList.add('cursor-grabbing', 'select-none');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.pageX;
        velocity = 0;
        
        // Prevent text selection
        e.preventDefault();
      };

      const onMouseLeave = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
      };

      const onMouseUp = () => {
        isDown = false;
        setIsDragging(false);
        el.classList.remove('cursor-grabbing', 'select-none');
        
        // Add momentum scrolling
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.8;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.95;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5; // Increased sensitivity
        el.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity for momentum
        velocity = e.pageX - lastX;
        lastX = e.pageX;
      };

      // Touch events for mobile
      const onTouchStart = (e) => {
        // Don't start drag if touching interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
          return;
        }
        
        isDown = true;
        setIsDragging(true);
        startX = e.touches[0].pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        lastX = e.touches[0].pageX;
        velocity = 0;
      };

      const onTouchMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.touches[0].pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
        
        velocity = e.touches[0].pageX - lastX;
        lastX = e.touches[0].pageX;
      };

      const onTouchEnd = () => {
        isDown = false;
        setIsDragging(false);
        
        if (Math.abs(velocity) > 1) {
          const momentum = velocity * 0.6;
          const animate = () => {
            el.scrollLeft -= momentum;
            velocity *= 0.9;
            if (Math.abs(velocity) > 0.1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animate();
        }
      };

      // Add event listeners
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseup', onMouseUp);
      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('touchstart', onTouchStart, { passive: false });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd);

      return () => {
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    };

    const cleanups = [];
    if (pendingRef.current) cleanups.push(setupDragScroll(pendingRef.current));
    if (upcomingRef.current) cleanups.push(setupDragScroll(upcomingRef.current));
    return () => cleanups.forEach((dispose) => dispose && dispose());
  }, [sortedAppointments]); // Now this is safe to use

  // Memoize the sorted appointments
  const sortedData = useMemo(() => {
    console.log("TeacherAppointments - Raw appointmentsData:", appointmentsData); // Log raw data

    const transformAppointment = (app) => ({
      ...app,
      info: Array.isArray(app.studentProfiles) ? app.studentProfiles.map((s) => {
        const [firstName, ...rest] = (s.name || '').split(" "); 
        return {
          id: s.id, // Keep this as the unique key for React lists or other internal uses
          idNumber: s.idNumber, // Assuming 's.idNumber' holds the student's ID number
          profile_picture: s.profile,
          firstName,
          lastName: rest.join(" "),
        };
      }) : [], 
    });

    const upcomingApps = appointmentsData
      .filter((app) => app.status === "confirmed")
      .map(transformAppointment)
      .sort((a, b) => parseUTCTimestamp(a.schedule) - parseUTCTimestamp(b.schedule));

    const pendingApps = appointmentsData
      .filter((app) => app.status === "pending")
      .map(transformAppointment)
      .sort((a, b) => parseUTCTimestamp(a.created_at) - parseUTCTimestamp(b.created_at));

    return {
      upcoming: upcomingApps,
      pending: pendingApps,
    };
  }, [appointmentsData]); // Dependency: raw \'appointmentsData\'

  useEffect(() => {
    setSortedAppointments(sortedData);
  }, [sortedData]);  const handleBookingUpdateOrCreate = useCallback((data) => {
    console.log("🔄 TeacherAppointments: booking_updated or booking_created event received:", data);
    
    // Handle booking completion (session finalized)
    if (data && data.action === 'completed') {
      console.log(`🎯 TeacherAppointments: Booking ${data.bookingID} completed - Session ${data.sessionID} finalized`);
      // Refetch data to update the UI
      refetch();
      return;
    }
    
    // Handle booking deletion (session finalized in Firestore version)
    if (data && data.action === 'delete') {
      console.log(`🗑️ TeacherAppointments: Booking ${data.bookingID} deleted - Session finalized`);
      // Refetch data to update the UI
      refetch();
      return;
    }
    
    // Note: Toast notifications are now handled globally by ToastProvider
    // Only handle data refresh here
    console.log("Refetching teacher appointments due to Socket.IO event");
    refetch();
  }, [refetch]);

  const handleAppointmentReminder = useCallback((data) => {
    console.log("⏰ appointment_reminder received:", data);
    const studentNames = data.studentNames ? data.studentNames.join(', ') : 'your students';
    const message = `Your appointment with ${studentNames} is starting in ${data.timeUntil || data.minutesUntil + ' minutes'} at ${data.venue || 'the scheduled location'}`;
    
    // Show in-app toast notification
    showAppointmentReminder(message);
    
    // Show browser/system tray notification
    browserAppointmentNotification({
      teacher: data.teacherName || 'Teacher',
      student: studentNames,
      timeUntil: data.timeUntil || (data.minutesUntil + ' minutes'),
      venue: data.venue || 'the scheduled location'
    });
  }, [showAppointmentReminder]);
  useEffect(() => {
    // Only set up event listeners if socket is available and connected
    if (!socket || !isConnected) {
      console.log('� TeacherAppointments: Socket not ready, waiting...', { socket: !!socket, isConnected });
      return;
    }

    console.log('📱 TeacherAppointments: Setting up socket event listeners');

    // Note: booking_created, booking_confirmed, booking_cancelled, appointment_reminder are handled globally by ToastProvider
    socket.on('booking_updated', handleBookingUpdateOrCreate);
    socket.on('booking_status_update', handleBookingUpdateOrCreate);

    console.log("📱 TeacherAppointments: Socket event listeners attached");

    return () => {
      console.log("📱 TeacherAppointments: Removing Socket.IO listeners");
      if (socket) {
        socket.off('booking_updated', handleBookingUpdateOrCreate);
        socket.off('booking_status_update', handleBookingUpdateOrCreate);
      }
    };
  }, [socket, isConnected, handleBookingUpdateOrCreate]);

  const handleConfirmClick = (bookingID) => {
    setConfirmInputs((prev) => ({
      ...prev,
      [bookingID]: { schedule: "", venue: "" },
    }));
  };
  async function confirmBooking(bookingID, schedule, venue) {
    if (!schedule || !venue) {
      showErrorNotification("Schedule and venue are required to confirm the booking.");
      throw new Error(
        "Schedule and venue are required to confirm the booking."
      );
    }
    try {
      const response = await fetch(
        `${API_URL}/bookings/confirm_booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingID, schedule, venue }),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        console.error("Failed to confirm booking:", result.error || "Unknown error");
        // Consider displaying this error to the user
        throw new Error(result.error || "Unknown error");
      }
      console.log("Booking confirmed successfully, refetching teacher appointments...");
      refetch(); // Refetch appointments
      // Clear the input fields for this booking ID after successful confirmation
      setConfirmInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[bookingID];
        return newInputs;
      });
    } catch (error) {
      console.error("Error in confirmBooking:", error);
      // Consider displaying this error to the user
      // For example: alert(\`Error confirming booking: \${error.message}\`);
    }
  }

  async function cancelBooking(bookingID) {
    try {
      const response = await fetch(
        `${API_URL}/bookings/cancel_booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingID }),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        console.error("Failed to cancel booking:", result.error || "Unknown error");
        // Consider displaying this error to the user
        throw new Error(result.error || "Unknown error");
      }
      console.log("Booking cancelled successfully, refetching teacher appointments...");
      refetch(); // Refetch appointments
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      // Consider displaying this error to the user
      // For example: alert(\`Error cancelling booking: \${error.message}\`);
    }
  }

  async function startSession(appointment) {
    const teacherID = localStorage.getItem("teacherID");
    // Use student.idNumber for the studentIDs query parameter
    const studentIDs = Array.isArray(appointment.info) ? appointment.info.map((student) => student.idNumber) : [];

    // Construct teacherInfo object for Session.js
    // Session.js expects 'name', 'profile_picture', 'department', and 'role'.
    // 'department' and 'role' are not directly available in the 'appointment' object from booking data.
    // Passing them as null so Session.js can handle them gracefully.
    const teacherDetailsForSession = {
      name: appointment.teacherName,
      profile_picture: appointment.teacherProfile,
      department: null, 
      role: null,       
    };
    const teacherInfoParam = encodeURIComponent(JSON.stringify(teacherDetailsForSession));

    const studentInfoParam = appointment.info
      ? encodeURIComponent(JSON.stringify(appointment.info)) // studentInfo will now also contain idNumber in each student object
      : "";
    const venueParam = appointment.venue
      ? encodeURIComponent(appointment.venue)
      : "";

    const sessionUrl = `/session?teacherID=${teacherID}&studentIDs=${studentIDs.join(
      ","
    )}&teacherInfo=${teacherInfoParam}&studentInfo=${studentInfoParam}&venue=${venueParam}&booking_id=${
      appointment.id
    }`;
    window.open(sessionUrl, "_blank");
  }

  return (
    <div className="space-y-8">
      {/* Pending Appointments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    </div>
              <div>
                <h3 className="text-2xl font-bold">Pending Requests</h3>
                <p className="text-amber-100">Awaiting your confirmation</p>
                  </div>
                        </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              <span className="text-lg font-bold">{sortedAppointments?.pending?.length || 0}</span>
                    </div>
                  </div>
                    </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 overflow-x-auto pb-4"
              >
                {Array.from({ length: 2 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-[320px] bg-gray-50 rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
          ) : sortedAppointments?.pending?.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <div 
                  ref={pendingRef} 
                  className={`flex gap-6 overflow-x-auto pb-4 scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {sortedAppointments.pending.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="min-w-[320px] flex-shrink-0"
                    >
                    <AppointmentItem
                      appointment={app}
                      role="faculty"
                      onCancel={cancelBooking}
                      onConfirm={confirmBooking}
                      confirmInputs={confirmInputs}
                      handleConfirmClick={handleConfirmClick}
                      setConfirmInputs={setConfirmInputs}
                    />
                    </motion.div>
                  ))}
            </div>
                
                {/* Navigation arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => pendingRef.current && pendingRef.current.scrollBy({ left: -320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => pendingRef.current && pendingRef.current.scrollBy({ left: 320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
            </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">You don't have any appointment requests awaiting confirmation.</p>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Upcoming Appointments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    </div>
              <div>
                <h3 className="text-2xl font-bold">Upcoming Sessions</h3>
                <p className="text-emerald-100">Ready to start your consultations</p>
                  </div>
                        </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              <span className="text-lg font-bold">{sortedAppointments?.upcoming?.length || 0}</span>
                    </div>
                  </div>
                    </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 overflow-x-auto pb-4"
              >
                {Array.from({ length: 2 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-[320px] bg-gray-50 rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  </motion.div>
              ))}
              </motion.div>
          ) : sortedAppointments?.upcoming?.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <div 
                  ref={upcomingRef} 
                  className={`flex gap-6 overflow-x-auto pb-4 scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {sortedAppointments.upcoming.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="min-w-[320px] flex-shrink-0"
                    >
                    <AppointmentItem
                      appointment={app}
                      role="faculty"
                      onStartSession={startSession}
                      onCancel={cancelBooking}
                    />
                    </motion.div>
                  ))}
            </div>
                
                {/* Navigation arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => upcomingRef.current && upcomingRef.current.scrollBy({ left: -320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => upcomingRef.current && upcomingRef.current.scrollBy({ left: 320, behavior: 'smooth' })}
                  className="hidden lg:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
            </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600">You don't have any confirmed consultation sessions scheduled.</p>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
}

function Appointments() {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole")?.toLowerCase() || "";
  });

  // Feedback popup state
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackSessionData, setFeedbackSessionData] = useState(null);

  // Polling-based feedback check (only for students)
  const checkForFeedbackOpportunity = async () => {
    try {
      const studentID = localStorage.getItem("studentID");
      if (!studentID || role !== 'student') return;

      const response = await fetch(`${API_URL}/feedback/check_pending?student_id=${studentID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.has_pending_feedback && data.session_data) {
          setFeedbackSessionData({
            sessionId: data.session_data.session_id,
            teacherId: data.session_data.teacher_id,
            studentId: data.session_data.student_id,
            sessionDate: data.session_data.session_date,
            teacherName: data.session_data.teacher_name,
            program: data.session_data.program,
            yearSection: data.session_data.year_section,
            summary: data.session_data.summary,
            concern: data.session_data.concern
          });
          setShowFeedbackPopup(true);
        }
      }
    } catch (error) {
      console.error('Error checking for feedback:', error);
    }
  };

  useEffect(() => {
    if (role !== 'student') return;

    // Initial check
    checkForFeedbackOpportunity();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      checkForFeedbackOpportunity();
    }, 30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [role]);

  const handleFeedbackSubmitted = (feedbackData) => {
    console.log('Feedback submitted from Appointments page:', feedbackData);
    setShowFeedbackPopup(false);
    setFeedbackSessionData(null);
  };

  if (!role) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#057DCD] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading appointments...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-16 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-15"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              My Appointments
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-2">
              {role === "student" ? "Track your consultation requests" : "Manage your consultation sessions"}
            </p>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              {role === "student" 
                ? "View your pending and confirmed appointments with faculty members" 
                : "Review and manage student consultation requests and scheduled sessions"
              }
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
        {role === "student" ? (
          <StudentAppointments />
        ) : role === "faculty" ? (
          <TeacherAppointments />
        ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Access Restricted</h3>
                <p className="text-lg text-gray-600">
                  No appointments available for your current role. Please contact your administrator if you believe this is an error.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Feedback Popup */}
      {showFeedbackPopup && feedbackSessionData && (
        <FeedbackPopup
          isOpen={showFeedbackPopup}
          onClose={() => setShowFeedbackPopup(false)}
          consultationSessionId={feedbackSessionData.sessionId}
          studentId={feedbackSessionData.studentId}
          teacherId={feedbackSessionData.teacherId}
          onFeedbackSubmitted={handleFeedbackSubmitted}
          sessionDate={feedbackSessionData.sessionDate}
          teacherName={feedbackSessionData.teacherName}
          program={feedbackSessionData.program}
          yearSection={feedbackSessionData.yearSection}
          summary={feedbackSessionData.summary}
          concern={feedbackSessionData.concern}
        />
      )}
    </div>
  );
}

export default Appointments;
