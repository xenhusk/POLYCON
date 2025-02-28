import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as PlayIcon } from './icons/play.svg';
import { ReactComponent as StopIcon } from './icons/stop.svg';
import { ReactComponent as MicrophoneIcon } from './icons/microphone.svg';
import { ReactComponent as MicrophoneSlashIcon } from './icons/microphoneSlash.svg';
import AnimatedBackground from './AnimatedBackground';

const Session = () => {
  const [teacherId, setTeacherId] = useState('');
  const [studentIds, setStudentIds] = useState('');
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [concern, setConcern] = useState('');
  const [action_taken, setActionTaken] = useState('');
  const [outcome, setOutcome] = useState('');
  const [remarks, setRemarks] = useState('');
  const [summary, setSummary] = useState('');
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState('00:00:00');
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [processing, setProcessing] = useState(false);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Read venue from query parameters.
  const queryParams = new URLSearchParams(location.search);
  const venueFromQuery = queryParams.get('venue');
  const bookingID = queryParams.get('booking_id');

  // If a sessionID exists, fetch session details.
  // Otherwise, use the query parameters to populate teacher and student details.
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionID = queryParams.get('sessionID');
    const teacherIDFromQuery = queryParams.get('teacherID');
    const studentIDsFromQuery = queryParams.get('studentIDs');
    const teacherInfoQuery = queryParams.get('teacherInfo');
    const studentInfoQuery = queryParams.get('studentInfo');

    if (sessionID) {
      // Existing session - fetch its details.
      const fetchSessionDetails = async (sessionID) => {
        try {
          const response = await fetch(`http://localhost:5001/consultation/get_session?sessionID=${sessionID}`);
          const data = await response.json();
          if (response.ok) {
            setTeacherId(data.teacher_id.split('/').pop());
            setStudentIds(data.student_ids.map(id => id.split('/').pop()).join(', '));
            // Optionally, you might set teacherInfo/studentInfo from data here.
          } else {
            console.error('Failed to fetch session details:', data.error);
          }
        } catch (error) {
          console.error('Error fetching session details:', error);
        }
      };
      fetchSessionDetails(sessionID);
    } else {
      // New session: use the query parameters provided from the appointment page.
      if (teacherIDFromQuery) {
        setTeacherId(teacherIDFromQuery);
      }
      if (studentIDsFromQuery) {
        setStudentIds(
          studentIDsFromQuery.split(',').map(id => id.trim()).join(', ')
        );
      }
      if (teacherInfoQuery) {
        try {
          setTeacherInfo(JSON.parse(teacherInfoQuery));
        } catch (e) {
          console.error("Error parsing teacher info", e);
        }
      }
      if (studentInfoQuery) {
        try {
          setStudentInfo(JSON.parse(studentInfoQuery));
        } catch (e) {
          console.error("Error parsing student info", e);
        }
      }
    }
  }, [location.search]);

  // Timer functions
  const startTimer = () => {
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const hours = String(Math.floor(elapsedTime / 3600000)).padStart(2, '0');
      const minutes = String(Math.floor((elapsedTime % 3600000) / 60000)).padStart(2, '0');
      const seconds = String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0');
      setTimer(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    setTimerRunning(true);
  };

  const stopTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      if (micEnabled) {
        // Stop any existing recording first
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          if (audioRef.current) {
            audioRef.current.src = URL.createObjectURL(blob);
          }
        };

        mediaRecorderRef.current.start();
      }
      setRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error.name === 'NotAllowedError') {
        alert("Microphone permission denied. Please allow access to record audio.");
        setMicEnabled(false);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    stopTimer();
  };

  const toggleMicrophone = () => {
    // Only allow toggling microphone when not recording
    if (!recording) {
      setMicEnabled(!micEnabled);
    }
  };

  // Audio upload function remains the same.
  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'session-audio.webm');

    // Calculate speaker count dynamically based on participants.
    const teacherIdElement = teacherId.trim();
    const studentIdsElement = studentIds.trim();
    const studentIdsArray = studentIdsElement.split(',').filter(id => id.trim() !== "");

    const expectedSpeakers = 1 + studentIdsArray.length; // Teacher + students
    formData.append('speaker_count', expectedSpeakers);

    console.log(`Calculated speaker count: ${expectedSpeakers}`);

    const response = await fetch('http://localhost:5001/consultation/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Audio upload and transcription failed');
    }

    const data = await response.json();
    console.log('Audio uploaded and transcription received:', data);
    return data;
  };

  // Finish session creates the consultation record and then returns a sessionID.
  const finishSession = async () => {
    setProcessing(true);
    
    // Add debug logging for required fields
    console.log('Checking required fields:', {
      teacherId,
      studentIds,
      concern,
      action_taken,
      outcome
    });
  
    if (!teacherId || !studentIds || !concern || !action_taken || !outcome) {
      console.log('Missing fields detected');
      alert('Please fill in all required fields');
      setProcessing(false);
      return;
    }
  
    stopTimer();
  
    let transcriptionText = "";
    let audioUrl = ""; // <-- new variable for audio URL
    if (audioBlob) {
      try {
        const audioUploadResponse = await uploadAudio(audioBlob);
        transcriptionText = audioUploadResponse.transcription || "";
        audioUrl = audioUploadResponse.audioUrl || "";
      } catch (error) {
        console.error("Error uploading audio:", error);
        alert("Audio upload failed. Proceeding without transcription.");
      }
    }
  
    const generatedSummary = await generateSummary(transcriptionText, {
        concern,
        actionTaken: action_taken,
        outcome,
        remarks,
    });
  
    setSummary(generatedSummary);
  
    // Ensure student_ids is an array
    let studentIdsArray = Array.isArray(studentIds) 
        ? studentIds 
        : studentIds.split(',').map(id => id.trim());
  
    const payload = {
        teacher_id: teacherId,
        student_ids: studentIdsArray,
        transcription: transcriptionText,
        summary: generatedSummary,
        concern: concern,
        action_taken: action_taken,
        outcome: outcome,
        remarks: remarks,
        duration: timer,
        venue: venueFromQuery,
        session_date: new Date().toISOString(),
        audio_file_path: audioUrl  // <-- include the audio URL here
    };
  
    console.log('Sending payload:', payload);
    console.log("Payload being sent:", payload); // Add this debug log
  
    try {
        // Append booking_id as a query parameter if available.
        let url = 'http://localhost:5001/consultation/store_consultation';
        if (bookingID) {
          url += `?booking_id=${bookingID}`;
          console.log("🔍 Debug - Using booking_id:", bookingID); // Add debug log
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server validation error:", errorData); // Add this debug log
            alert(`Failed to store consultation: ${errorData.error}`);
            return;
        }
  
        const data = await response.json();
        console.log("🚀 Debug: Server Response", data);
  
        if (response.ok) {
            const newSessionID = data.session_id;
            console.log(`✅ Navigating to: /finaldocument?sessionID=${newSessionID}`);
  
            setTimeout(() => {
                navigate(`/finaldocument?sessionID=${newSessionID}`);
            }, 100);
        } else {
            console.error("❌ Error: Response from server was not OK", data);
        }
    } catch (error) {
        console.error('🚨 Error finishing session:', error);
    }
    setProcessing(false);
};



  const generateSummary = async (transcription, notes) => {
    const response = await fetch('http://localhost:5001/consultation/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcription: transcription || "No transcription available.",
        notes: `Concern: ${notes.concern}\nAction Taken: ${notes.actionTaken}\nOutcome: ${notes.outcome}\nRemarks: ${notes.remarks || "No remarks"}`,
      }),
    });
    if (!response.ok) {
      throw new Error('Summary generation failed');
    }
    const data = await response.json();
    return data.summary;
  };

  const identifyRoles = async (transcription) => {
    const response = await fetch('http://localhost:5001/consultation/identify_roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription: transcription || "No transcription available." }),
    });
    if (!response.ok) {
      throw new Error('Role identification failed');
    }
    const data = await response.json();
    return data.role_identified_transcription;
  };

  const storeConsultation = async (transcription, summary, notes) => {
    const teacherIdElement = teacherId;
    const studentIdsElement = studentIds.split(',').map(id => id.trim());
    try {
      const audioUploadResponse = await uploadAudio(audioBlob);
      const audioFilePath = audioUploadResponse.audioUrl;
      const response = await fetch('http://localhost:5001/consultation/store_consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_file_path: audioFilePath,
          transcription,
          summary,
          teacher_id: teacherIdElement,
          student_ids: studentIdsElement,
          concern: notes.concern,
          action_taken: notes.action_taken,
          outcome: notes.outcome,
          remarks: notes.remarks || "No remarks"
        }),
      });
      if (!response.ok) {
        throw new Error('Storing consultation session failed');
      }
      const data = await response.json();
      alert(`Session stored successfully with ID: ${data.session_id}`);
    } catch (error) {
      console.error("Error storing consultation session:", error);
      alert("Failed to store consultation session.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen p-10 flex justify-center items-center font-poppins">
      <AnimatedBackground />
      {processing && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-2xl">
            Processing Consultation...
          </div>
        </div>
      )}
      <div className="relative z-10 backdrop-blur-sm bg-white/5 fade-in">
        <div className="max-w-6xl w-full grid grid-cols-7 gap-6">
          {/* Left Section: Adviser Notes */}
          <div className="col-span-5 bg-[#057DCD] p-6 rounded-lg shadow-lg fade-in delay-100">
            <label className="block text-white text-lg mb-2">Concern</label>
            <textarea
              className="w-full p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            />
            <label className="block text-white text-lg mb-2">Action Taken</label>
            <textarea
              className="w-full p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={action_taken}
              onChange={(e) => setActionTaken(e.target.value)}
            />
            <label className="block text-white text-lg mb-2">Outcome</label>
            <textarea
              className="w-full p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
            <label className="block text-white text-lg mb-2">Remarks</label>
            <textarea
              className="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Right Section: Teacher & Student Info, Recording & Finalize */}
          <div className="col-span-2 flex flex-col justify-between h-full"> {/* Added h-full */}
            <div className="space-y-4 flex-1"> {/* Added flex-1 */}
              {/* Teacher Info Card */}
              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-2 sm:py-5 bg-[#057DCD] text-white rounded-lg shadow-lg fade-in delay-200">
                {teacherInfo ? (
                  <>
                    <div className="rounded-full p-1 bg-[#54BEFF]">
                      <div className="rounded-full p-1 bg-white">
                        <img
                          className="w-12 h-12 rounded-full"
                          src={teacherInfo.profile_picture}
                          alt="Teacher"
                        />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-lg font-semibold">{teacherInfo.teacherName}</p>
                      <p className="font-small text-[#98d6ff]">{teacherInfo.department} {teacherInfo.role}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-white">ID: {teacherId}</p>
                )}
              </div>

              {/* Students Info Card - Updated height */}
              <div className="bg-[#057DCD] text-white p-4 rounded-lg shadow-lg flex-1 min-h-[300px] overflow-y-auto fade-in delay-300"> {/* Added min-h-[300px] and overflow-y-auto */}
                <p className="font-semibold text-center mb-2">Student/s</p>
                {studentInfo ? (
                  <ul className="space-y-2">
                    {Array.isArray(studentInfo)
                      ? studentInfo.map((student, index) => (
                          <li key={index} className="flex items-center">
                            {student.profile_picture && (
                              <img
                                src={student.profile_picture}
                                alt="Student"
                                className="w-10 h-10 rounded-full mr-2 border-2 border-[#ffffff]"
                              />
                            )}
                            {student.firstName} {student.lastName}
                          </li>
                        ))
                      : <p>{studentIds}</p>}
                  </ul>
                ) : (
                  <p>{studentIds}</p>
                )}
              </div>
            </div>

            {/* Controls Section */}
            <div className="mt-4 space-y-4 fade-in delay-400"> {/* Changed from mt-auto to mt-4 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className="p-2 transition-transform duration-200 hover:scale-110"
                  >
                    {recording ? (
                      <StopIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <PlayIcon className="w-6 h-6 text-green-500" />
                    )}
                  </button>
                  <button
                    onClick={toggleMicrophone}
                    disabled={recording}
                    className={`p-2 transition-transform duration-200 ${
                      !recording ? 'hover:scale-110' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    {micEnabled ? (
                      <MicrophoneIcon className="w-6 h-6 text-blue-500" />
                    ) : (
                      <MicrophoneSlashIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <span className="text-gray-600">{timer}</span>
              </div>

              <button
                onClick={finishSession}
                disabled={processing}
                className="w-full bg-[#057DCD] text-white py-3 rounded-lg shadow-md hover:hover:bg-[#54BEFF] duration-300ms ease-in-out"
              >
                Finalize Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
