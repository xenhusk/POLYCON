const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const finishButton = document.getElementById("finish-session");
const audioPlayback = document.getElementById("audio-playback");
const notesForm = document.getElementById("notes-form");
const summaryOutput = document.getElementById("summary-output");

let mediaRecorder;
let audioChunks = [];
let audioBlob = null;

// Start Recording
startButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;
  audioChunks = [];
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

  let transcription = null;

  // Step 1: Check if audio is recorded
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

  // Step 2: Summarize transcription (if available) and notes
  const summary = await generateSummary(transcription || "", {
    concern,
    actionTaken,
    outcome,
    remarks,
  });

  summaryOutput.textContent = summary;
});

// Actual Summary Generation (replace with your summarization endpoint)
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
  return data.summary;
}
