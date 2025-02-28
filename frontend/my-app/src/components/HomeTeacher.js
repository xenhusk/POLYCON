import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import EnrollmentModal from './EnrollmentModal';

const HomeTeacher = () => {
    const [teacherId, setTeacherId] = useState(null);
    const [stats, setStats] = useState({ total_hours: "0.00", total_consultations: 0, unique_students: 0 });
    const [consultationData, setConsultationData] = useState([]);
    const [consultationHoursData, setConsultationHoursData] = useState([]);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedTeacherID = localStorage.getItem('teacherID');
        if (storedTeacherID) {
            setTeacherId(storedTeacherID);
        } else {
            fetch('http://localhost:5001/hometeacher/getTeacherId', {
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
        if (!teacherId) {
            return;
        }

        fetch(`http://localhost:5001/hometeacher/stats?teacher_id=${teacherId}`)
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

            fetch(`http://localhost:5001/hometeacher/consultations_by_date?teacher_id=${teacherId}`)
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
    }, [teacherId]);

    const handleBookingClick = () => {
        navigate('/booking-teacher');
    };

    return (
       <div className="flex flex-col items-center w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0065A8] mb-4 sm:mb-6 px-4">Home</h1>

            {/* Stats Section - Now responsive */}
            <div className="flex flex-col sm:flex-row gap-4 w-full px-4 sm:px-6 lg:px-10 pb-0">
                <div className="flex-1 bg-[#397de2] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
                    <div className="flex flex-col">
                        <p className="text-sm mb-2 text-left">Total Number of Consultations:</p>
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.total_consultations}</span>
                            <span className="text-base sm:text-lg">Consultations</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-[#fc6969] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
                    <div className="flex flex-col">
                        <p className="text-sm mb-2 text-left">Total Number of Consultation Hours:</p>
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.total_hours}</span>
                            <span className="text-base sm:text-lg">Hours</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-[#00D1B2] text-white rounded-lg shadow-lg px-4 sm:px-6 py-4">
                    <div className="flex flex-col">
                        <p className="text-sm mb-2 text-left">Total Number of Students Consulted:</p>
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-4xl sm:text-5xl lg:text-7xl font-bold">{stats.unique_students}</span>
                            <span className="text-base sm:text-lg">Students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs - Now responsive with stacking on small screens */}
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
