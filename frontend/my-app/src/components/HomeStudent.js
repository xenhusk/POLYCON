import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import API_URL from '../apiConfig';
import FeedbackPopup from './FeedbackPopup';
import { useToast } from '../contexts/ToastContext';

const HomeStudent = () => {
  const [studentId, setStudentId] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total_consultations: 0,
    total_hours: "0.00",
    latest_topic: "No recent consultations"  // Changed from latest_topics array
  });
  const [consultationData, setConsultationData] = useState([]);
  const [consultationHoursData, setConsultationHoursData] = useState([]);
  
  // Feedback popup state
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackSessionData, setFeedbackSessionData] = useState(null);

  // Note: Automatic feedback checking removed - feedback will only be triggered by teacher finalizing consultation


  // Polling-based feedback check (replaces Socket.IO)
  const checkForFeedbackOpportunity = async () => {
    try {
      const response = await fetch(`${API_URL}/feedback/check_pending?student_id=${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.has_pending_feedback && data.session_data) {
          setFeedbackSessionData({
            sessionId: data.session_data.session_id,
            teacherId: data.session_data.teacher_id,
            studentId: data.session_data.student_id,
            sessionDate: data.session_data.session_date,
            teacherName: data.session_data.teacher_name,
            program: data.session_data.program,
            yearSection: data.session_data.year_section,
            summary: data.session_data.summary,
            concern: data.session_data.concern
          });
          setShowFeedbackPopup(true);
        }
      }
    } catch (error) {
      console.error('Error checking for feedback:', error);
    }
  };

  const handleFeedbackSubmitted = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    setShowFeedbackPopup(false);
    setFeedbackSessionData(null);
  };

  useEffect(() => {
    const storedStudentID = localStorage.getItem('studentID');
    if (storedStudentID) {
      setStudentId(storedStudentID);
    }
    
    // Note: Automatic feedback checking removed - feedback will only be triggered by teacher finalizing consultation

    // Fetch semesters for filtering
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
    if (!studentId || !selectedSemester || !selectedSchoolYear) return;

    const params = new URLSearchParams({
      student_id: studentId,
      semester: selectedSemester,
      school_year: selectedSchoolYear
    });

    // Fetch student stats
    fetch(`${API_URL}/homestudent/stats?${params}`)
      .then(res => res.json())
      .then(data => {
        setStats({
          total_consultations: data.total_consultations || 0,
          total_hours: (isNaN(Number(data.total_hours)) ? 0 : Number(data.total_hours)).toFixed(2),
          latest_topic: data.latest_topic || "No recent consultations"
        });
      })
      .catch(err => console.error("Error fetching stats:", err));
    // Fetch consultation data for charts
    fetch(`${API_URL}/homestudent/consultations_by_date?${params}`)
      .then(res => res.json())
      .then(data => {
        const formattedConsultations = Object.entries(data.consultations || {})
          .map(([date, count]) => ({ date, consultations: count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-5);

        const formattedHours = Object.entries(data.consultation_hours || {})
          .map(([date, hours]) => {
            const [hh, mm] = hours.split(':').map(Number);
            const totalMinutes = hh * 60 + mm;
            return { date, consultation_hours: isNaN(totalMinutes) ? 0 : totalMinutes };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-5);

        setConsultationData(formattedConsultations);
        setConsultationHoursData(formattedHours);
      })
      .catch(err => console.error("Error fetching consultation data:", err));
  }, [studentId, selectedSemester, selectedSchoolYear]);

  // Get socket from ToastContext
  const { socket } = useToast();

  // Polling-based feedback check (replaces Socket.IO)
  useEffect(() => {
    const studentId = localStorage.getItem('studentID');
    if (!studentId) return;

    // Initial check
    checkForFeedbackOpportunity();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      checkForFeedbackOpportunity();
    }, 30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [studentId]);

  // Socket connection for feedback triggers (fallback)
  useEffect(() => {
    const studentId = localStorage.getItem('studentID');
    if (!studentId || !socket) return;

    console.log(`🔌 Using existing socket connection (fallback)`);
    console.log(`🔌 Socket connected state:`, socket.connected);
    console.log(`🔌 Socket ID:`, socket.id);
    console.log(`🔌 Socket type:`, typeof socket);
    console.log(`🔌 Socket object:`, socket);
    
    // Wait for socket to connect if not already connected
    if (!socket.connected) {
      console.log(`🔌 Socket not connected, waiting for connection...`);
      socket.on('connect', () => {
        console.log(`🔌 Socket connected in HomeStudent!`);
        console.log(`🔌 Socket ID after connect:`, socket.id);
      });
    }

    // Listen for consultation started
    socket.on('consultation_started', (data) => {
      console.log('🎯 Consultation started received:', data);
      console.log('🎯 Current student ID:', studentId);
      console.log('🎯 Started student IDs:', data.student_ids);
      console.log('🎯 Is student in list:', data.student_ids && data.student_ids.includes(studentId));
      
      // Check if this student is in the list of students for this consultation
      if (data.student_ids && data.student_ids.includes(studentId)) {
        console.log('✅ Consultation started is for this student - preparing for feedback');
        // Store session data for later feedback
        setFeedbackSessionData({
          sessionId: data.sessionID,
          teacherId: data.teacher_id,
          studentId: studentId
        });
        console.log('📝 Session data stored, waiting for feedback trigger...');
      } else {
        console.log('❌ Consultation started is not for this student');
      }
    });

    // Listen for feedback trigger
    socket.on('feedback_trigger', (data) => {
      console.log('🔔 Feedback trigger received:', data);
      console.log('🔔 Current student ID:', studentId);
      console.log('🔔 Trigger student IDs:', data.student_ids);
      console.log('🔔 Is student in list:', data.student_ids && data.student_ids.includes(studentId));
      
      // Check if this student is in the list of students for this consultation
      if (data.student_ids && data.student_ids.includes(studentId)) {
        console.log('✅ Feedback trigger is for this student - showing popup');
        setFeedbackSessionData({
          sessionId: data.sessionID,
          teacherId: data.teacher_id,
          studentId: studentId,
          sessionDate: data.session_date,
          teacherName: data.teacher_name,
          program: data.program,
          yearSection: data.year_section,
          summary: data.summary,
          concern: data.concern
        });
        setTimeout(() => {
          console.log('🎯 Showing feedback popup now!');
          setShowFeedbackPopup(true);
        }, 2000); // Show after 2 seconds
      } else {
        console.log('❌ Feedback trigger is not for this student');
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('consultation_started');
      socket.off('feedback_trigger');
    };
  }, [socket]);

  return (
    <div className="flex flex-col items-center min-h-screen relative">
      <h1 className="text-3xl font-bold text-[#0065A8] mb-[4rem] ">Student Dashboard</h1>

      {/* Settings gear icon - same as HomeTeacher */}
      <div className="absolute top-6 right-6">
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

      {/* Stats containers - Updated layout with titles */}
      <div className="flex flex-col sm:flex-row gap-4 w-full px-4 sm:px-6 lg:px-10 pb-0">
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
            <p className="text-sm mb-2 text-left">Latest Topic:</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-xl sm:text-l lg:text-xl text-center font-bold break-words capitalize">{stats.latest_topic}</span>
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


      {/* Feedback Popup */}
      {showFeedbackPopup && feedbackSessionData && (
        <FeedbackPopup
          isOpen={showFeedbackPopup}
          onClose={() => setShowFeedbackPopup(false)}
          consultationSessionId={feedbackSessionData.sessionId}
          studentId={feedbackSessionData.studentId}
          teacherId={feedbackSessionData.teacherId}
          onFeedbackSubmitted={handleFeedbackSubmitted}
          sessionDate={feedbackSessionData.sessionDate}
          teacherName={feedbackSessionData.teacherName}
          program={feedbackSessionData.program}
          yearSection={feedbackSessionData.yearSection}
          summary={feedbackSessionData.summary}
          concern={feedbackSessionData.concern}
        />
      )}
    </div>
  );
};

export default HomeStudent;