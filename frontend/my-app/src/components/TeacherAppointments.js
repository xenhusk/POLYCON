import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
      const response = await fetch(`http://localhost:5001/bookings/get_bookings?role=faculty&userID=${teacherID}&status=pending`);
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

  // Schedule 15-minute reminder notifications for upcoming appointments
  useEffect(() => {
    const REMINDER_MINUTES = 15;
    const timeoutIds = [];
    appointments.forEach(booking => {
      const scheduleMs = new Date(booking.schedule).getTime();
      const reminderTime = scheduleMs - REMINDER_MINUTES * 60000;
      const now = Date.now();
      const msUntil = reminderTime - now;
      if (msUntil > 0) {
        const id = setTimeout(() => {
          // Browser notification
          browserAppointmentNotification({
            teacher: booking.teacherName,
            student: booking.studentNames[0] || '',
            timeUntil: `${REMINDER_MINUTES} minutes`
          });
          // In-app toast
          toastAppointment(`Your appointment with ${booking.studentNames.join(', ')} starts in ${REMINDER_MINUTES} minutes`);
        }, msUntil);
        timeoutIds.push(id);
      }
    });
    return () => timeoutIds.forEach(clearTimeout);
  }, [appointments, toastAppointment]);

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
  );
}

export default TeacherAppointments;
