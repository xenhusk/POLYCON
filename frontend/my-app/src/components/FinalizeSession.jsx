import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FinalizeSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Initialize state from the data passed via navigate
  const [teacherId, setTeacherId] = useState(state.teacherId || '');
  const [studentIds, setStudentIds] = useState(state.studentIds || '');
  const [teacherInfo, setTeacherInfo] = useState(state.teacherInfo || null);
  const [studentInfo, setStudentInfo] = useState(state.studentInfo || null);
  const [concern, setConcern] = useState(state.concern || '');
  const [actionTaken, setActionTaken] = useState(state.actionTaken || '');
  const [outcome, setOutcome] = useState(state.outcome || '');
  const [remarks, setRemarks] = useState(state.remarks || '');
  const [transcription, setTranscription] = useState(state.transcription || '');
  const [summary, setSummary] = useState('');
  const [processing, setProcessing] = useState(false);

  // You can reuse functions like generateSummary, identifyRoles, uploadAudio if needed here.
  // For this example, we assume transcription and summary are already available and the teacher may edit them.

  const finalizeSession = async () => {
    if (!teacherId || !studentIds || !concern || !actionTaken || !outcome) {
      alert('Please fill in all required fields.');
      return;
    }
    setProcessing(true);
    try {
      // Call your backend API to store the consultation record.
      // For example:
      const response = await fetch('http://localhost:5001/consultation/store_consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacherId,
          student_ids: studentIds.split(',').map(id => id.trim()),
          concern,
          action_taken: actionTaken,
          outcome,
          remarks: remarks || "No remarks",
          transcription,
          summary,
          // Include any additional data as needed.
        }),
      });
      if (!response.ok) {
        throw new Error('Storing consultation session failed');
      }
      const data = await response.json();
      alert(`Session stored successfully with ID: ${data.session_id}`);
      // Optionally, navigate to another page (e.g., dashboard)
      navigate('/dashboard');
    } catch (error) {
      console.error("Error storing consultation session:", error);
      alert("Failed to store consultation session.");
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg fade-in">
      <header className="flex justify-between items-center mb-4 fade-in delay-100">
        <h1 className="text-3xl font-bold text-gray-800">Finalize Session</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </header>

      {/* Display teacher information */}
      <section className="mb-6 fade-in delay-200">
        <h2 className="text-xl font-semibold">Teacher Information</h2>
        {teacherInfo ? (
          <div className="flex items-center">
            {teacherInfo.profile_picture && (
              <img src={teacherInfo.profile_picture} alt="Teacher" className="w-10 h-10 rounded-full mr-2" />
            )}
            <div>
              <p><strong>Name:</strong> {teacherInfo.teacherName}</p>
              <p><strong>Department:</strong> {teacherInfo.department}</p>
            </div>
          </div>
        ) : (
          <p>ID: {teacherId}</p>
        )}
      </section>

      {/* Display student information */}
      <section className="mb-6 fade-in delay-300">
        <h2 className="text-xl font-semibold">Student Information</h2>
        {studentInfo ? (
          <div>
            {Array.isArray(studentInfo) ? (
              studentInfo.map((student, index) => (
                <div key={index} className="flex items-center mb-2">
                  {student.profile_picture && (
                    <img src={student.profile_picture} alt="Student" className="w-8 h-8 rounded-full mr-2" />
                  )}
                  <div>
                    <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                    <p><strong>Role:</strong> {student.role}</p>
                    <p><strong>Department:</strong> {student.department}</p>
                    <p><strong>Year/Section:</strong> {student.year_section}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>{studentIds}</p>
            )}
          </div>
        ) : (
          <p>ID(s): {studentIds}</p>
        )}
      </section>

      {/* Adviser Notes & Finalization */}
      <section className="mb-6 fade-in delay-400">
        <h2 className="text-xl font-semibold">Adviser Notes</h2>
        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Concern"
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Action Taken"
          value={actionTaken}
          onChange={(e) => setActionTaken(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </section>

      {/* Transcription & Summary */}
      <section className="mb-6 fade-in delay-500">
        <h2 className="text-xl font-semibold">Transcription</h2>
        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Transcription"
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
        />
      </section>

      <section className="mb-6 fade-in delay-600">
        <h2 className="text-xl font-semibold">Summary</h2>
        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </section>

      <button
        onClick={finalizeSession}
        disabled={processing}
        className="bg-blue-500 text-white px-4 py-2 rounded fade-in delay-700"
      >
        {processing ? 'Finalizing...' : 'Finalize Session'}
      </button>
    </div>
  );
};

export default FinalizeSession;
