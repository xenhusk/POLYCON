import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from '../apiConfig';
import { ReactComponent as PlayIcon } from "./icons/play.svg";
import { ReactComponent as StopIcon } from "./icons/stop.svg";
import { ReactComponent as MicrophoneIcon } from "./icons/microphone.svg";
import { ReactComponent as MicrophoneSlashIcon } from "./icons/microphoneSlash.svg";
import AnimatedBackground from "./AnimatedBackground";
import AssessmentModal from "./AssessmentModal";
import PreLoader from "./PreLoader";
import { getProfilePictureUrl, getDisplayProgram } from "../utils/utils";
import { showErrorNotification, showSuccessNotification, showWarningNotification } from "../utils/notificationUtils";

// Helper function to format program and section together (e.g. "BSCS 3A")
const formatProgramWithSection = (student) => {
  if (!student) return '';
  
  const program = getDisplayProgram(student);
  const section = student.year_section || student.section || '';
  
  if (!program) return section;
  if (!section) return program;
  
  return `${program} ${section}`;
};

/** Split comma-separated student id list and dedupe (same id twice should not add an extra speaker). */
const parseUniqueStudentIds = (studentIds) => {
  const raw = Array.isArray(studentIds)
    ? studentIds
    : String(studentIds || "").split(",");
  return [
    ...new Set(
      raw
        .map((id) => String(id).trim())
        .filter((id) => id !== "")
    ),
  ];
};

const fetchUserDetails = async (idNumber) => {
  try {
    console.log(`Fetching user details for ID: ${idNumber}`);
    const response = await fetch(`${API_URL}/user/get_user?idNumber=${encodeURIComponent(idNumber)}`);
    if (!response.ok) throw new Error("Failed to fetch user details");
    const data = await response.json();
    console.log(`User details received for ${idNumber}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching user ${idNumber}:`, error);
    return null;
  }
};

