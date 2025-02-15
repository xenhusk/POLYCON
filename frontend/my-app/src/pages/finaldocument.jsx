import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AnimatedBackground from '../components/AnimatedBackground';
import DocumentTemplate from '../components/DocumentTemplate';
import './FinalDocument.css';

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const FinalDocument = () => {
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [concern, setConcern] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [outcome, setOutcome] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionDate, setSessionDate] = useState("");
  const [venue, setVenue] = useState("N/A");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const audioRef = useRef(null);
  const documentRef = useRef(null);

  const queryParams = new URLSearchParams(window.location.search);
  const sessionID = queryParams.get('sessionID');

  const handlePrint = () => {
    if (documentRef.current) {
      const clonedElement = documentRef.current.cloneNode(true);
      clonedElement.style.transform = 'none';
      clonedElement.style.boxShadow = 'none';
      
      const printStyles = `
        @page { size: 8.5in 11in; margin: 0; }
        body { margin: 0; padding: 0; }
        * { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        td[style*="background-color: #cfe2f3"],
        tr td[style*="background-color: rgb(207, 226, 243)"] {
          background-color: #cfe2f3 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      `;
      
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(node => node.outerHTML)
        .join('');

      const printWindow = window.open('', '_blank');
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print/Save Document</title>
            ${styles}
            <style>${printStyles}</style>
          </head>
          <body>
            ${clonedElement.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        if (!sessionID) {
          console.error("No sessionID provided");
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:5001/consultation/get_final_document?sessionID=${sessionID}`);
        const data = await response.json();
        if (response.ok) {
          const cleanString = str => str.replace(/^"|"$/g, "");
          setTranscription(cleanString(data.transcription || ""));
          setSummary(cleanString(data.summary || ""));
          setAudioUrl(data.audio_url || "");
          setConcern(cleanString(data.concern || ""));
          setActionTaken(cleanString(data.action_taken || ""));
          setOutcome(cleanString(data.outcome || ""));
          setRemarks(cleanString(data.remarks || ""));
          setSessionDate(data.session_date || "");
          setVenue(data.venue || "N/A");

          // Use teacher_info directly if available, otherwise fall back to teacher_id fetch
          if (data.teacher_info) {
            setTeacherInfo(data.teacher_info);
          } else if (data.teacher_id) {
            const teacherId = data.teacher_id.split('/').pop();
            const teacherResponse = await fetch(`http://localhost:5001/user/get_user?id=${teacherId}`);
            setTeacherInfo(await teacherResponse.json());
          }

          // Use student_info directly if available, otherwise fall back to student_ids fetch
          if (data.student_info && Array.isArray(data.student_info)) {
            setStudentInfo(data.student_info);
          } else if (data.student_ids && Array.isArray(data.student_ids)) {
            const studentPromises = data.student_ids.map(async (studentPath) => {
              const studentId = studentPath.split('/').pop();
              const studentResponse = await fetch(`http://localhost:5001/user/get_user?id=${studentId}`);
              return studentResponse.json();
            });
            setStudentInfo(await Promise.all(studentPromises));
          }
        } else {
          console.error("Error fetching session details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [sessionID]);

  // Calculate initial scale to fit the document in the viewport
  const [initialScale, setInitialScale] = useState(0.35);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const documentHeight = 11 * 96; // 11 inches in pixels (96 DPI)
      const scale = (containerHeight * 0.95) / documentHeight;
      setInitialScale(scale);
    }
  }, []);

  // New: Helper function to format the transcription
  const formatTranscription = (text) => {
    if (!text) return "";
    return text
      .replace(/Teacher:/g, "\nTeacher:")
      .replace(/Student 1:/g, "\nStudent 1:")
      .replace(/Student 2:/g, "\nStudent 2:")
      .replace(/Student 3:/g, "\nStudent 3:")
      .replace(/Student 4:/g, "\nStudent 4:")
      .replace(/Student 5:/g, "\nStudent 5:")
      .replace(/Student:/g, "\nStudent:")
      .trim();
  };

  return (
    <div className="relative h-screen overflow-hidden fade-in">
      <AnimatedBackground />
      {loading ? (
        <div className="flex h-full items-center justify-center">Loading...</div>
      ) : (
        <div className="relative z-10 h-full p-8 flex flex-col">
          <h1 className="text-3xl font-bold text-[#0065A8] mb-6 text-center fade-in delay-100">Final Document</h1>
          <div className="flex gap-8 flex-1 overflow-hidden mb-6">
            <div className="w-1/2 flex flex-col">
              {/* Left Column: Displaying Summary, Transcription, etc. */}
              <div className="flex-1 bg-[#0065A8] rounded-lg p-6 overflow-hidden flex flex-col fade-in delay-200">
                <div className="flex-1 overflow-y-auto pr-4 final-document-scroll">
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Summary</h2>
                    <div className="p-4 bg-white rounded-lg">
                      {summary || "Summary is not available."}
                    </div>
                  </section>
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Transcription</h2>
                    {/* New: Use pre to preserve line breaks from formatted transcription */}
                    <pre className="p-4 bg-white rounded-lg whitespace-pre-wrap">
                      {formatTranscription(transcription) || "Transcription is not available."}
                    </pre>
                  </section>
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Concern</h2>
                    <div className="p-4 bg-white rounded-lg">
                      {concern || "Concern is not available."}
                    </div>
                  </section>
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Action Taken</h2>
                    <div className="p-4 bg-white rounded-lg">
                      {actionTaken || "Action Taken is not available."}
                    </div>
                  </section>
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Outcome</h2>
                    <div className="p-4 bg-white rounded-lg">
                      {outcome || "Outcome is not available."}
                    </div>
                  </section>
                </div>
              </div>
            </div>
            {/* Right Column: Document Preview */}
            <div className="w-1/2 bg-white rounded-lg shadow-lg p-6 flex flex-col fade-in delay-300">
              <TransformWrapper
                initialScale={initialScale}
                minScale={0.35}
                maxScale={2}
                initialPositionX={265}
                initialPositionY={345}
                limitToBounds={false}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="mb-4 flex justify-end space-x-2">
                      <button
                        onClick={() => zoomOut()}
                        className="bg-[#0065A8] text-white px-3 py-1 rounded-lg hover:bg-[#54BEFF]"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          resetTransform();
                          setTimeout(() => resetTransform(), 50);
                        }}
                        className="bg-[#0065A8] text-white px-3 py-1 rounded-lg hover:bg-[#54BEFF]"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => zoomIn()}
                        className="bg-[#0065A8] text-white px-3 py-1 rounded-lg hover:bg-[#54BEFF]"
                      >
                        +
                      </button>
                    </div>
                    <div
                      ref={containerRef}
                      className="flex-1 overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <TransformComponent
                        wrapperClass="w-full h-full flex items-center justify-center"
                        contentClass="flex items-center justify-center"
                      >
                        <div ref={documentRef}>
                          <DocumentTemplate
                            sessionDate={sessionDate}
                            venue={venue}
                            concern={concern}
                            actionTaken={actionTaken}
                            outcome={outcome}
                            remarks={remarks}
                            summary={summary}
                            teacherInfo={teacherInfo}
                            studentInfo={studentInfo}
                          />
                        </div>
                      </TransformComponent>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
          {/* Controls */}
          <div className="w-full p-4 rounded-lg flex items-center justify-between  ">
            <div className="w-1/2">
              <audio ref={audioRef} controls src={audioUrl} className="w-full fade-in delay-400">
                Your browser does not support the audio element.
              </audio> 
            </div>
            <div>     
              <button
                onClick={handlePrint}
                className="bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors fade-in delay-200"
              >
                Print/Save Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalDocument;
