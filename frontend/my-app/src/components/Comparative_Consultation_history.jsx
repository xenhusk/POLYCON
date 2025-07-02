import React from "react";

const ComparativeConsultationHistory = ({
  openSelectionModal,
  allFieldsProvided,
  sessions = [] // Add sessions as a prop with default empty array
}) => {
  return (
    <div>
      {allFieldsProvided && sessions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-[#0065A8]">
              Consultation History
            </h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>
          <div className="max-h-[450px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300 border-l-4 border-[#397de2]"
                >
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-[#0065A8]">
                      {new Date(session.session_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                    <span className="text-sm text-gray-500">
                      Teacher: {session.teacher_name || "Unknown"}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Student:</span>{" "}
                    {session.student_name || "Unknown"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Concern:</span>{" "}
                    {session.concern}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Outcome:</span>{" "}
                    {session.outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparativeConsultationHistory;