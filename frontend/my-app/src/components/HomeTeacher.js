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
       <div className="flex flex-col items-center min-h-screen">
            <h1 className="text-3xl font-bold text-[#0065A8] mb-6">Home</h1>

            {/* Stats Section - Reordered stats */}
            <div className="flex gap-4 w-full p-10 pb-0">
                <div className="flex-1 bg-[#0088FF] text-white rounded-lg shadow-lg px-6 py-4">
                    <div className="flex flex-col">
                        <p className="text-sm mb-2 text-left">Total Number of Consultations:</p>
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-7xl font-bold">{stats.total_consultations}</span>
                            <span className="text-lg ">Consultations</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-[#FF7171] text-white rounded-lg shadow-lg px-6 py-4">
                    <div className="flex flex-col">
                        <p className="text-sm mb-2 text-left">Total Number of Consultation Hours:</p>
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-7xl font-bold">{stats.total_hours}</span>
                            <span className="text-lg">Hours</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-[#00D1B2] text-white rounded-lg shadow-lg px-6 py-4">
                    <div className="flex flex-col">
                        <p className="text-sm mb-2 text-left">Total Number of Student Consulted:</p>
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-7xl font-bold">{stats.unique_students}</span>
                            <span className="text-lg">Students</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-10">
            {/* Consultation Graph */}
            <div className="bg-white p-10 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-blue-500 text-center mb-4">Consultations Over Time</h2>
                <ResponsiveContainer width="105%" height={300}>
                    <LineChart data={consultationData}>
                        <CartesianGrid vertical={false} stroke="#D3D3D3" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false}
                          dy={20} // <-- Moved label lower
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => Math.round(value)} 
                          allowDecimals={false} 
                          domain={[0, 'dataMax']} 
                        />
                        <Tooltip />
                        <Legend align="left" wrapperStyle={{ textAlign: 'left', marginTop: '20px', marginBottom: '-20px'}} />
                        <Line type="monotone" dataKey="consultations" stroke="#3B82F6" strokeWidth={3} name="Consultations" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Consultation Hours Graph */}
            <div className="bg-white p-10 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-red-500 text-center mb-4">Consultation Hours Over Time</h2>
                <ResponsiveContainer width="105%" height={300}>
                    <LineChart data={consultationHoursData}>
                        <CartesianGrid vertical={false} stroke="#D3D3D3" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false}
                          dy={20} // <-- Moved label lower
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
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
                        <Tooltip 
                          formatter={(value) => {
                              const hh = Math.floor(value / 60);
                              const mm = value % 60;
                              return [`${hh}:${mm.toString().padStart(2, '0')}`, "Consultation Hours"];
                          }}
                        />
                        <Legend align="left" wrapperStyle={{ textAlign: 'left', marginTop: '20px', marginBottom: '-20px'}} />
                        <Line type="monotone" dataKey="consultation_hours" stroke="#EF4444" strokeWidth={3} name="Consultation Hours" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Add Enrollment Button */}
        <div className="mb-4">
            <button
                onClick={() => setShowEnrollmentModal(true)}
                className="bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors"
            >
                Enroll Students
            </button>
        </div>

        {/* Render Enrollment Modal */}
        {showEnrollmentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
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
