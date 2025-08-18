import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API_URL from '../apiConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { usePreloadedData } from '../context/PreloadContext';
import { showAppointmentReminder as browserAppointmentNotification } from '../utils/notificationUtils';
import { useToast } from '../contexts/ToastContext';

const localizer = momentLocalizer(moment);

function TeacherAppointments() {
  const [appointments, setAppointments] = useState([]);
  const { showAppointmentReminder: toastAppointment } = useToast(); // Toast context for in-app toasts
  const [loading, setLoading] = useState(true);
  const teacherID = localStorage.getItem('teacherID');

  const fetchAppointments = useCallback(async () => {
    if (!teacherID) return;
    
    try {
      const response = await fetch(`${API_URL}/bookings/get_bookings?role=faculty&userID=${teacherID}&status=pending`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [teacherID]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Frontend reminder logic disabled - now using backend SocketIO scheduler for accurate timing
  // useEffect(() => {
  //   const REMINDER_MINUTES = 15;
  //   const timeoutIds = [];
  //   appointments.forEach(booking => {
  //     const scheduleMs = new Date(booking.schedule).getTime();
  //     const reminderTime = scheduleMs - REMINDER_MINUTES * 60000;
  //     const now = Date.now();
  //     const msUntil = reminderTime - now;
  //     if (msUntil > 0) {
  //       const id = setTimeout(() => {
  //         // Browser notification
  //         browserAppointmentNotification({
  //           teacher: booking.teacherName,
  //           student: booking.studentNames[0] || '',
  //           timeUntil: `${REMINDER_MINUTES} minutes`
  //         });
  //         // In-app toast
  //         toastAppointment(`Your appointment with ${booking.studentNames.join(', ')} starts in ${REMINDER_MINUTES} minutes`);
  //       }, msUntil);
  //       timeoutIds.push(id);
  //     }
  //   });
  //   return () => timeoutIds.forEach(clearTimeout);
  // }, [appointments, toastAppointment]);

  const events = useMemo(() => {
    if (!appointments?.length) return [];
    
    return appointments.map(booking => ({
      title: `Meeting with ${booking.studentNames?.join(', ') || 'Unknown Students'}`,
      start: new Date(booking.schedule),
      end: new Date(booking.schedule),
      allDay: false,
      agendaTitle: `Appointment with ${booking.studentNames?.join(', ') || 'Unknown Students'}`,
      venue: booking.venue || 'TBA'
    }));
  }, [appointments]);

  return (
    <div className="h-full overflow-hidden bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] shadow-lg border-b border-blue-600/20">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="font-medium">Back</span>
              </button>
              
              <div className="h-6 w-px bg-white/20"></div>
              
              <div>
                <h1 className="text-white text-xl font-bold">Teacher Schedule</h1>
                <p className="text-blue-100 text-sm">Manage your appointments and availability</p>
              </div>
            </div>

            {/* Right side - Navigation links */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.location.href = '/home-teacher'}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 text-sm font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/admin-consultation'}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 text-sm font-medium"
              >
                Leaderboard
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-white text-[#0065A8] rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            views={['month', 'week', 'day', 'agenda']}
            formats={{
              eventTimeRangeFormat: () => ""
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TeacherAppointments;
