import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const AdminConsultation = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState({ semester: '', school_year: '' });

  useEffect(() => {
    fetchSemesters();
    fetchLeaderboardData();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await fetch(`${API_URL}/homeadmin/semesters`);
      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
        // Set current semester as default if available
        if (data.length > 0) {
          const current = data[0]; // Assuming first is most recent
          setSelectedSemester({
            semester: current.semester,
            school_year: current.school_year
          });
        }
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchLeaderboardData = async (semester = null, schoolYear = null) => {
    setLoading(true);
    setError('');
    
    try {
      let url = `${API_URL}/homeadmin/teacher_leaderboard`;
      const params = new URLSearchParams();
      
      if (semester && schoolYear) {
        params.append('semester', semester);
        params.append('school_year', schoolYear);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sort by total consultations descending
      data.sort((a, b) => b.total_consultations - a.total_consultations);
      
      setLeaderboardData(data);
    } catch (err) {
      setError('Failed to fetch leaderboard data: ' + err.message);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    const [semester, schoolYear] = e.target.value.split('|');
    setSelectedSemester({ semester, school_year: schoolYear });
    fetchLeaderboardData(semester, schoolYear);
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const closeModal = () => {
    setSelectedTeacher(null);
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };

  const closeSessionModal = () => {
    setSelectedSession(null);
  };

  const getRankIcon = (index) => {
    return `#${index + 1}`;
  };

  if (loading && leaderboardData.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        <div className="flex flex-col items-center justify-center h-96 gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0065A8] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#057DCD] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-slate-700 mb-2">Loading Teacher Leaderboard</p>
            <p className="text-slate-500">Gathering consultation data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col">
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-[#0065A8] text-4xl font-bold mb-2">Teachers Consultation Leaderboard</h1>
        <p className="text-slate-500 text-lg">Top teachers ranked by consultation engagement</p>
      </div>

      {/* Semester Filter */}
      <div className="mb-8 flex-shrink-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden max-w-6xl mx-auto">
          {/* Filter Header */}
          <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Filter Options</h3>
                <p className="text-blue-100 text-sm">Select semester to view specific data</p>
              </div>
            </div>
          </div>
          
          {/* Filter Content */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Label Section */}
              <div className="flex items-center min-w-[180px]">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <label htmlFor="semester-select" className="font-bold text-gray-800 text-lg">
                  Academic Period:
                </label>
              </div>
              
              {/* Select Section */}
              <div className="flex-1 w-full lg:w-auto lg:min-w-[320px]">
                <div className="relative">
                  <select 
                    id="semester-select"
                    value={`${selectedSemester.semester}|${selectedSemester.school_year}`}
                    onChange={handleSemesterChange}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-[#0065A8]/20 rounded-xl text-base font-medium text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#0065A8] focus:ring-4 focus:ring-[#0065A8]/20 focus:bg-white hover:border-[#057DCD] hover:shadow-lg appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230065A8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="|" className="py-2 px-4 bg-white text-gray-800">
                      All Semesters
                    </option>
                    {semesters.map((sem, index) => (
                      <option 
                        key={index} 
                        value={`${sem.semester}|${sem.school_year}`}
                        className="py-2 px-4 bg-white text-gray-800"
                      >
                        {sem.semester} {sem.school_year}
                        {index === 0 ? ' (Current)' : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Custom dropdown indicator overlay */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-6 h-6 bg-[#0065A8] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Selected Info */}
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-green-600 text-xs">✓</span>
                  </span>
                  <span>
                    {selectedSemester.semester && selectedSemester.school_year 
                      ? `Showing data for ${selectedSemester.semester} ${selectedSemester.school_year}`
                      : 'Showing data for all academic periods'
                    }
                  </span>
                </div>
              </div>
              
              {/* Quick Stats - Fixed width */}
              <div className="flex flex-col lg:flex-row gap-4 lg:ml-6 w-full lg:w-[240px]">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200 flex-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#057DCD]">
                      {leaderboardData.length > 0 ? leaderboardData.length : '0'}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Teachers</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200 flex-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#057DCD]">
                      {leaderboardData.length > 0 
                        ? leaderboardData.reduce((sum, teacher) => sum + teacher.total_consultations, 0)
                        : '0'
                      }
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Total Sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4 border border-red-200 flex-shrink-0">
          {error}
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0065A8] rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-[#057DCD] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700 mb-2">Loading Data...</p>
              <p className="text-slate-500 text-sm">Fetching consultation statistics</p>
            </div>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-[16rem] py-10">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-xl font-medium mb-2">No consultation data available</p>
            <p className="text-slate-400 text-sm">Try selecting a different semester or check back later.</p>
          </div>
        ) : (
          <>
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6">
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Teacher Rankings</h3>
                    <p className="text-blue-100 text-sm">Ranked by consultation activity</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{leaderboardData.length}</div>
                  <div className="text-blue-100 text-sm">Teachers</div>
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto">
              {leaderboardData.map((teacher, index) => (
                <div 
                  key={teacher.teacher_id} 
                  className={`
                    relative flex flex-col lg:flex-row items-start lg:items-center p-6 border-b border-gray-100 cursor-pointer 
                    transition-all duration-300 group hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
                    ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'}
                    ${index === 0 ? 'border-l-4 border-l-yellow-400' : ''}
                    ${index === 1 ? 'border-l-4 border-l-gray-400' : ''}
                    ${index === 2 ? 'border-l-4 border-l-amber-600' : ''}
                    last:border-b-0
                  `}
                  onClick={() => handleTeacherClick(teacher)}
                >
                  {/* Rank Section */}
                  <div className="flex items-center mb-4 lg:mb-0 lg:mr-6">
                    <div className={`
                      flex items-center justify-center w-14 h-14 rounded-full font-bold text-lg
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' : ''}
                      ${index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg' : ''}
                      ${index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg' : ''}
                      ${index > 2 ? 'bg-gradient-to-br from-slate-500 to-slate-700 text-white' : ''}
                    `}>
                      {getRankIcon(index)}
                    </div>
                  </div>

                  {/* Teacher Info Section */}
                  <div className="flex-1 lg:mr-8 mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#0065A8] transition-colors">
                        {teacher.teacher_name}
                      </h3>
                    </div>
                    <p className="text-slate-500 text-sm">Teacher ID: {teacher.teacher_id}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-6 mb-4 lg:mb-0 w-full lg:w-auto">
                    <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 group-hover:border-blue-200 transition-colors">
                      <div className="text-2xl font-bold text-[#057DCD] mb-1">{teacher.total_consultations}</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 group-hover:border-blue-200 transition-colors">
                      <div className="text-2xl font-bold text-[#057DCD] mb-1">{teacher.total_students}</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Students</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 group-hover:border-blue-200 transition-colors">
                      <div className="text-2xl font-bold text-[#057DCD] mb-1">{teacher.total_duration_formatted}</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Duration</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center lg:ml-6">
                    <div className="flex items-center text-[#057DCD] font-medium text-sm group-hover:text-[#0065A8] transition-colors">
                      <span className="mr-2">View Details</span>
                      <div className="transform group-hover:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#0065A8]/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6 relative">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedTeacher.teacher_name}</h2>
                  <p className="text-blue-100 text-lg">Detailed Consultation Statistics</p>
                </div>
                <button 
                  className="bg-white/20 hover:bg-white/30 border-0 text-white cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-xl font-bold" 
                  onClick={closeModal}
                >×</button>
              </div>
              
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{selectedTeacher.total_consultations}</div>
                  <div className="text-sm text-blue-100">Total Consultations</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{selectedTeacher.total_students}</div>
                  <div className="text-sm text-blue-100">Students Helped</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{selectedTeacher.total_duration_formatted}</div>
                  <div className="text-sm text-blue-100">Total Time</div>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-[#0065A8] text-white rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Consultation Sessions
                </h3>
                
                {selectedTeacher.sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-lg">No consultation sessions available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectedTeacher.sessions.map((session, index) => (
                      <div 
                        key={session.id} 
                        className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#0065A8] text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-lg">
                                {new Date(session.date).toLocaleDateString('en-US', { 
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-slate-500 text-sm">
                                {new Date(session.date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-[#057DCD] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">Duration:</span>
                            <span className="text-sm font-bold text-[#057DCD] bg-blue-100 px-2 py-1 rounded-full">
                              {session.duration || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">Students:</span>
                            <span className="text-sm font-bold text-[#057DCD] bg-blue-100 px-2 py-1 rounded-full">
                              {session.student_count}
                            </span>
                          </div>
                          {session.summary && (
                            <div className="mt-3 p-3 bg-white/80 rounded-lg">
                              <p className="text-sm text-slate-700 line-clamp-2">
                                {session.summary.substring(0, 80)}...
                              </p>
                              <div className="text-xs text-[#057DCD] mt-2 font-medium">Click to read full summary →</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={closeSessionModal}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Session Modal Header */}
            <div className="bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Consultation Session Details</h3>
                  <p className="text-blue-100">
                    {new Date(selectedSession.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(selectedSession.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button 
                  className="bg-white/20 hover:bg-white/30 border-0 text-white cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-xl font-bold" 
                  onClick={closeSessionModal}
                >×</button>
              </div>
            </div>
            
            {/* Session Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {/* Session Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-[#057DCD] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-slate-700">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-[#057DCD]">{selectedSession.duration || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-[#057DCD] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-semibold text-slate-700">Students</span>
                  </div>
                  <div className="text-2xl font-bold text-[#057DCD]">{selectedSession.student_count}</div>
                </div>
              </div>
              
              {/* Session Summary */}
              {selectedSession.summary && (
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#057DCD] text-white rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    Session Summary
                  </h4>
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200">
                    <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                      {selectedSession.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsultation;
