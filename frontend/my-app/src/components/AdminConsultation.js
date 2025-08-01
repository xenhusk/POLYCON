import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';
import './AdminConsultation.css';

const AdminConsultation = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  if (loading) {
    return (
      <div className="admin-consultation-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading teacher leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-consultation-container">
      <div className="page-header">
        <h1>Teachers Consultation Leaderboard</h1>
        <p>Top teachers ranked by consultation engagement</p>
      </div>

      {/* Semester Filter */}
      <div className="filter-section">
        <label htmlFor="semester-select">Filter by Semester:</label>
        <select 
          id="semester-select"
          value={`${selectedSemester.semester}|${selectedSemester.school_year}`}
          onChange={handleSemesterChange}
          className="semester-select"
        >
          <option value="|">All Semesters</option>
          {semesters.map((sem, index) => (
            <option key={index} value={`${sem.semester}|${sem.school_year}`}>
              {sem.semester} {sem.school_year}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Leaderboard */}
      <div className="leaderboard-container">
        {leaderboardData.length === 0 ? (
          <div className="no-data">
            <p>No consultation data available for the selected period.</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboardData.map((teacher, index) => (
              <div 
                key={teacher.teacher_id} 
                className="leaderboard-item"
                onClick={() => handleTeacherClick(teacher)}
              >
                <div className="rank">
                  <span className="rank-icon">{getRankIcon(index)}</span>
                </div>
                <div className="teacher-info">
                  <h3>{teacher.teacher_name}</h3>
                  <p className="teacher-id">ID: {teacher.teacher_id}</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{teacher.total_consultations}</span>
                    <span className="stat-label">Consultations</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{teacher.total_students}</span>
                    <span className="stat-label">Students</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{teacher.total_duration_formatted}</span>
                    <span className="stat-label">Total Time</span>
                  </div>
                </div>
                <div className="view-details">
                  <span>Click to view details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTeacher.teacher_name} - Detailed Statistics</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="teacher-summary">
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="summary-value">{selectedTeacher.total_consultations}</span>
                    <span className="summary-label">Total Consultations</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-value">{selectedTeacher.total_students}</span>
                    <span className="summary-label">Total Students Consulted</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-value">{selectedTeacher.total_duration_formatted}</span>
                    <span className="summary-label">Total Consultation Time</span>
                  </div>
                </div>
              </div>
              
              <div className="sessions-list">
                <h3>Consultation Sessions</h3>
                {selectedTeacher.sessions.length === 0 ? (
                  <p>No sessions available</p>
                ) : (
                  <div className="sessions-grid">
                    {selectedTeacher.sessions.map((session, index) => (
                      <div key={session.id} className="session-card">
                        <div className="session-header">
                          <span className="session-date">{new Date(session.date).toLocaleDateString()}</span>
                          <span className="session-time">{new Date(session.date).toLocaleTimeString()}</span>
                        </div>
                        <div className="session-details">
                          <p><strong>Duration:</strong> {session.duration || 'N/A'}</p>
                          <p><strong>Students:</strong> {session.student_count}</p>
                          {session.summary && (
                            <p><strong>Summary:</strong> {session.summary.substring(0, 100)}...</p>
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
    </div>
  );
};

export default AdminConsultation;
