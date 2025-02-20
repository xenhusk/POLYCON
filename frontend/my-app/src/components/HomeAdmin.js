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

const HomeAdmin = () => {
  const [stats, setStats] = useState({ total_hours: "0.00", total_consultations: 0, unique_students: 0 });
  const [consultationData, setConsultationData] = useState([]);
  const [consultationHoursData, setConsultationHoursData] = useState([]);
  const navigate = useNavigate();

  // Compute current month info for labels if desired
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    // Now fetch the entire collection without filtering by month/year
    fetch(`http://localhost:5001/homeadmin/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({
          total_hours: data.total_hours ? data.total_hours.toFixed(2) : "0.00",
          total_consultations: data.total_consultations || 0,
          unique_students: data.unique_students || 0
        });
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
            <p className="text-sm mb-2 text-left">Unique Students Consulted ({monthName}):</p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-7xl font-bold">{stats.unique_students}</span>
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
    </div>
  );
};

export default HomeAdmin;
