import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as PlayIcon } from "./icons/play.svg";
import { ReactComponent as StopIcon } from "./icons/stop.svg";
import { ReactComponent as MicrophoneIcon } from "./icons/microphone.svg";
import { ReactComponent as MicrophoneSlashIcon } from "./icons/microphoneSlash.svg";
import AnimatedBackground from "./AnimatedBackground";
import AssessmentModal from "./AssessmentModal";
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

const fetchUserDetails = async (idNumber) => {
  try {
    console.log(`Fetching user details for ID: ${idNumber}`);
    const response = await fetch(`http://localhost:5001/user/get_user?idNumber=${encodeURIComponent(idNumber)}`);
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
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState("00:00:00");
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [AssessmentClicked, setAssessmentClicked] = useState(false);
  const [FinalizeClicked, setFinalizeClicked] = useState(false);

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

  // If a sessionID exists, fetch session details.
  // Otherwise, use the query parameters to populate teacher and student details.
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionID = queryParams.get("sessionID");
    const teacherIDFromQuery = queryParams.get("teacherID");
    const studentIDsFromQuery = queryParams.get("studentIDs");

    if (sessionID) {
      // Existing session - fetch its details.
      const fetchSessionDetails = async (sessionID) => {
        try {
          const response = await fetch(
            `http://localhost:5001/consultation/get_session?sessionID=${sessionID}`
          );
          const data = await response.json();
          if (response.ok) {            const teacherIdNum = data.teacher_id.split("/").pop();
            setTeacherId(teacherIdNum);
            const studentIdNums = data.student_ids.map((id) => id.split("/").pop());
            setStudentIds(studentIdNums.join(", "));
            
            console.log("Session teacherIdNum:", teacherIdNum);
            console.log("Session studentIdNums:", studentIdNums);
            
            // Fetch teacher info from backend
            fetchUserDetails(teacherIdNum)
              .then(teacherData => {
                console.log("Teacher info fetched:", teacherData);
                setTeacherInfo(teacherData);
              })
              .catch(err => console.error("Error fetching teacher info:", err));
              
            // Fetch student info from backend
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
      }    if (studentIDsFromQuery) {
        const studentIdArr = studentIDsFromQuery.split(",").map((id) => id.trim());
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

  // Audio upload function - modify to save quality metrics
  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "session-audio.webm");

    // Calculate speaker count dynamically based on participants.
    const teacherIdElement = teacherId.trim();
    const studentIdsElement = studentIds.trim();
    const studentIdsArray = studentIdsElement
      .split(",")
      .filter((id) => id.trim() !== "");

    const expectedSpeakers = 1 + studentIdsArray.length; // Teacher + students
    formData.append("speaker_count", expectedSpeakers);

    console.log(`Calculated speaker count: ${expectedSpeakers}`);

    const response = await fetch(
      "http://localhost:5001/consultation/transcribe",
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
      return;
    }

    stopTimer();

    let transcriptionText = "";
    let audioUrl = "";
    let qualityScore = 0;
    let qualityMetrics = {};
    let rawSentimentAnalysis = [];
    
    if (audioBlob) {
      try {
        const audioUploadResponse = await uploadAudio(audioBlob);
        transcriptionText = audioUploadResponse.transcription || "";
        audioUrl = audioUploadResponse.audioUrl || "";
        // Save quality data from transcription response
        qualityScore = audioUploadResponse.quality_score || 0;
        qualityMetrics = audioUploadResponse.quality_metrics || {};
        rawSentimentAnalysis = audioUploadResponse.raw_sentiment_analysis || [];
      } catch (error) {        console.error("Error uploading audio:", error);
        showErrorNotification("Audio upload failed. Proceeding without transcription.");
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
      : studentIds.split(",").map((id) => id.trim());

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
      audio_file_path: audioUrl,
      // Include quality data in the payload
      quality_score: qualityScore,
      quality_metrics: qualityMetrics,
      raw_sentiment_analysis: rawSentimentAnalysis
    };

    console.log("Sending payload:", payload);
    console.log("Payload being sent:", payload); // Add this debug log

    try {
      // Append booking_id as a query parameter if available.
      let url = "http://localhost:5001/consultation/store_consultation";
      if (bookingID) {
        url += `?booking_id=${bookingID}`;
        console.log("🔍 Debug - Using booking_id:", bookingID); // Add debug log
      }
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server validation error:", errorData); // Add this debug log
        showErrorNotification(`Failed to store consultation: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      console.log("🚀 Debug: Server Response", data);

      if (response.ok) {
        const newSessionID = data.session_id;
        console.log(
          `✅ Navigating to: /finaldocument?sessionID=${newSessionID}`
        );

        setTimeout(() => {
          navigate(`/finaldocument?sessionID=${newSessionID}`);
        }, 100);
      } else {
        console.error("❌ Error: Response from server was not OK", data);
      }
    } catch (error) {
      console.error("🚨 Error finishing session:", error);
    }
    setProcessing(false);
  };

  const generateSummary = async (transcription, notes) => {
    const response = await fetch(
      "http://localhost:5001/consultation/summarize",
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
      }
    );
    if (!response.ok) {
      throw new Error("Summary generation failed");
    }
    const data = await response.json();
    return data.summary;
  };

  const identifyRoles = async (transcription) => {
    const response = await fetch(
      "http://localhost:5001/consultation/identify_roles",
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
    const studentIdsElement = studentIds.split(",").map((id) => id.trim());
    try {
      const audioUploadResponse = await uploadAudio(audioBlob);
      const audioFilePath = audioUploadResponse.audioUrl;
      const response = await fetch(
        "http://localhost:5001/consultation/store_consultation",
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
      }      const data = await response.json();
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
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl sm:text-2xl">
            Processing Consultation...
          </div>
        </div>
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
                          {formatProgramWithSection(student)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Controls Section */}
            <div className="mt-3 sm:mt-4 space-y-3 fade-in delay-400">
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
                  setFinalizeClicked(true);
                  setTimeout(() => { setFinalizeClicked(false);
                    setTimeout(() => finishSession(), 500);
                  }, 150);
                }}
                disabled={processing}
                type="submit"
                className={`w-full bg-[#057DCD] text-white py-2 sm:py-3 rounded-lg shadow-md hover:bg-[#54BEFF] duration-300ms ease-in-out text-sm sm:text-base
                ${FinalizeClicked ? "scale-90" : "scale-100"}
                ${processing ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {processing ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      <span className="ml-2">Finalizing Consultation...</span>
                    </>
                  ) : (
                    "Finalize Consultation"
                  )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Assessment Modal */}
      <AssessmentModal isOpen={assessmentModalOpen} onClose={() => setAssessmentModalOpen(false)}>
      </AssessmentModal>
    </div>
  );
};

export default Session;