const Session = () => {
  const [teacherId, setTeacherId] = useState("");
  const [studentIds, setStudentIds] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [concern, setConcern] = useState("");
  const [action_taken, setActionTaken] = useState("");
  const [outcome, setOutcome] = useState("");
  const [remarks, setRemarks] = useState("");
  const [summary, setSummary] = useState("");
  const [transcription, setTranscription] = useState("");
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [showTranscriptionNotice, setShowTranscriptionNotice] = useState(false);
  const [hasShownNotice, setHasShownNotice] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState("00:00:00");
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [AssessmentClicked, setAssessmentClicked] = useState(false);
  const [FinalizeClicked, setFinalizeClicked] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [venueId, setVenueId] = useState(null);
  const [periodId, setPeriodId] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Read venue from query parameters.
  const queryParams = new URLSearchParams(location.search);
  const venueFromQuery = queryParams.get("venue");
  const bookingID = queryParams.get("booking_id");

  // Fetch booking details to get venue_id
  const fetchBookingDetails = async () => {
    if (!bookingID) return;
    
    try {
      const response = await fetch(`${API_URL}/bookings/get_all_bookings_admin`);
      const bookings = await response.json();
      const booking = bookings.find(b => b.id === bookingID);
      if (booking) {
        setBookingDetails(booking);
        setVenueId(booking.venue_id);
        setPeriodId(booking.period_id);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  // If a sessionID exists, fetch session details.
  // Otherwise, use the query parameters to populate teacher and student details.
  useEffect(() => {
    // Fetch booking details if bookingID is available
    if (bookingID) {
      fetchBookingDetails();
    }
    const queryParams = new URLSearchParams(location.search);
    const sessionID = queryParams.get("sessionID");
    const teacherIDFromQuery = queryParams.get("teacherID");
    const studentIDsFromQuery = queryParams.get("studentIDs");

    if (sessionID) {
      // Existing session - fetch its details.
      const fetchSessionDetails = async (sessionID) => {
        try {
          const response = await fetch(`${API_URL}/consultation/get_session?sessionID=${sessionID}`);
          const data = await response.json();
          if (response.ok) {
            const teacherIdNum = data.teacher_id.split("/").pop();
            setTeacherId(teacherIdNum);
            const studentIdNums = [
              ...new Set(
                data.student_ids.map((id) => String(id).split("/").pop().trim()).filter(Boolean)
              ),
            ];
            setStudentIds(studentIdNums.join(", "));
            console.log("Session teacherIdNum:", teacherIdNum);
            console.log("Session studentIdNums:", studentIdNums);
            fetchUserDetails(teacherIdNum)
              .then(teacherData => {
                console.log("Teacher info fetched:", teacherData);
                setTeacherInfo(teacherData);
              })
              .catch(err => console.error("Error fetching teacher info:", err));
            if (studentIdNums && studentIdNums.length > 0) {
              Promise.all(
                studentIdNums.map(fetchUserDetails)
              ).then(results => {
                console.log("All session student details fetched:", results);
                const validStudents = results.filter(student => student !== null);
                console.log("Valid student info to display:", validStudents);
                setStudentInfo(validStudents);
              }).catch(err => {
                console.error("Error fetching session student details:", err);
              });
            } else {
              console.log("No student IDs found in the session");
              setStudentInfo([]);
            }
          } else {
            console.error("Failed to fetch session details:", data.error);
          }
        } catch (error) {
          console.error("Error fetching session details:", error);
        }
      };
      fetchSessionDetails(sessionID);
    } else {
      // New session: use the query parameters provided from the appointment page.
      if (teacherIDFromQuery) {
        setTeacherId(teacherIDFromQuery);
        fetchUserDetails(teacherIDFromQuery).then(setTeacherInfo);
      }          if (studentIDsFromQuery) {
        const studentIdArr = parseUniqueStudentIds(
          studentIDsFromQuery.split(",").map((id) => id.trim())
        );
        setStudentIds(studentIdArr.join(", "));
        
        console.log("Student ID array:", studentIdArr);
        
        Promise.all(
          studentIdArr.map(fetchUserDetails)
        ).then(results => {
          console.log("All student details fetched:", results);
          setStudentInfo(results.filter(student => student !== null));
        }).catch(err => {
          console.error("Error fetching multiple student details:", err);
        });
      }
    }
  }, [location.search]);

  // Timer functions
  const startTimer = () => {
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const hours = String(Math.floor(elapsedTime / 3600000)).padStart(2, "0");
      const minutes = String(
        Math.floor((elapsedTime % 3600000) / 60000)
      ).padStart(2, "0");
      const seconds = String(Math.floor((elapsedTime % 60000) / 1000)).padStart(
        2,
        "0"
      );
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
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
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
      startTimer();    } catch (error) {
      console.error("Error starting recording:", error);
      if (error.name === "NotAllowedError") {
        showErrorNotification(
          "Microphone permission denied. Please allow access to record audio."
        );
        setMicEnabled(false);
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
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

  const toggleTranscription = () => {
    if (!transcriptionEnabled) {
      // Only show notice if it hasn't been shown before
      if (!hasShownNotice) {
        setShowTranscriptionNotice(true);
      } else {
        // If notice was already shown, just enable transcription
        setTranscriptionEnabled(true);
      }
    } else {
      setTranscriptionEnabled(false);
    }
  };

  const handleTranscriptionNoticeAccept = () => {
    setTranscriptionEnabled(true);
    setShowTranscriptionNotice(false);
    setHasShownNotice(true); // Mark that notice has been shown
  };

  const handleTranscriptionNoticeCancel = () => {
    setShowTranscriptionNotice(false);
    setHasShownNotice(true); // Mark that notice has been shown even if cancelled
  };

  // Audio upload function - modify to save quality metrics
  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "session-audio.webm");

    // Calculate speaker count: teacher + unique students (duplicate IDs in URL/booking must not increment).
    const uniqueStudentIds = parseUniqueStudentIds(studentIds);
    const expectedSpeakers = 1 + uniqueStudentIds.length; // Teacher + students
    formData.append("speaker_count", expectedSpeakers);
    formData.append("transcription_enabled", transcriptionEnabled);

    console.log(`Calculated speaker count: ${expectedSpeakers} (unique students: ${uniqueStudentIds.length})`);
    console.log(`Transcription enabled: ${transcriptionEnabled}`);

    const response = await fetch(
      `${API_URL}/consultation/transcribe`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Audio upload and transcription failed");
    }

    const data = await response.json();
    console.log("Audio uploaded and transcription received:", data);
    return data;
  };

  // Finish session creates the consultation record and then returns a sessionID.
  const finishSession = async () => {
    setProcessing(true);
    setProcessingProgress(10);
    setProcessingStep("Validating consultation data...");

    // Add debug logging for required fields
    console.log("Checking required fields:", {
      teacherId,
      studentIds,
      concern,
      action_taken,
      outcome,
    });

    if (!teacherId || !studentIds || !concern || !action_taken || !outcome) {      console.log("Missing fields detected");
      showWarningNotification("Please fill in all required fields");
      setProcessing(false);
      setProcessingStep("");
      setProcessingProgress(0);
      return;
    }

    stopTimer();
    setProcessingProgress(20);

    let transcriptionText = "";
    let audioUrl = "";
    
    if (audioBlob) {
      try {
        setProcessingStep("Processing audio recording...");
        setProcessingProgress(30);
        const audioUploadResponse = await uploadAudio(audioBlob);
        transcriptionText = audioUploadResponse.transcription || "";
        audioUrl = audioUploadResponse.audioUrl || "";
        setProcessingProgress(50);
      } catch (error) {        console.error("Error uploading audio:", error);
        showErrorNotification("Audio upload failed. Proceeding without transcription.");
      }
    } else {
      setProcessingProgress(50);
    }

    try {
      setProcessingStep("Generating consultation summary...");
      setProcessingProgress(60);
      const generatedSummary = await generateSummary(transcriptionText, {
        concern,
        actionTaken: action_taken,
        outcome,
        remarks,
      });

      setSummary(generatedSummary);
      setProcessingProgress(80);

      const studentIdsArray = parseUniqueStudentIds(studentIds);

      const payload = {
        teacher_id: teacherId,
        student_ids: studentIdsArray,
        transcription: transcriptionText,
        transcription_enabled: transcriptionEnabled,
        summary: generatedSummary,
        concern: concern,
        action_taken: action_taken,
        outcome: outcome,
        remarks: remarks,
        duration: timer,
        venue_id: venueId,
        period_id: periodId,
        session_date: new Date().toISOString(),
        audio_file_path: audioUrl
      };

      console.log("Sending payload:", payload);
      console.log("Payload being sent:", payload); // Add this debug log

      setProcessingStep("Saving consultation record...");
      setProcessingProgress(90);
      
      // Append booking_id as a query parameter if available.
      let url = `${API_URL}/consultation/store_consultation`;
      if (bookingID) {
        url += `?booking_id=${bookingID}`;
        console.log("🔍 Debug - Using booking_id:", bookingID);
      }
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        console.error("Server validation error:", errorData);
        showErrorNotification(`Failed to store consultation: ${errorData.error}`);
        setProcessing(false);
        setProcessingStep("");
        setProcessingProgress(0);
        return;
      }
      
      const data = await response.json();
      console.log("🚀 Debug: Server Response", data);
      
      if (response.ok) {
        const newSessionID = data.session_id;
        console.log(`✅ Navigating to: /finaldocument?sessionID=${newSessionID}`);
        setProcessingStep("Consultation completed successfully!");
        setProcessingProgress(100);
        showSuccessNotification("Consultation finalized successfully!");
        
        setTimeout(() => {
          navigate(`/finaldocument?sessionID=${newSessionID}`);
        }, 1500);
      } else {
        console.error("❌ Error: Response from server was not OK", data);
        showErrorNotification("Failed to save consultation. Please try again.");
      }
    } catch (error) {
      console.error("🚨 Error during summary generation:", error);
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        showErrorNotification("Summary generation is taking longer than expected. This might be due to AI service issues. Please try again.");
      } else {
        showErrorNotification(`Failed to generate summary: ${error.message}`);
      }
    } finally {
      setProcessing(false);
      setProcessingStep("");
      setProcessingProgress(0);
    }
  };

  const generateSummary = async (transcription, notes) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    try {
      const response = await fetch(
        `${API_URL}/consultation/summarize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcription: transcription || "No transcription available.",
            notes: `Concern: ${notes.concern}\nAction Taken: ${
              notes.actionTaken
            }\nOutcome: ${notes.outcome}\nRemarks: ${
              notes.remarks || "No remarks"
            }`,
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 500) {
          // Check if it's likely an AI service configuration issue
          if (errorData.error && (
            errorData.error.includes('GEMINI_API_KEY') || 
            errorData.error.includes('AI service') ||
            errorData.error.includes('API key')
          )) {
            throw new Error("AI summary service is not properly configured. Please contact your system administrator.");
          }
          throw new Error("AI summary service is currently unavailable. This might be due to missing configuration or service issues.");
        }
        throw new Error(errorData.error || `Summary generation failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.summary;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error("Summary generation timed out after 90 seconds");
        throw new Error("Summary generation timed out. The AI service might be experiencing high load. Please try again.");
      }
      
      console.error("Summary generation error:", error);
      throw error;
    }
  };

  const identifyRoles = async (transcription) => {
    const response = await fetch(
      `${API_URL}/consultation/identify_roles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: transcription || "No transcription available.",
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Role identification failed");
    }
    const data = await response.json();
    return data.role_identified_transcription;
  };

  const storeConsultation = async (transcription, summary, notes) => {
    const teacherIdElement = teacherId;
    const studentIdsElement = parseUniqueStudentIds(studentIds);
    try {
      const audioUploadResponse = await uploadAudio(audioBlob);
      const audioFilePath = audioUploadResponse.audioUrl;
      const response = await fetch(
        `${API_URL}/consultation/store_consultation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio_file_path: audioFilePath,
            transcription,
            summary,
            teacher_id: teacherIdElement,
            student_ids: studentIdsElement,
            concern: notes.concern,
            action_taken: notes.action_taken,
            outcome: notes.outcome,
            remarks: notes.remarks || "No remarks",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Storing consultation session failed");
      }
      const data = await response.json();
      showSuccessNotification(`Session stored successfully with ID: ${data.session_id}`);
    } catch (error) {
      console.error("Error storing consultation session:", error);
      showErrorNotification("Failed to store consultation session.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen p-3 sm:p-6 md:p-8 flex justify-center items-center font-poppins">
      <AnimatedBackground />
      {processing && (
        <PreLoader 
          progress={processingProgress} 
          customText={processingStep}
        />
      )}
      <div className="relative z-10 backdrop-blur-sm bg-white/5 fade-in w-full">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:grid md:grid-cols-7 gap-4 lg:gap-6">
          {/* Left Section: Adviser Notes */}
          <div className="md:col-span-5 bg-[#057DCD] p-3 sm:p-4 md:p-6 rounded-lg shadow-lg fade-in delay-100">
            <label className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
              Concern
            </label>
            <textarea
              className="w-full p-2 sm:p-3 rounded-md mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              rows="3"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            />
            <label className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
              Action Taken
            </label>
            <textarea
              className="w-full p-2 sm:p-3 rounded-md mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              rows="3"
              value={action_taken}
              onChange={(e) => setActionTaken(e.target.value)}
            />
            <label className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
              Outcome
            </label>
            <textarea
              className="w-full p-2 sm:p-3 rounded-md mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              rows="3"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
            <label className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
              Remarks
            </label>
            <textarea
              className="w-full p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Right Section: Teacher & Student Info, Recording & Finalize */}
          <div className="md:col-span-2 flex flex-col justify-between h-full">
            <div className="space-y-3 sm:space-y-4 flex-1">              {/* Teacher Info Card */}              <div className="flex flex-row items-center gap-2 py-2 sm:py-3 px-3 lg:px-4 bg-[#057DCD] text-white rounded-lg shadow-lg fade-in delay-200">
                {console.log("Rendering teacher info:", teacherInfo)}                {teacherInfo && console.log("Teacher properties:", {
                  // Profile pic properties
                  profilePic: teacherInfo.profilePic,
                  profile_pic: teacherInfo.profile_pic,
                  profilePicture: teacherInfo.profilePicture, 
                  profile_picture: teacherInfo.profile_picture,
                  // List all properties
                  allKeys: Object.keys(teacherInfo)
                })}
                  {teacherInfo ? (
                  <>
                    <div className="rounded-full p-1 bg-[#54BEFF]">
                      <div className="rounded-full p-1 bg-white">                        <img
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full"
                          src={getProfilePictureUrl(teacherInfo.profile_picture || teacherInfo.profilePic || teacherInfo.profile_pic || teacherInfo.profilePicture, teacherInfo.fullName)}
                          alt={teacherInfo.fullName || "Teacher"}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
                        {teacherInfo.fullName || teacherInfo.firstName || "Teacher"}
                      </p>
                      <p className="text-[0.65rem] sm:text-[0.7rem] md:text-xs lg:text-sm text-[#98d6ff]">
                        {teacherInfo.department || ""} {teacherInfo.role || ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-white">Loading teacher info...</p>
                )}
              </div> {/* End of Teacher Info Card */}{/* Student Info Card(s) */}
              {console.log("Rendering student info:", studentInfo)}
              
              {/* Case 1: studentInfo is still loading */}
              {studentInfo === null ? (
                <div className="py-2 sm:py-3 px-3 lg:px-4 bg-[#057DCD] text-white rounded-lg shadow-lg fade-in delay-300">
                  <p className="text-white">Loading student info...</p>
                </div>
              ) : Array.isArray(studentInfo) && studentInfo.length === 0 ? (
                /* Case 2: studentInfo is an empty array */
                <div className="py-2 sm:py-3 px-3 lg:px-4 bg-[#057DCD] text-white rounded-lg shadow-lg fade-in delay-300">
                  <p className="text-white">No student information available.</p>
                </div>
              ) : (
                /* Case 3: We have student info to display */                (Array.isArray(studentInfo) ? studentInfo : [studentInfo]).map((student, index) => {
                  console.log(`Rendering student ${index}:`, student);                  console.log(`Student ${index} data properties:`, {
                    // Profile pic properties
                    profilePic: student?.profilePic,
                    profile_pic: student?.profile_pic, 
                    profilePicture: student?.profilePicture,
                    profile_picture: student?.profile_picture,
                    // Section properties
                    section: student?.section,
                    year_section: student?.year_section,
                    // List all properties for debugging
                    allKeys: Object.keys(student || {})
                  });
                  return (
                    <div key={index} className="flex flex-row items-center gap-2 py-2 sm:py-3 px-3 lg:px-4 bg-[#057DCD] text-white rounded-lg shadow-lg fade-in delay-300">
                      <div className="rounded-full p-1 bg-[#54BEFF]">
                        <div className="rounded-full p-1 bg-white">                          <img
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full"
                            src={getProfilePictureUrl(student?.profile_picture || student?.profilePic || student?.profile_pic || student?.profilePicture, student?.fullName)}
                            alt={(student && student.fullName) || "Student"}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
                          {student && student.fullName ? student.fullName : student && student.firstName ? student.firstName : "Student Name"}
                        </p>                        <p className="text-[0.65rem] sm:text-[0.7rem] md:text-xs lg:text-sm text-[#98d6ff]">
                          ID: {student.idNumber || student.id || 'No ID'} • {student.year_section || student.program || 'Unknown Program'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Controls Section */}
            <div className="mt-3 sm:mt-4 space-y-3 fade-in delay-400">
              {/* Transcription Toggle */}
              <div className="flex items-center justify-between bg-gray-100 bg-opacity-10 p-2 rounded-lg">
                <span className="text-xs sm:text-sm text-black text-opacity-85">
                  Enable Transcription
                </span>
                <div className="flex items-center">
                  <button
                    onClick={toggleTranscription}
                    disabled={recording}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      transcriptionEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    } ${recording ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        transcriptionEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-100 bg-opacity-10 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className="p-1 sm:p-2 transition-transform duration-200 hover:scale-110"
                  >
                    {recording ? (
                      <StopIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                    ) : (
                      <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    )}
                  </button>
                  <button
                    onClick={toggleMicrophone}
                    disabled={recording}
                    className={`p-1 sm:p-2 transition-transform duration-200 ${
                      !recording
                        ? "hover:scale-110"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    {micEnabled ? (
                      <MicrophoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    ) : (
                      <MicrophoneSlashIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <span className={`font-mono text-sm sm:text-base ${recording ? "text-red-500" : "text-black text-opacity-85"}`}>
                  {timer}
                </span>
              </div>

              <button
                onClick={() => {
                  if (!processing) {
                    setFinalizeClicked(true);
                    setTimeout(() => {
                      setFinalizeClicked(false);
                      finishSession();
                    }, 150);
                  }
                }}
                disabled={processing}
                type="submit"
                className={`w-full bg-[#057DCD] text-white py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out text-sm sm:text-base flex items-center justify-center min-h-[40px] sm:min-h-[44px]
                ${FinalizeClicked && !processing ? "scale-95" : "scale-100"}
                ${processing ? "opacity-50 cursor-not-allowed" : "hover:bg-[#54BEFF] active:scale-95"}
                `}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-xs sm:text-sm">
                      {processingStep || "Finalizing Consultation..."}
                    </span>
                  </div>
                ) : (
                  "Finalize Consultation"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transcription Notice Modal */}
      {showTranscriptionNotice && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg mx-4 transform transition-all duration-300 ease-out scale-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Transcription Language Notice
              </h3>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-blue-600">Important:</span> The transcription feature is optimized for <span className="font-semibold">English language</span> conversations.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
                <p className="text-amber-800 text-sm">
                  <span className="font-medium">⚠️ Accuracy Notice:</span> While other languages may be processed, transcription quality and accuracy may be significantly reduced.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                For optimal results, we recommend conducting sessions in English when transcription is enabled.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleTranscriptionNoticeCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTranscriptionNoticeAccept}
                className="px-6 py-2.5 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white font-medium rounded-lg hover:from-[#046BB8] hover:to-[#42A8E6] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                I Understand, Enable Transcription
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Assessment Modal */}
      <AssessmentModal isOpen={assessmentModalOpen} onClose={() => setAssessmentModalOpen(false)}>
      </AssessmentModal>
    </div>
  );
};

export default Session;
