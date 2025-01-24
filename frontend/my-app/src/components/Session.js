import React, { useState, useRef } from 'react';

const Session = () => {
  const [teacherId, setTeacherId] = useState('');
  const [studentIds, setStudentIds] = useState('');
  const [concern, setConcern] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [outcome, setOutcome] = useState('');
  const [remarks, setRemarks] = useState('');
  const [summary, setSummary] = useState('');
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState('00:00:00');
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Start the timer
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

  // Stop the timer
  const stopTimer = () => {
    clearInterval(timerIntervalRef.current);
    const elapsedTime = Date.now() - timerIntervalRef.current;
    return Math.floor(elapsedTime / 1000); // Return duration in seconds
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        audioRef.current.src = URL.createObjectURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopTimer();
  };

  // Upload audio to backend
  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'session-audio.webm');

    // Calculate speaker count dynamically based on participants
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

  // Finish session
  const finishSession = async () => {
    if (!teacherId || !studentIds || !concern || !actionTaken || !outcome) {
      alert('Please fill in all required fields');
      return;
    }

    const duration = stopTimer();

    let transcription = null;

    if (audioBlob) {
      try {
        const audioUploadResponse = await uploadAudio(audioBlob);
        transcription = audioUploadResponse.transcription || "";
      } catch (error) {
        console.error("Error uploading audio:", error);
        alert("Audio upload failed. Proceeding without transcription.");
      }
    } else {
      console.log("No audio uploaded, proceeding with manual input.");
    }

    if (transcription) {
      try {
        console.log("Sending transcription for role identification...");
        const roleIdentifiedTranscription = await identifyRoles(transcription);
        setTranscription(roleIdentifiedTranscription);
        transcription = roleIdentifiedTranscription; // Update transcription with roles for storage
      } catch (error) {
        console.error("Error identifying roles:", error);
        alert("Error processing roles.");
      }
    } else {
      console.warn("No transcription available for role identification.");
    }

    const summary = await generateSummary(transcription || "", {
      concern,
      actionTaken,
      outcome,
      remarks,
    });

    setSummary(summary);

    await storeConsultation(transcription, summary, { concern, actionTaken, outcome, remarks, duration });
  };

  // Generate summary
  const generateSummary = async (transcription, notes) => {
    const response = await fetch('http://localhost:5001/consultation/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

  // Identify roles in transcription
  const identifyRoles = async (transcription) => {
    const response = await fetch('http://localhost:5001/consultation/identify_roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription: transcription || "No transcription available.",
      }),
    });

    if (!response.ok) {
      throw new Error('Role identification failed');
    }

    const data = await response.json();
    return data.role_identified_transcription;
  };

  // Store consultation details
  const storeConsultation = async (transcription, summary, notes) => {
    const teacherIdElement = teacherId;
    const studentIdsElement = studentIds.split(',').map(id => id.trim());

    if (!audioBlob) {
      console.error("Error: No audio file available.");
      alert("Please record an audio session before submitting.");
      return;
    }

    try {
      const audioUploadResponse = await uploadAudio(audioBlob);
      const audioFilePath = audioUploadResponse.audioUrl;

      const response = await fetch('http://localhost:5001/consultation/store_consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_file_path: audioFilePath,
          transcription: transcription,
          summary: summary,
          teacher_id: teacherIdElement,
          student_ids: studentIdsElement,
          concern: notes.concern,
          action_taken: notes.actionTaken,
          outcome: notes.outcome,
          remarks: notes.remarks || "No remarks",
          duration: notes.duration // Adding duration to Firestore document
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">POLYCON Consultation</h1>
      </header>

      <main>
        <section className="mb-6">
          <label className="block mb-2 font-medium">Teacher ID:</label>
          <input type="text" className="w-full border p-2 rounded" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} placeholder="Enter Teacher ID" required />

          <label className="block mt-4 mb-2 font-medium">Student IDs (comma-separated):</label>
          <input type="text" className="w-full border p-2 rounded" value={studentIds} onChange={(e) => setStudentIds(e.target.value)} placeholder="Enter Student IDs" required />
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">Session Timer</h2>
          <button onClick={startTimer} disabled={timerRunning} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Start Session</button>
          <p className="mt-2 font-mono">{timer}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">Audio Recording</h2>
          <button onClick={startRecording} disabled={recording} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">Start Recording</button>
          <button onClick={stopRecording} disabled={!recording} className="ml-2 bg-red-500 text-white px-4 py-2 rounded">Stop Recording</button>
          <audio ref={audioRef} controls className="mt-4 w-full"></audio>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">Adviser Notes</h2>
          <textarea className="w-full border p-2 rounded mt-2" placeholder="Concern" value={concern} onChange={(e) => setConcern(e.target.value)} required />
          <textarea className="w-full border p-2 rounded mt-2" placeholder="Action Taken" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} required />
          <textarea className="w-full border p-2 rounded mt-2" placeholder="Outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} required />
          <textarea className="w-full border p-2 rounded mt-2" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </section>

        <button onClick={finishSession} className="bg-blue-500 text-white px-4 py-2 rounded">Finish Session</button>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Summary</h2>
          <p>{summary || "Summary will appear here after session is finished."}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Transcription</h2>
          <p>{transcription || "Transcription will appear here after session is finished."}</p>
        </section>
      </main>
    </div>
  );
};

export default Session;
