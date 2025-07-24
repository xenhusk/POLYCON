
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import API_URL from '../apiConfig';

const localizer = momentLocalizer(moment);

// UPDATED: CustomToolbar with better responsive design and improved styling
function CustomToolbar({ label, onNavigate, onView, view, views }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: window.innerWidth < 768 ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#0065A8',
      color: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      gap: window.innerWidth < 768 ? '0.5rem' : '0'
    }}>
      {/* Navigation Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        order: window.innerWidth < 768 ? 2 : 1
      }}>
        <button 
          onClick={() => onNavigate('PREV')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            transition: 'all 0.3s ease',
            marginRight: '0.5rem'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >◀</button>
        
        <button 
          onClick={() => onNavigate('TODAY')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginRight: '0.5rem',
            fontWeight: '500'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >Today</button>
        
        <button 
          onClick={() => onNavigate('NEXT')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >▶</button>
      </div>
      
      {/* Month/Year Label */}
      <span style={{ 
        fontWeight: '600',
        fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
        order: window.innerWidth < 768 ? 1 : 2,
        textAlign: 'center'
      }}>{label}</span>
      
      {/* View Toggle Buttons */}
      <div style={{
        order: window.innerWidth < 768 ? 3 : 3,
        display: 'flex',
        gap: '0.25rem'
      }}>
        {views.map((v) => (
          <button key={v}
            onClick={() => onView(v)}
            style={{
              background: view === v ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              cursor: "pointer",
              transition: 'all 0.3s ease',
              fontWeight: view === v ? '600' : '400',
              fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
            }}
            onMouseOver={(e) => {
              if (view !== v) {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseOut={(e) => {
              if (view !== v) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
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
        <div style={{ 
            width: '100%',
            height: '100vh',
            padding: '1rem',
            backgroundColor: '#f8fafc'
        }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ 
                    height: 'calc(100vh - 2rem)',
                    width: '100%',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                views={['month', 'agenda']}
                defaultView="month"
                formats={{
                    eventTimeRangeFormat: () => "",
                    dayFormat: 'ddd',
                    dayHeaderFormat: 'ddd M/D'
                }}
                components={{
                    toolbar: CustomToolbar,
                    month: { event: monthEventRenderer },
                    agenda: { event: eventRenderer },
                }}
                eventPropGetter={eventPropGetter}
                popup={true}
                popupOffset={30}
            />
        </div>
    );
}

export default AppointmentsCalendar;
