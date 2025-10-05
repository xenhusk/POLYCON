import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../apiConfig';
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
import AdminConsultationCalendar from './AdminConsultationCalendar';

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
  // All hooks at the top
  const [isMobile, setIsMobile] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user details
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      fetch(`${API_URL}/user/get_user?email=${email}`)
        .then(res => res.json())
        .then(data => setUserDetails(data))
        .catch(err => console.error('Error fetching user details:', err));
    }
  }, []);

  const userRole = localStorage.getItem('userRole');
  const PolyconLogo = require('./icons/Polycon.svg').ReactComponent;
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
    return "";
  };

  // Use conditional rendering for blocking message
  const shouldBlockAdminMobile = userRole === 'admin' && isMobile;

  // Prevent scrolling when mobile block is active
  useEffect(() => {
    if (shouldBlockAdminMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [shouldBlockAdminMobile]);
          <button
            className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
  // ...existing code...
  useEffect(() => {
    // Fetch available semesters
    fetch(`${API_URL}/homeadmin/semesters`)
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
    fetch(`${API_URL}/homeadmin/stats?${params}`)
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
    fetch(`${API_URL}/homeadmin/consultations_by_date?${params}`)
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
    fetch(`${API_URL}/bookings/get_all_bookings_admin`)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
      {/* Hero Section - Hidden for admin on mobile */}
      {!shouldBlockAdminMobile && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative py-16 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]" />
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Floating Elements */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-15"
          />
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Welcome, {userDetails?.firstName} {userDetails?.lastName}
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mb-2">
                Admin Dashboard
              </p>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Oversee system operations, manage users, and monitor consultation activities
              </p>
            </motion.div>
          </div>
        </motion.section>
      )}

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col items-center min-h-screen relative">
            {/* Blocking message for admin on mobile/tablet */}
            {shouldBlockAdminMobile ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center w-screen h-screen bg-[#005B98] z-50 overflow-hidden">
          <PolyconLogo style={{ height: '200px', width: 'auto', marginBottom: '24px' }} />
          <h3 className="text-2xl font-bold text-white mb-4 mx-9 text-center">Faculty Portal Unavailable on Mobile/Tablet</h3>
          <p className="text-white mb-6 mx-9 text-center">For security and usability, please use a desktop or laptop to access admin features.</p>
          <button
            className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          {/* Settings gear icon - same as HomeStudent */}
          <div className="-top-6 right-6 absolute z-20">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white p-2 sm:p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
              aria-label="Toggle filters"
            >
              <svg 
                className={`w-6 h-6 text-[#0065A8] transition-transform duration-500 ${showFilters ? 'transform -rotate-180' : ''}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* Filter Panel - Updated styling */}
          {showFilters && (
            <div className="fixed top-20 right-6 bg-white shadow-xl rounded-lg border border-gray-200 z-10 transition-all duration-500 transform translate-x-0 opacity-100 p-4 w-80">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0065A8]">Filter Data</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Filter Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={selectedSemester || ''}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent"
                  >
                    <option value="">All Semesters</option>
                    {Array.from(new Set(semesters.map(s => s.semester)))
                      .map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
                  <select
                    value={selectedSchoolYear || ''}
                    onChange={(e) => setSelectedSchoolYear(e.target.value)}
                    className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {Array.from(new Set(semesters.map(s => s.school_year)))
                      .map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Stats containers - Updated layout with titles */}
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-10 px-4 sm:px-6 lg:px-10 pb-0">
            <div className="flex-1 bg-[#0088FF] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
              <div className="flex flex-col">
                <p className="text-sm mb-2 text-left">Total Consultations:</p>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.total_consultations}</span>
                  <span className="text-base sm:text-lg">Consultations</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#fc6969] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
              <div className="flex flex-col">
                <p className="text-sm mb-2 text-left">Total Consultation Hours:</p>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.total_hours}</span>
                  <span className="text-base sm:text-lg">Hours</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#00D1B2] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
              <div className="flex flex-col">
                <p className="text-sm mb-2 text-left">Unique Students:</p>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.unique_students}</span>
                  <span className="text-base sm:text-lg">Students</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section - Updated layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 w-full">
            {/* Consultation Graph */}
            <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-lg shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-[#397de2] text-center mb-4">Consultations Over Time</h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consultationData}>
                    <CartesianGrid vertical={false} stroke="#D3D3D3" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      dy={20}
                      tickFormatter={(date) => {
                          // Use shorter month format on small screens
                          const options = window.innerWidth < 640 ? 
                              { month: 'numeric' } : 
                              { month: 'short', year: 'numeric' };
                          return new Date(date).toLocaleDateString('en-US', options);
                      }} 
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => Math.round(value)} 
                      allowDecimals={false} 
                      domain={[0, 'dataMax']}
                      width={30} // Fixed width to avoid layout shifts
                    />
                    <Tooltip />
                    <Legend 
                      align="center" 
                      verticalAlign="bottom"
                      wrapperStyle={{ 
                          paddingTop: '10px',
                          fontSize: window.innerWidth < 640 ? '12px' : '14px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consultations" 
                      stroke="#397de2" 
                      strokeWidth={2} 
                      name="Consultations"
                      dot={{ r: 3 }} // Smaller dots on mobile
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hours Graph */}
            <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-lg shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-[#fc6969] text-center mb-4">Consultation Hours Over Time</h2>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consultationHoursData}>
                    <CartesianGrid vertical={false} stroke="#D3D3D3" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      dy={20}
                      tickFormatter={(date) => {
                          // Use shorter month format on small screens
                          const options = window.innerWidth < 640 ? 
                              { month: 'numeric' } : 
                              { month: 'short', year: 'numeric' };
                          return new Date(date).toLocaleDateString('en-US', options);
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(minutes) => {
                          const hh = Math.floor(minutes / 60);
                          const mm = minutes % 60;
                          return `${hh}:${mm.toString().padStart(2, '0')}`;
                      }}
                      width={40} // Fixed width for time values
                    />
                    <Tooltip 
                      formatter={(value) => {
                          const hh = Math.floor(value / 60);
                          const mm = value % 60;
                          return [`${hh}:${mm.toString().padStart(2, '0')}`, "Hours"];
                      }}
                    />
                    <Legend 
                      align="center" 
                      verticalAlign="bottom"
                      wrapperStyle={{ 
                          paddingTop: '10px',
                          fontSize: window.innerWidth < 640 ? '12px' : '14px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consultation_hours" 
                      stroke="#fc6969" 
                      strokeWidth={2} 
                      name="Consultation Hours"
                      dot={{ r: 3 }} // Smaller dots on mobile
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};


export default HomeAdmin;

