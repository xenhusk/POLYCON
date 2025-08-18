import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import EnrollmentModal from './EnrollmentModal';
import StudentConcernAnalytics from './StudentConcernAnalytics';
import API_URL from '../apiConfig';

const HomeTeacher = () => {
    const [teacherId, setTeacherId] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    
    // Store original filter values for consultation stats
    const [originalSemester, setOriginalSemester] = useState(null);
    const [originalSchoolYear, setOriginalSchoolYear] = useState(null);
    
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({ total_hours: "0.00", total_consultations: 0, unique_students: 0 });
    const [consultationData, setConsultationData] = useState([]);
    const [consultationHoursData, setConsultationHoursData] = useState([]);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [currentStatsView, setCurrentStatsView] = useState(0); // 0 for consultation stats, 1 for student concerns
    const [isTransitioning, setIsTransitioning] = useState(false); // Add transition state
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextStatsView = () => {
        if (isTransitioning) return; // Prevent multiple clicks during transition
        
        setIsTransitioning(true);
        
        // Start transition
        setTimeout(() => {
            if (currentStatsView === 0) {
                // Switching from consultation stats to student concern analytics
                // Store current values as original
                setOriginalSemester(selectedSemester);
                setOriginalSchoolYear(selectedSchoolYear);
                
                // Set filters to "all" for analytics
                setSelectedSemester(null);
                setSelectedSchoolYear(null);
                setSelectedDepartment('all');
            }
            setCurrentStatsView(prev => prev === 0 ? 1 : 0);
            
            // End transition after content loads
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        }, 150);
    };

    const prevStatsView = () => {
        if (isTransitioning) return; // Prevent multiple clicks during transition
        
        setIsTransitioning(true);
        
        // Start transition
        setTimeout(() => {
            if (currentStatsView === 1) {
                // Switching back from student concern analytics to consultation stats
                // Restore original filter values
                setSelectedSemester(originalSemester);
                setSelectedSchoolYear(originalSchoolYear);
                setSelectedDepartment('all'); // Keep department hidden for consultation stats
            }
            setCurrentStatsView(prev => prev === 1 ? 0 : 1);
            
            // End transition after content loads
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        }, 150);
    };

    useEffect(() => {
        // Fetch semesters
        fetch(`${API_URL}/homeadmin/semesters`)
            .then(res => res.json())
            .then(data => {
                setSemesters(data);
                if (data.length > 0) {
                    setSelectedSemester(data[0].semester);
                    setSelectedSchoolYear(data[0].school_year);
                    // Store initial values as original
                    setOriginalSemester(data[0].semester);
                    setOriginalSchoolYear(data[0].school_year);
                }
            })
            .catch(err => console.error("Error fetching semesters:", err));

        // Fetch departments
        fetch(`${API_URL}/hometeacher/departments`)
            .then(res => res.json())
            .then(data => {
                setDepartments(data.departments || []);
            })
            .catch(err => console.error("Error fetching departments:", err));

        const storedTeacherID = localStorage.getItem('teacherID');
        if (storedTeacherID) {
            setTeacherId(storedTeacherID);
        } else {
            fetch(`${API_URL}/hometeacher/getTeacherId`, {
                method: 'GET',
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched Teacher ID:", data.teacherId);
                    setTeacherId(data.teacherId);
                    localStorage.setItem('teacherID', data.teacherId);
                })
                .catch(error => console.error("Error fetching teacher ID:", error));
        }
    }, []);

    useEffect(() => {
        if (!teacherId || !selectedSemester || !selectedSchoolYear) return;

        const params = new URLSearchParams({
            teacher_id: teacherId,
            semester: selectedSemester,
            school_year: selectedSchoolYear
        });

        fetch(`${API_URL}/hometeacher/stats?${params}`)
            .then(response => response.json())
            .then(data => {
                console.log("API Response:", data);
                setStats({
                    total_hours: data.total_hours.toFixed(2) || "0.00",
                    total_consultations: data.total_consultations || 0,
                    unique_students: data.unique_students || 0
                });
            })
            .catch(error => console.error("Error fetching stats:", error));

        fetch(`${API_URL}/hometeacher/consultations_by_date?${params}`)
            .then(response => response.json())
            .then(data => {
                console.log("Consultation Data:", data);
                const formattedConsultations = Object.entries(data.consultations).map(([date, count]) => ({
                    date,
                    consultations: count
                })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-5);
        
                const formattedHours = Object.entries(data.consultation_hours).map(([date, hours]) => {
                    const [hh, mm] = hours.split(':').map(Number); // Convert HH:MM to numbers
                    return {
                        date,
                        consultation_hours: hh * 60 + mm // Convert to total minutes for plotting
                    };
                }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-5);
        
                setConsultationData(formattedConsultations);
                setConsultationHoursData(formattedHours);
            })
            .catch(error => console.error("Error fetching consultation data:", error));
    }, [teacherId, selectedSemester, selectedSchoolYear]);

    const handleBookingClick = () => {
        navigate('/booking-teacher');
    };

    return (
        <div className="flex flex-col items-center min-h-screen relative">
            <h1 className="text-3xl font-bold text-[#0065A8] mb-6">Dashboard</h1>

            {/* Settings gear icon in top right */}
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
                            onChange={(e) => setSelectedSemester(e.target.value === '' ? null : e.target.value)}
                            className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%230065A8%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:24px] [background-position:right_0.5rem_center] pr-10"
                        >
                            <option value="">All Semesters</option>
                            {Array.from(new Set(semesters.map(s => s.semester))).map(sem => (
                                <option key={sem} value={sem}>{sem} Semester</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
                        <select
                            value={selectedSchoolYear || ''}
                            onChange={(e) => setSelectedSchoolYear(e.target.value === '' ? null : e.target.value)}
                            className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%230065A8%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:24px] [background-position:right_0.5rem_center] pr-10"
                        >
                            <option value="">All School Years</option>
                            {Array.from(new Set(semesters.map(s => s.school_year))).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Department filter - only show for Student Concern Analytics */}
                    {currentStatsView === 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                value={selectedDepartment || 'all'}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-2 border border-[#0065A8] bg-white text-[#0065A8] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%230065A8%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:24px] [background-position:right_0.5rem_center] pr-10"
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name} ({dept.teacher_count} teachers)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <p className="text-sm text-gray-500">
                            {currentStatsView === 0 ? (
                                // Consultation stats view - show only semester and school year
                                selectedSemester && selectedSchoolYear 
                                    ? `Viewing: ${selectedSemester} Semester ${selectedSchoolYear}` 
                                    : "Select filters to view specific data"
                            ) : (
                                // Student concern analytics view - show all filters including department
                                selectedSemester && selectedSchoolYear 
                                    ? `Viewing: ${selectedSemester} Semester ${selectedSchoolYear}${selectedDepartment && selectedDepartment !== 'all' ? `, ${departments.find(d => d.id == selectedDepartment)?.name || 'Selected Dept'}` : ', All Departments'}` 
                                    : `Viewing: All Data${selectedDepartment && selectedDepartment !== 'all' ? `, ${departments.find(d => d.id == selectedDepartment)?.name || 'Selected Dept'}` : ', All Departments'}`
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section - Now responsive with swipe navigation */}
            <div className="w-full px-4 sm:px-6 lg:px-10 mb-6">
                {/* Stats Section Header with Toggle Navigation */}
                <div className="flex flex-col items-center justify-center mb-6 gap-4">
                    
                    {/* Toggle Button Group */}
                    <div className="relative bg-gray-100 rounded-lg p-1 shadow-inner">
                        <div className="flex">
                            <button
                                onClick={() => currentStatsView !== 0 && nextStatsView()}
                                disabled={isTransitioning}
                                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 flex-1 sm:flex-none ${
                                    currentStatsView === 0
                                        ? 'bg-white text-[#0065A8] shadow-sm'
                                        : 'text-gray-600 hover:text-[#0065A8] hover:bg-gray-50'
                                } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Consultation Stats</span>
                                    <span className="sm:hidden">Stats</span>
                                </div>
                            </button>
                            <button
                                onClick={() => currentStatsView !== 1 && nextStatsView()}
                                disabled={isTransitioning}
                                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 flex-1 sm:flex-none ${
                                    currentStatsView === 1
                                        ? 'bg-white text-[#0065A8] shadow-sm'
                                        : 'text-gray-600 hover:text-[#0065A8] hover:bg-gray-50'
                                } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055V11h8.055" />
                                    </svg>
                                    <span className="hidden sm:inline">Concern Analytics</span>
                                    <span className="sm:hidden">Analytics</span>
                                </div>
                            </button>
                        </div>
                        
                        {/* Loading indicator overlay */}
                        {isTransitioning && (
                            <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-[#0065A8] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Content */}
                <div className={`transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                    {isTransitioning ? (
                        // Enhanced transition loading state
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0065A8] rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#397de2] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-medium text-[#0065A8]">
                                    {currentStatsView === 0 ? 'Loading Student Concern Analytics...' : 'Loading Consultation Statistics...'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {currentStatsView === 0 ? 'Analyzing student consultation patterns' : 'Preparing consultation data'}
                                </p>
                            </div>
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-[#0065A8] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-[#397de2] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-[#0065A8] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                        </div>
                    ) : currentStatsView === 0 ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-[#397de2] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2 justify-center">
                                    <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.total_consultations}</span>
                                    <span className="text-base sm:text-lg">Consultations</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#fc6969] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2 justify-center">
                                    <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.total_hours}</span>
                                    <span className="text-base sm:text-lg">Hours</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#00D1B2] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2 justify-center">
                                    <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.unique_students}</span>
                                    <span className="text-base sm:text-lg">Students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <StudentConcernAnalytics
                        teacherId={null} // Set to null to show all teachers by default
                        selectedSemester={selectedSemester}
                        selectedSchoolYear={selectedSchoolYear}
                        selectedDepartment={selectedDepartment}
                        apiEndpoint="/hometeacher/student_concern_analytics"
                    />
                    )}
                </div>
            </div>

            {/* Graphs - Only show when currentStatsView is 0 (consultation stats) */}
            {currentStatsView === 0 && (
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

                    {/* Consultation Hours Graph */}
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
            )}

            {/* Enrollment Modal (unchanged) */}
            {showEnrollmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Enroll Students</h2>
                            <button 
                                onClick={() => setShowEnrollmentModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <EnrollmentModal closeModal={() => setShowEnrollmentModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeTeacher;
