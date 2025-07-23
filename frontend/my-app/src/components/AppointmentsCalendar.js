
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import API_URL from '../apiConfig';

const localizer = momentLocalizer(moment);

// UPDATED: CustomToolbar with smoother transitions on button hover
function CustomToolbar({ label, onNavigate, onView, view, views }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#0065A8',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => onNavigate('PREV')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}>◀</button>
        <button 
          onClick={() => onNavigate('TODAY')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            marginLeft: '0.5rem',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}>Today</button>
        <button 
          onClick={() => onNavigate('NEXT')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            marginLeft: '0.5rem',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}>▶</button>
      </div>
      <span style={{ fontWeight: '600' }}>{label}</span>
      <div>
        {views.map((v) => (
          <button key={v}
            onClick={() => onView(v)}
            style={{
              background: view === v ? "#004776" : "transparent",
              border: "none",
              color: "white",
              padding: "0.25rem 0.5rem",
              marginLeft: "0.25rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
              transition: 'background 0.3s',
            }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function AppointmentsCalendar() {
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [calendarData, setCalendarData] = useState(null);


    // (Optional) You can implement caching if needed, but the original code was broken

    useEffect(() => {
        const fetchUserRole = async () => {
            const storedEmail = localStorage.getItem('userEmail');
            if (storedEmail) {
                try {
                    const response = await fetch(`${API_URL}/account/get_user_role?email=${storedEmail}`);
                    const data = await response.json();
                    setUserRole(data.role);
                    console.log('User role:', data.role);
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            }
        };
        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (userRole === 'student') {
                const studentID = localStorage.getItem('studentID');
                if (studentID) {
                    try {
                        const response = await fetch(`${API_URL}/bookings/get_bookings?role=student&userID=${studentID}&status=confirmed`);
                        const bookings = await response.json();
                        const events = bookings.map(booking => {
                            const teacherName = booking.teacherName;
                            return {
                                title: teacherName,
                                start: new Date(booking.schedule),
                                end: new Date(booking.schedule),
                                allDay: false,
                                agendaTitle: `Appointment with ${teacherName}`,
                            };
                        });
                        setEvents(events);
                    } catch (error) {
                        console.error('Error fetching student bookings:', error);
                    }
                }
            } else if (userRole === 'faculty') {
                const teacherID = localStorage.getItem('teacherID');
                if (teacherID) {
                    try {
                        const response = await fetch(`${API_URL}/bookings/get_bookings?role=faculty&userID=${teacherID}&status=confirmed`);
                        const bookings = await response.json();
                        const events = bookings.map(booking => {
                            const studentNamesString = booking.studentNames.join(", ");
                            return {
                                title: studentNamesString,
                                start: new Date(booking.schedule),
                                end: new Date(booking.schedule),
                                allDay: false,
                                agendaTitle: `Appointment with ${studentNamesString}`,
                            };
                        });
                        setEvents(events);
                    } catch (error) {
                        console.error('Error fetching teacher bookings:', error);
                    }
                }
            }
        };
        if (userRole) {
            fetchAppointments();
        }
    }, [userRole]);

    // UPDATED: eventPropGetter with added box shadow and transform on hover
    const eventPropGetter = (event, start, end, isSelected) => {
        return {
            style: {
                backgroundColor: "#057DCD",
                color: "white",
                border: "none",
                borderRadius: "0.375rem", // similar to Tailwind rounded
                padding: "0.25rem",
                fontWeight: "100",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s",
                overflowY: "auto",
                whiteSpace: "normal",
            },
            onMouseOver: e => (e.currentTarget.style.transform = "scale(1.02)"),
            onMouseOut: e => (e.currentTarget.style.transform = "scale(1)"),
        };
    };


    // Event renderers
    const eventRenderer = ({ event }) => (
        <span>{event.agendaTitle || event.title}</span>
    );
    const monthEventRenderer = ({ event }) => (
        <span>{event.title}</span>
    );

    // Week event renderer for react-big-calendar
    const weekEventRenderer = ({ event }) => (
        <span>{event.agendaTitle || event.title}</span>
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg" style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#DDE8F2' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                views={['month', 'agenda']}
                formats={{
                    eventTimeRangeFormat: () => ""
                }}
                components={{
                    toolbar: CustomToolbar,
                    week: { event: weekEventRenderer },
                    month: { event: monthEventRenderer },
                    agenda: { event: eventRenderer },
                }}
                eventPropGetter={eventPropGetter}
            />
        </div>
    );
}

export default AppointmentsCalendar;
