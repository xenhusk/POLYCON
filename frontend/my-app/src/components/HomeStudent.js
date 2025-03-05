import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

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

  useEffect(() => {
    const storedStudentID = localStorage.getItem('studentID');
    if (storedStudentID) {
      setStudentId(storedStudentID);
    }

    // Fetch semesters for filtering
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
    if (!studentId || !selectedSemester || !selectedSchoolYear) return;

    const params = new URLSearchParams({
      student_id: studentId,
      semester: selectedSemester,
      school_year: selectedSchoolYear
    });

    // Fetch student stats
    fetch(`http://localhost:5001/homestudent/stats?${params}`)
      .then(res => res.json())
      .then(data => {
        setStats({
          total_consultations: data.total_consultations || 0,
          total_hours: Number(data.total_hours).toFixed(2) || "0.00",
          latest_topic: data.latest_topic || "No recent consultations"
        });
      })
      .catch(err => console.error("Error fetching stats:", err));

    // Fetch consultation data for charts
    fetch(`http://localhost:5001/homestudent/consultations_by_date?${params}`)
      .then(res => res.json())
      .then(data => {
        const formattedConsultations = Object.entries(data.consultations)
          .map(([date, count]) => ({ date, consultations: count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-5);

        const formattedHours = Object.entries(data.consultation_hours)
          .map(([date, hours]) => {
            const [hh, mm] = hours.split(':').map(Number);
            return { date, consultation_hours: hh * 60 + mm };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-5);

        setConsultationData(formattedConsultations);
        setConsultationHoursData(formattedHours);
      })
      .catch(err => console.error("Error fetching consultation data:", err));
  }, [studentId, selectedSemester, selectedSchoolYear]);

  return (
    <div className="flex flex-col items-center min-h-screen relative">
      <h1 className="text-3xl font-bold text-[#0065A8] mb-[4rem] mb-6">Student Dashboard</h1>

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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend align="left" wrapperStyle={{ textAlign: 'left', marginTop: '20px', marginBottom: '-20px'}}/>
                <Line type="monotone" dataKey="consultations" stroke="#397de2" name="Consultations" />
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => {
                    const hours = Math.floor(value / 60);
                    const minutes = value % 60;
                    return `${hours}:${minutes.toString().padStart(2, '0')}`;
                  }}
                />
                <Tooltip 
                  formatter={(value) => {
                    const hours = Math.floor(value / 60);
                    const minutes = value % 60;
                    return [`${hours}:${minutes.toString().padStart(2, '0')}`, "Hours"];
                  }}
                  labelFormatter={(label) => `Date: ${label}`} // This aligns tooltip label to left
                  contentStyle={{ textAlign: 'left' }} // This aligns tooltip content to left
                />
                <Legend align="left" wrapperStyle={{ textAlign: 'left', marginTop: '20px', marginBottom: '-20px'}}/>
                <Line type="monotone" dataKey="consultation_hours" stroke="#fc6969" name="Hours" />
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
    </div>
  );
};

export default HomeStudent;