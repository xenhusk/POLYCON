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
  // Add new state for semesters and selected semester
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [stats, setStats] = useState({ total_hours: "0.00", total_consultations: 0, unique_students: 0 });
  const [consultationData, setConsultationData] = useState([]);
  const [consultationHoursData, setConsultationHoursData] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // NEW: state for modal event details
  const [latestSemester, setLatestSemester] = useState(null); // NEW state for latest semester
  const [showFilters, setShowFilters] = useState(false); // Add state for filter visibility
  const navigate = useNavigate();

  // Compute current month info for labels if desired
  const getSemesterLabel = () => {
    if (selectedSemester && selectedSchoolYear) {
      return `${selectedSemester} Semester, ${selectedSchoolYear}`;
    }
    return "No semester selected";
  };

  useEffect(() => {
    // Fetch available semesters
    fetch('http://localhost:5001/homeadmin/semesters')
      .then(res => res.json())
      .then(data => {
        setSemesters(data);
        if (data.length > 0) {
          setSelectedSemester(data[0].semester);
          setSelectedSchoolYear(data[0].school_year);
        }
      })
      .catch(err => console.error("Error fetching semesters:", err));
  }, []);

  useEffect(() => {
    if (selectedSemester && selectedSchoolYear) {
      fetchStats();
    }
  }, [selectedSemester, selectedSchoolYear]);

  const fetchStats = () => {
    const params = new URLSearchParams({
      semester: selectedSemester,
      school_year: selectedSchoolYear
    });

    // Fetch stats with semester filter
    fetch(`http://localhost:5001/homeadmin/stats?${params}`)
      .then(res => res.json())
      .then(data => {
        setStats({
          total_hours: data.total_hours ? data.total_hours.toFixed(2) : "0.00",
          total_consultations: data.total_consultations || 0,
          unique_students: data.unique_students || 0
        });
      })
      .catch(err => console.error("Error fetching stats:", err));

    // Fetch consultation data with semester filter
    fetch(`http://localhost:5001/homeadmin/consultations_by_date?${params}`)
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
  };

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
    <div className="flex flex-col items-center min-h-screen p-6 relative">
      <h1 className="text-3xl font-bold text-[#0065A8] mb-6">Admin Dashboard</h1>
      
      {/* Settings gear icon in top right */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
          aria-label="Toggle filters"
        >
          <svg 
            className={`w-6 h-6 text-[#0065A8] transition-transform duration-500 ${showFilters ? 'transform -rotate-180' : ''}`}
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Slide-in filter panel - Now has a close button */}
      <div 
        className={`fixed top-20 right-6 bg-white shadow-xl rounded-lg border border-gray-200 z-10 transition-all duration-500 transform ${
          showFilters ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } p-4 w-80`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#0065A8]">Filter Data</h3>
          {/* Add close button */}
          <button 
            onClick={() => setShowFilters(false)}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              value={selectedSemester || ''}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%230065A8%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:24px] [background-position:right_0.5rem_center] pr-10"
            >
              <option value="">Select Semester</option>
              {Array.from(new Set(semesters.map(s => s.semester))).map(sem => (
                <option key={sem} value={sem}>{sem} Semester</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
            <select
              value={selectedSchoolYear || ''}
              onChange={(e) => setSelectedSchoolYear(e.target.value)}
              className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%230065A8%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:24px] [background-position:right_0.5rem_center] pr-10"
            >
              <option value="">Select School Year</option>
              {Array.from(new Set(semesters.map(s => s.school_year))).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="pt-2">
            <p className="text-sm text-gray-500">
              {selectedSemester && selectedSchoolYear 
                ? `Viewing data for ${selectedSemester} Semester, ${selectedSchoolYear}` 
                : "Select filters to view specific data"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex gap-4 w-full p-10 pb-0">
        <div className="flex-1 bg-[#0088FF] text-white rounded-lg shadow-lg px-6 py-4">
          <div className="flex flex-col">
            <p className="text-sm mb-2 text-left">Total Consultations:</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.total_consultations}</span>
              <span className="text-lg">Consultations</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#FF7171] text-white rounded-lg shadow-lg px-6 py-4">
          <div className="flex flex-col">
            <p className="text-sm mb-2 text-left">Total Consultation Hours:</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.total_hours}</span>
              <span className="text-lg">Hours</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#00D1B2] text-white rounded-lg shadow-lg px-6 py-4">
          <div className="flex flex-col">
            <p className="text-sm mb-2 text-left">Total Number of Students Consulted:</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.unique_students}</span>
              <span className="text-lg">Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-2 w-full gap-6 p-10">
        <div className="bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#0065A8] text-center mb-4">Consultations Over Time</h2>
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

      </div>
  );
};

export default HomeAdmin;
