import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReactModal from 'react-modal'; // Add this import
import './Calendar.css'; // Add this import

const localizer = momentLocalizer(moment);

// Add CustomToolbar component
const CustomToolbar = ({ label, onNavigate, onView, view, views }) => {
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
};

const HomeAdmin = () => {
  const [stats, setStats] = useState({ total_hours: "0.00", total_consultations: 0, students_enrolled: 0 });
  const [consultationData, setConsultationData] = useState([]);
  const [consultationHoursData, setConsultationHoursData] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // NEW: state for modal event details
  const [latestSemester, setLatestSemester] = useState(null); // NEW state for latest semester
  const navigate = useNavigate();

  // Compute current month info for labels if desired
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    // Fetch stats (which now includes latestSemester data)
    fetch(`http://localhost:5001/homeadmin/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({
          total_hours: data.total_hours ? data.total_hours.toFixed(2) : "0.00",
          total_consultations: data.total_consultations || 0,
          students_enrolled: data.students_enrolled || 0
        });
        setLatestSemester(data.latestSemester); // Use latestSemester from stats response
      })
      .catch(err => console.error("Error fetching stats:", err));

    fetch(`http://localhost:5001/homeadmin/consultations_by_date`)
      .then(res => res.json())
      .then(data => {
        const consultationsArr = Object.entries(data.consultations || {})
          .map(([date, count]) => ({ date, consultations: count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-5); // select last 5 (oldest -> latest)

        const hoursArr = Object.entries(data.consultation_hours || {})
          .map(([date, duration]) => {
            const [hh, mm] = duration.split(':').map(Number);
            return { date, consultation_hours: hh * 60 + mm };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-5); // select last 5 (oldest -> latest)

        setConsultationData(consultationsArr);
        setConsultationHoursData(hoursArr);
      })
      .catch(err => console.error("Error fetching consultation data:", err));
  }, []); // Run once on mount

  useEffect(() => {
    fetch(`http://localhost:5001/bookings/get_all_bookings_admin`)
      .then(res => res.json())
      .then(data => {
        console.log('Raw booking data:', data); // Debug log
        const events = data
          .filter(booking => booking.status !== "canceled")
          .map(booking => {
            // Use schedule if non-empty, otherwise fallback to created_at or current date
            const dateStr = booking.schedule || booking.created_at || new Date().toISOString();
            const start = new Date(dateStr);
            const end = new Date(dateStr);
            end.setHours(end.getHours() + 1);
            
            // Updated colors to match AppointmentsCalendar style
            const backgroundColor = booking.status.toLowerCase() === "pending" 
              ? "#FFB800" // Brighter yellow for better visibility
              : "#057DCD"; // Blue color from Calendar.css
            
            const event = {
              title: `${booking.teacherName} with ${booking.studentDisplay}`,
              start,
              end,
              status: booking.status,
              venue: booking.venue || 'TBA',
              backgroundColor,
              borderColor: 'transparent',
              allDay: false
            };
            console.log('Created event:', event); // Debug log
            return event;
          });
        
        setAdminEvents(events);
      })
      .catch(err => console.error("Error fetching admin bookings:", err));
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-3xl font-bold text-[#0065A8] mb-6">Admin Dashboard</h1>
      
      {/* Stats Section */}
      <div className="flex gap-4 w-full p-10 pb-0">
        <div className="flex-1 bg-[#0088FF] text-white rounded-lg shadow-lg px-6 py-4">
          <div className="flex flex-col">
            <p className="text-sm mb-2 text-left">Total Consultations ({monthName}):</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.total_consultations}</span>
              <span className="text-lg">Consultations</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#FF7171] text-white rounded-lg shadow-lg px-6 py-4">
          <div className="flex flex-col">
            <p className="text-sm mb-2 text-left">Total Consultation Hours ({monthName}):</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.total_hours}</span>
              <span className="text-lg">Hours</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#00D1B2] text-white rounded-lg shadow-lg px-6 py-4">
          <div className="flex flex-col">
            {/* NEW: Use latestSemester data in the label if available */}
            <p className="text-sm mb-2 text-left">
              Enrolled Student {latestSemester ? `(${latestSemester.semester} Semester, ${latestSemester.school_year})` : ""}
            </p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.students_enrolled}</span>
              <span className="text-lg">Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-2 gap-6 p-10">
        <div className="bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-blue-500 text-center mb-4">Consultations Over Time</h2>
          <ResponsiveContainer width="105%" height={300}>
            <LineChart data={consultationData}>
              <CartesianGrid vertical={false} stroke="#D3D3D3" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                dy={20}
                tickFormatter={(date) => date}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => Math.round(value)}
                allowDecimals={false}
              />
              <Tooltip />
              <Legend align="left" wrapperStyle={{ textAlign: 'left', marginTop: '20px', marginBottom: '-20px'}}/>
              <Line type="monotone" dataKey="consultations" stroke="#3B82F6" strokeWidth={3} name="Consultations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-500 text-center mb-4">Consultation Hours Over Time</h2>
          <ResponsiveContainer width="105%" height={300}>
            <LineChart data={consultationHoursData}>
              <CartesianGrid vertical={false} stroke="#D3D3D3" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                dy={20}
                tickFormatter={(date) => date}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(minutes) => {
                  const hh = Math.floor(minutes / 60);
                  const mm = minutes % 60;
                  return `${hh}:${mm.toString().padStart(2, '0')}`;
                }}
              />
              <Tooltip formatter={(value) => {
                const hh = Math.floor(value / 60);
                const mm = value % 60;
                return [`${hh}:${mm.toString().padStart(2, '0')}`, "Consultation Hours"];
              }} />
              <Legend align="left" wrapperStyle={{ textAlign: 'left', marginTop: '20px', marginBottom: '-20px'}}/>
              <Line type="monotone" dataKey="consultation_hours" stroke="#EF4444" strokeWidth={3} name="Consultation Hours" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 w-full">
        <h2 className="text-2xl font-bold text-[#0065A8] mb-4 text-center">Booking Calendar</h2>
        <div className="bg-white p-4 rounded-lg shadow-lg" style={{ height: 700 }}>
          <Calendar 
            localizer={localizer}
            events={adminEvents}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day']}
            defaultView='month'
            onSelectEvent={event => setSelectedEvent(event)}  // NEW: open modal on event click
            components={{
              toolbar: CustomToolbar,
              week: { 
                event: ({ event }) => {
                  const startTime = new Date(event.start).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  });
                  return <span>{startTime}</span>;
                }
              }
            }}
            eventPropGetter={event => ({
              style: {
                backgroundColor: event.backgroundColor,
                color: event.backgroundColor === "#FFB800" ? "#F4D03F" : "white",
                border: "none",
                borderRadius: "4px",
                padding: "0.25rem",
                fontWeight: "100",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s",
                overflowY: "auto",
                whiteSpace: "normal",
              },
              onMouseOver: e => (e.currentTarget.style.transform = "scale(1.02)"),
              onMouseOut: e => (e.currentTarget.style.transform = "scale(1)")
            })}
            tooltipAccessor={event => `Status: ${event.status}\nVenue: ${event.venue}`}
            formats={{
              eventTimeRangeFormat: () => '', // Hide the time range in month view
              timeGutterFormat: (date, culture, localizer) => 
                localizer.format(date, 'HH:mm', culture)
            }}
          />
        </div>
      </div>

      {/* NEW: Modal to display event details */}
      <ReactModal 
        isOpen={!!selectedEvent} 
        onRequestClose={() => setSelectedEvent(null)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
        overlayClassName="Overlay"
        ariaHideApp={false}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <p className="mb-4">{selectedEvent?.title}</p>
          <button 
            onClick={() => setSelectedEvent(null)} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </ReactModal>
    </div>
  );
};

export default HomeAdmin;
