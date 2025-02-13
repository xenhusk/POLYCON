import React, { useState, useEffect, useRef } from 'react';

const FinalDocument = () => {
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchFinalDoc = async () => {
      try {
        const response = await fetch('http://localhost:5001/consultation/get_final_document');
        if (response.ok) {
          const data = await response.json();
          setTranscription(data.transcription || "");
          setSummary(data.summary || "");
          setAudioUrl(data.audioUrl || "");
        }
      } catch (error) {
        console.error("Error fetching final document:", error);
      }
    };
    fetchFinalDoc();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 flex justify-center items-center">
      <div className="max-w-3xl w-full">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Final Document</h1>
        </header>

        {/* Audio Playback Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Audio Recording</h2>
          <div className="p-4 border rounded-lg bg-gray-50">
            <audio 
              ref={audioRef}
              controls 
              src={audioUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">Transcription</h2>
          <div className="p-4 border rounded-lg bg-gray-50">
            {transcription || "Transcription is not available."}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">Summary</h2>
          <div className="p-4 border rounded-lg bg-gray-50">
            {summary || "Summary is not available."}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinalDocument;
