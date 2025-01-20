// script.js

const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const finishButton = document.getElementById("finish-session");
const audioPlayback = document.getElementById("audio-playback");
const notesForm = document.getElementById("notes-form");
const summaryOutput = document.getElementById("summary-output");

let mediaRecorder;
let audioChunks = [];
let audioBlob = null; // To store the recorded audio blob

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

// Stop Recording
stopButton.addEventListener("click", () => {
  mediaRecorder.stop();
  stopButton.disabled = true;
  startButton.disabled = false;

  mediaRecorder.onstop = () => {
    audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayback.src = audioUrl;

    console.log("Audio recording stopped and ready for upload");
  };
});

// Finish Session (Combine Transcription and Notes)
finishButton.addEventListener("click", async () => {
  const concern = document.getElementById("concern").value;
  const actionTaken = document.getElementById("action-taken").value;
  const outcome = document.getElementById("outcome").value;
  const remarks = document.getElementById("remarks").value;

  let transcription = null;

  // Step 1: If audioBlob exists, upload and transcribe it
  if (audioBlob) {
    const audioUploadResponse = await uploadAudio(audioBlob);// Actual upload API call
    transcription = await audioUploadResponse.transcription;// Transcription already included in the upload response
  }

  // Step 2: Summarize transcription (if available) and notes
  const summary = await generateSummary(transcription, {
    concern,
    actionTaken,
    outcome,
    remarks,
  });

  // Display the summary
  summaryOutput.textContent = summary;
});

// Actual Audio Upload Function (combined with transcribe)
async function uploadAudio(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');

  const response = await fetch('http://localhost:5000/consultation/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Audio upload and transcription failed');
  }

  const data = await response.json();
  console.log('Audio uploaded and transcription received:', data);
  return data; // Return the response with the audio URL and transcription
}

// Actual Summary Generation (replace with your summarization endpoint)
async function generateSummary(transcription, notes) {
  const response = await fetch('http://localhost:5000/consultation/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcription: transcription,
      notes: `Concern: ${notes.concern}\nAction Taken: ${notes.actionTaken}\nOutcome: ${notes.outcome}\nRemarks: ${notes.remarks}`,
    }),
  });

  if (!response.ok) {
    throw new Error('Summary generation failed');
  }

  const data = await response.json();
  console.log('Summary:', data.summary);
  return data.summary; // Return the generated summary from the backend
}
