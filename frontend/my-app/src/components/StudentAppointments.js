import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { usePreloadedData } from '../context/PreloadContext';

const localizer = momentLocalizer(moment);

const StudentAppointments = React.memo(() => {
  const { appointments, isLoading } = usePreloadedData();
  
  // Frontend reminder logic disabled - now using backend SocketIO scheduler for accurate timing
  // The backend scheduler provides accurate timing and prevents duplicate notifications

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
    <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-md ring-1 ring-blue-100">
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
