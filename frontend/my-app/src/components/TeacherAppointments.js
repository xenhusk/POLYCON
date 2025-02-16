import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { usePreloadedData } from '../context/PreloadContext';

const localizer = momentLocalizer(moment);

function TeacherAppointments() {
  const { preloadedData } = usePreloadedData();

  const events = useMemo(() => {
    if (!preloadedData?.appointments?.length) return [];
    
    return preloadedData.appointments.map(booking => ({
      title: `Meeting with ${booking.studentNames?.join(', ') || 'Unknown Students'}`,
      start: new Date(booking.schedule),
      end: new Date(booking.schedule),
      allDay: false,
      agendaTitle: `Appointment with ${booking.studentNames?.join(', ') || 'Unknown Students'}`,
      venue: booking.venue || 'TBA'
    }));
  }, [preloadedData?.appointments]);

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
