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

  // Step 1: If audioBlob exists, transcribe it
  if (audioBlob) {
    const audioUploadResponse = await fakeUploadAudio(audioBlob);
    transcription = await fakeTranscribeAudio(audioUploadResponse.audioUrl);
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

// Simulated Upload Function (replace with API call)
async function fakeUploadAudio(audioBlob) {
  console.log("Audio uploaded");
  return { audioUrl: "https://fake-url.com/audio-file.wav" }; // Simulated response
}

// Simulated Transcription Function (replace with API call)
async function fakeTranscribeAudio(audioUrl) {
  console.log("Transcription generated for", audioUrl);
  return "This is a simulated transcription of the audio."; // Simulated transcription
}

// Simulated Summary Generation Function (replace with API call)
async function generateSummary(transcription, notes) {
  console.log("Generating summary...");
  const transcriptionPart = transcription ? `Transcription: ${transcription}\n` : "";
  return `
    ${transcriptionPart}
    Concern: ${notes.concern}
    Action Taken: ${notes.actionTaken}
    Outcome: ${notes.outcome}
    Remarks: ${notes.remarks || "None"}
  `;
}
