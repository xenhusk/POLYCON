const express = require('express');
const multer = require('multer');
const { uploadAudio } = require('../services/googleStorage');
const { transcribeAudio } = require('../services/googleSpeech');
const { saveConsultation } = require('../services/firebaseService');
const { generateSummary } = require('../services/googleGemini');

const router = express.Router();
const upload = multer(); // For handling multipart form data

// Upload audio and transcribe it
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioUrl = await uploadAudio(req.file);
    const transcription = await transcribeAudio(audioUrl);
    res.status(200).json({ audioUrl, transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save consultation data and summarize
router.post('/summarize', async (req, res) => {
  try {
    const { transcription, notes } = req.body;

    if (!transcription || !notes) {
      return res.status(400).json({ error: 'Transcription and notes are required' });
    }

    const summary = await generateSummary(`${transcription} ${notes}`);
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error in summarization route:', error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

module.exports = router;
