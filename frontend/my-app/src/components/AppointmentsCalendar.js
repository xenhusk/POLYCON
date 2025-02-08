import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function AppointmentsCalendar() {
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState('');

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
                console.log('Student ID:', studentID);
                if (studentID) {
                    try {
                        const response = await fetch(`http://localhost:5001/bookings/get_student_bookings?studentID=${studentID}`);
                        const bookings = await response.json();
                        const events = await Promise.all(bookings.map(async booking => {
                            const teacherResponse = await fetch(`http://localhost:5001/user/get_user?userID=${booking.teacherID.split('/').pop()}`);
                            const teacherData = await teacherResponse.json();
                            const teacherName = `Prof. ${teacherData.firstName} ${teacherData.lastName}`;
                            return {
                                title: teacherName,
                                start: new Date(booking.schedule),
                                end: new Date(booking.schedule), // Same as start time for events without duration
                                allDay: false,
                                agendaTitle: `Appointment with ${teacherName}`,
                            };
                        }));
                        setEvents(events);
                        console.log('Student bookings:', bookings);
                    } catch (error) {
                        console.error('Error fetching student bookings:', error);
                    }
                }
            } else if (userRole === 'faculty') {
                const teacherID = localStorage.getItem('teacherID');
                console.log('Teacher ID:', teacherID);
                if (teacherID) {
                    try {
                        const response = await fetch(`http://localhost:5001/bookings/get_teacher_bookings?teacherID=${teacherID}`);
                        const bookings = await response.json();
                        const events = bookings.map(booking => {
                            const studentNamesString = booking.studentNames.map(name => {
                                const match = name.match(/^(.*) (.*) \((.*) (.*)\)$/);
                                if (match) {
                                    const [, firstName, lastName, program, yearSection] = match;
                                    return `${firstName} ${lastName} (${program} ${yearSection})`;
                                }
                                return name;
                            }).join(", ");
                            return {
                                title: studentNamesString,
                                start: new Date(booking.schedule),
                                end: new Date(booking.schedule), // Same as start time for events without duration
                                allDay: false,
                                agendaTitle: `Appointment with ${studentNamesString}`,
                            };
                        });
                        setEvents(events);
                        console.log('Teacher bookings:', bookings);
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

    const eventPropGetter = (event, start, end, isSelected) => {
        return {
            title: event.agendaTitle || event.title,
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
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            formats={{
                // Disable the default time range formatter so that it doesn’t output “start - end”
                eventTimeRangeFormat: () => ""
            }}
            components={{
                // Use your custom event renderer for week view that shows only the formatted start time.
                week: {
                event: ({ event }) => {
                    const startTime = new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    return <span>{startTime}</span>;
                }
                }
                // You can leave your month and agenda renderers as is, or customize them similarly.
            }}
            />
        </div>
    );
}

export default AppointmentsCalendar;
