import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { usePreloadedData } from '../context/PreloadContext';

const localizer = momentLocalizer(moment);

function TeacherAppointments() {
  const [appointments, setAppointments] = useState([]);
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
