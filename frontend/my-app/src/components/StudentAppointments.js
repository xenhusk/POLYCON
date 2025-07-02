import React, { useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { usePreloadedData } from '../context/PreloadContext';
import { showAppointmentReminder as browserAppointmentNotification } from '../utils/notificationUtils';
import { useToast } from '../contexts/ToastContext';

const localizer = momentLocalizer(moment);

const StudentAppointments = React.memo(() => {
  const { appointments, isLoading } = usePreloadedData();
  const { showAppointmentReminder: toastAppointment } = useToast(); // Toast context for in-app toasts  // Schedule 15-minute reminder notifications for upcoming appointments
  useEffect(() => {
    const REMINDER_MINUTES = 15;
    const timeoutIds = [];
    
    console.log('🔔 StudentAppointments: Setting up reminders for', appointments?.length || 0, 'appointments');
    
    appointments?.forEach(booking => {
      const scheduleMs = new Date(booking.schedule).getTime();
      const reminderTime = scheduleMs - REMINDER_MINUTES * 60000;
      const now = Date.now();
      const msUntil = reminderTime - now;
      
      console.log('📅 Appointment:', {
        id: booking.id,
        schedule: booking.schedule,
        scheduleDate: new Date(booking.schedule),
        reminderTime: new Date(reminderTime),
        msUntil,
        minutesUntil: Math.floor(msUntil / 60000),
        willSetReminder: msUntil > 0
      });
      
      if (msUntil > 0) {
        console.log(`⏰ Setting reminder for appointment ${booking.id} in ${Math.floor(msUntil / 60000)} minutes`);
        const id = setTimeout(() => {
          console.log('🔔 FIRING REMINDER for appointment:', booking.id);
          // Browser notification
          browserAppointmentNotification({
            teacher: booking.teacherName,
            student: 'You', // From student's perspective
            timeUntil: `${REMINDER_MINUTES} minutes`
          });
          // In-app toast
          toastAppointment(`Your appointment with ${booking.teacherName || 'Unknown'} starts in ${REMINDER_MINUTES} minutes`);
        }, msUntil);
        timeoutIds.push(id);
      } else {
        console.log(`⚠️ Skipping reminder for appointment ${booking.id} - reminder time already passed`);
      }    });
    
    return () => {
      console.log('🧹 Clearing', timeoutIds.length, 'reminder timeouts');
      timeoutIds.forEach(clearTimeout);
    };
  }, [appointments, toastAppointment]);

  const events = useMemo(() => (
    appointments?.map(booking => ({
      id: booking.id,
      title: `Meeting with ${booking.teacherName || 'Unknown'}`,
      start: new Date(booking.schedule),
      end: new Date(booking.schedule),
      allDay: false,
      agendaTitle: `Appointment with ${booking.teacherName || 'Unknown'}`,
      venue: booking.venue || 'TBA'
    })) || []
  ), [appointments]);

  if (isLoading) {
    return <div>Loading appointments...</div>;
  }

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
});

StudentAppointments.displayName = 'StudentAppointments';
export default StudentAppointments;
