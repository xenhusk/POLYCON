import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HomeTeacher = () => {
    const [teacherId, setTeacherId] = useState(null);
    const [stats, setStats] = useState({ total_hours: "0.00", total_consultations: 0, unique_students: 0 });
    const [consultationData, setConsultationData] = useState([]);
    const [consultationHoursData, setConsultationHoursData] = useState([]);
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
            console.error("Teacher ID not provided, API call skipped!");
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
            <h1 className="text-3xl font-bold mb-6">Home</h1>

            {/* Stats Section - Placed at the Top */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
                <div className="bg-red-500 text-white p-6 rounded-lg text-center shadow-lg">
                    <p className="text-lg font-semibold">Total Number of Consultation Hours</p>
                    <h2 className="text-5xl font-bold">{stats.total_hours}</h2>
                    <p className="text-lg font-medium">Hours</p>
                </div>

                <div className="bg-blue-500 text-white p-6 rounded-lg text-center shadow-lg">
                    <p className="text-lg font-semibold">Total Number of Consultations</p>
                    <h2 className="text-5xl font-bold">{stats.total_consultations}</h2>
                    <p className="text-lg font-medium">Consultations</p>
                </div>

                <div className="bg-green-500 text-white p-6 rounded-lg text-center shadow-lg">
                    <p className="text-lg font-semibold">Total Number of Students Consulted</p>
                    <h2 className="text-5xl font-bold">{stats.unique_students}</h2>
                    <p className="text-lg font-medium">Students</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-10">
            {/* Consultation Graph */}
            <div className="bg-white p-10 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-blue-500 text-center mb-4">Consultations Over Time</h2>
                <ResponsiveContainer width="105%" height={300}>
                    <LineChart data={consultationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
                        <YAxis tickFormatter={(value) => Math.round(value)} allowDecimals={false} domain={[0, 'dataMax']} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="consultations" stroke="#3B82F6" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Consultation Hours Graph */}
            <div className="bg-white p-10 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-red-500 text-center mb-4">Consultation Hours Over Time</h2>
                <ResponsiveContainer width="105%" height={300}>
                    <LineChart data={consultationHoursData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
                        <YAxis
                            tickFormatter={(minutes) => {
                                const hh = Math.floor(minutes / 60);
                                const mm = minutes % 60;
                                return `${hh}:${mm.toString().padStart(2, '0')}`; // Convert minutes to HH:MM
                            }}
                        />
                        <Tooltip 
                            formatter={(value) => {
                                const hh = Math.floor(value / 60);
                                const mm = value % 60;
                                return [`${hh}:${mm.toString().padStart(2, '0')}`, "Consultatation Hour"];
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="consultation_hours" stroke="#EF4444" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Button to navigate to teacher booking */}
        <button 
            onClick={handleBookingClick} 
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700"
        >
            Go to Teacher Booking
        </button>
        </div>
    );
};

export default HomeTeacher;
