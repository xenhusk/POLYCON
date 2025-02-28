import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css'; // Add this import after the default styles

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

    // Simple front-end cache: using localStorage as an example (cached for 30 seconds)
    const fetchCalendarData = async () => {
        const studentID = localStorage.getItem('studentID');
        if (!studentID) {
            return;
        }
        const cacheKey = 'appointmentsCalendar';
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, expiry } = JSON.parse(cached);
            if (Date.now() < expiry) {
                setCalendarData(data);
                return;
            }
        }
        try {
            const response = await fetch(`http://localhost:5001/bookings/get_bookings?role=student&userID=${studentID}&status=confirmed`, {
                cache: 'force-cache'
            });
            const data = await response.json();
            setCalendarData(data);
            localStorage.setItem(cacheKey, JSON.stringify({ data, expiry: Date.now() + 30000 }));
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        }
    };

    useEffect(() => {
        fetchCalendarData();
        const intervalId = setInterval(fetchCalendarData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            const storedEmail = localStorage.getItem('userEmail');
            if (storedEmail) {
                try {
                    const response = await fetch(`http://localhost:5001/account/get_user_role?email=${storedEmail}`);
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
                        // Updated endpoint: add booking prefix to URL
                        const response = await fetch(`http://localhost:5001/bookings/get_bookings?role=student&userID=${studentID}&status=confirmed`, {
                            cache: 'force-cache'
                        });
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
                        // Updated endpoint: add booking prefix to URL
                        const response = await fetch(`http://localhost:5001/bookings/get_bookings?role=faculty&userID=${teacherID}&status=confirmed`);
                        const bookings = await response.json();
                        const events = bookings.map(booking => {
                            const studentNamesString = booking.studentNames.join(", ");
                            return {
                                title: studentNamesString,
                                start: new Date(booking.schedule),
                                end: new Date(booking.schedule), // Same as start time for events without duration
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

    const eventRenderer = ({ event }) => {
        return (
            <span>
                {event.agendaTitle || event.title}
            </span>
        );
    };

    const monthEventRenderer = ({ event }) => {
        return (
            <span>
                {event.title}
            </span>
        );
    };

    const weekEventRenderer = ({ event }) => {
        // Only display the formatted start time

        const startTime = new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return <span>{startTime}</span>;
      };
      

    return (
        // UPDATED: Increase container maxWidth and update background if needed
        <div className="bg-white p-4 rounded-lg shadow-lg" style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#DDE8F2' }}>
            <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            // UPDATED: Increase calendar height from 500 to 700
            style={{ height: 700 }}
            views={['month', 'agenda']} // Re-enable all views
            formats={{
                // Disable the default time range formatter so that it doesn’t output “start - end”
                eventTimeRangeFormat: () => ""
            }}
            components={{
                // Use the new custom toolbar
                toolbar: CustomToolbar,
                week: { event: weekEventRenderer }
                // ...existing month and agenda renderers if needed...
            }}
            eventPropGetter={eventPropGetter}
            />
        </div>
    );
}

export default AppointmentsCalendar;
