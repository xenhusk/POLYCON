const speech = require('@google-cloud/speech');
const path = require('path');

const client = new speech.SpeechClient({
  keyFilename: path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const transcribeAudio = async (gcsUri) => {
  const audio = { uri: gcsUri }; // Use gs:// URI
  const config = {
    encoding: 'LINEAR16', // Ensure this matches your file type
    languageCode: 'en-US',
  };
  const request = { audio, config };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('\n');

  return transcription;
};

module.exports = { transcribeAudio };
