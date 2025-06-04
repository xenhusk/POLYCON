const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const finishButton = document.getElementById("finish-session");
const audioPlayback = document.getElementById("audio-playback");
const notesForm = document.getElementById("notes-form");
const summaryOutput = document.getElementById("summary-output");

const startSessionButton = document.getElementById("start-session");
const timerDisplay = document.getElementById("timer-display");

let mediaRecorder;
let audioChunks = [];
let audioBlob = null;

let timerInterval;
let startTime;

// Function to start the timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

// Function to stop the timer and return the duration in seconds
function stopTimer() {
  clearInterval(timerInterval);
  const elapsedTime = Date.now() - startTime;
  return Math.floor(elapsedTime / 1000);
}

startSessionButton.addEventListener("click", () => {
  startTimer();
  startSessionButton.disabled = true;
  startButton.disabled = false;
});

// Start Recording with validation for speaker count
startButton.addEventListener("click", async () => {
    const teacherIdElement = document.getElementById("teacher-id").value.trim();
    const studentIdsElement = document.getElementById("student-ids").value.trim();
    const studentIds = studentIdsElement.split(',').filter(id => id.trim() !== "");

    const expectedSpeakers = 1 + studentIds.length; // Teacher + students

    if (expectedSpeakers < 1) {
        alert("Please provide valid Teacher ID and Student IDs before recording.");
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
    startSessionButton.disabled = true; // Disable start session button when recording starts
    audioChunks = [];

    startTimer();

    console.log(`Recording started with ${expectedSpeakers} expected speakers`);
});

// Stop Recording and Prepare Audio
stopButton.addEventListener("click", () => {
    mediaRecorder.stop();
    stopButton.disabled = true;
    startButton.disabled = false;

    mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl;
        console.log("Audio recording stopped and ready for upload");
    };
});

// Upload the recorded audio to the backend
async function uploadAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    // Calculate speaker count dynamically based on participants
    const teacherIdElement = document.getElementById("teacher-id").value.trim();
    const studentIdsElement = document.getElementById("student-ids").value.trim();
    const studentIds = studentIdsElement.split(',').filter(id => id.trim() !== "");

    const expectedSpeakers = 1 + studentIds.length; // Teacher + students
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
}

// Finish Session: Handle the entire process
finishButton.addEventListener("click", async () => {
  const concern = document.getElementById("concern").value;
  const actionTaken = document.getElementById("action-taken").value;
  const outcome = document.getElementById("outcome").value;
  const remarks = document.getElementById("remarks").value;

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
          document.getElementById('transcription-output').innerHTML = roleIdentifiedTranscription.replace(/\n/g, '<br>');
          console.log("Role Identified Transcription:", roleIdentifiedTranscription);
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

  summaryOutput.textContent = summary;

  await storeConsultation(transcription, summary, { concern, actionTaken, outcome, remarks, duration });
});

// Actual Summary Generation
async function generateSummary(transcription, notes) {
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
  console.log('Summary:', data.summary);

  // Display summary as plain paragraph
  document.getElementById('summary-output').textContent = data.summary;
  return data.summary;
}

async function identifyRoles(transcription) {
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
    console.log('Role-Identified Transcription:', data.role_identified_transcription);
  
    // Display formatted transcription in the frontend
    document.getElementById('transcription-output').innerHTML = data.role_identified_transcription.replace(/\n/g, '<br>');
    return data.role_identified_transcription;
  }
  
  async function storeConsultation(transcription, summary, notes) {
    const teacherIdElement = document.getElementById("teacher-id");
    const studentIdsElement = document.getElementById("student-ids");

    if (!teacherIdElement || !studentIdsElement) {
        console.error("Error: Missing input fields for Teacher ID or Student IDs.");
        alert("Please ensure all fields are filled.");
        return;
    }

    const teacherId = teacherIdElement.value;
    const studentIds = studentIdsElement.value.split(',').map(id => id.trim());

    if (!audioBlob) {
        console.error("Error: No audio file available.");
        alert("Please record an audio session before submitting.");
        return;
    }

    // Upload audio and get the actual path
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
                teacher_id: teacherId,
                student_ids: studentIds,
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
        console.log('Consultation session stored successfully:', data);
        alert(`Session stored successfully with ID: ${data.session_id}`);
    } catch (error) {
        console.error("Error storing consultation session:", error);
        alert("Failed to store consultation session.");
    }
}

// --- Toast and Notification Setup ---
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

const notifSound = new Audio('/sounds/notification.mp3');  // Place your sound file here
notifSound.volume = 0.5;

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  // Apply SemesterManagement-style toast classes
  toast.className = `fixed top-5 right-5 z-50 rounded-lg shadow-lg max-w-md p-4 transform transition-all duration-500 ease-in-out ${
    type === 'success'
      ? 'bg-green-100 text-green-700 border border-green-500'
      : type === 'error'
      ? 'bg-red-100 text-red-700 border border-red-500'
      : 'bg-blue-100 text-blue-700 border border-blue-500'
  }`;
   toast.textContent = message;
   toastContainer.appendChild(toast);
   notifSound.play().catch(() => {});
   setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Initialize Socket.IO client and listen for booking notifications
const socket = io('http://localhost:5001');
socket.on('booking_created', data => showToast(`Booking created: ${data.subject}`, 'success'));
socket.on('booking_confirmed', data => showToast(`Booking confirmed: ${data.id}`, 'info'));
socket.on('booking_cancelled', data => showToast(`Booking cancelled: ${data.id}`, 'error'));

