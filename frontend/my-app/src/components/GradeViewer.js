import React, { useState, useEffect } from "react";
import "./gradeViewer.css";

const GradeViewer = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [period, setPeriod] = useState("");

  const studentID = localStorage.getItem("studentID"); // Fetch student ID from localStorage

  useEffect(() => {
    if (!studentID) {
      setError("Student ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchGrades();
  }, [studentID, schoolYear, semester, period]);

  const fetchGrades = async () => {
    // Generate a unique cache key based on filters and studentID
    const cacheKey = `gradesCache_${studentID}_${schoolYear}_${semester}_${period}`;

    // Check if grades are already cached
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setGrades(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        studentID: studentID,
        schoolYear: schoolYear || "", 
        semester: semester || "",
         period: period || ""
      }).toString();

      const response = await fetch(`http://localhost:5001/grade/get_student_grades?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setGrades(data);
        // Cache the fetched grades
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } else {
        setError(data.error || "Failed to fetch grades.");
      }
    } catch (err) {
      setError("Error fetching grades. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 fade-in">
      <h2 className="text-3xl font-bold mb-4 text-[#0065A8] mt-2 text-center fade-in delay-100">
        Grades
      </h2>

      <div className="flex gap-4 mb-4 fade-in delay-200">
        <select
          className="shadow-md focus:ring-[#54BEFF] focus:ring-2 focus:outline-none px-2 p-2 rounded-lg"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
        >
          <option value="">School Years</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
        </select>

        <select
          className="shadow-md focus:ring-[#54BEFF] focus:ring-2 focus:outline-none px-2 p-2 rounded-lg"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">Semesters</option>
          <option value="1st">1st Semester</option>
          <option value="2nd">2nd Semester</option>
        </select>

        <select
          className="shadow-md focus:ring-[#54BEFF] focus:ring-2 focus:outline-none px-2 p-2 rounded-lg"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="">Periods</option>
          <option value="Prelim">Prelim</option>
          <option value="Midterm">Midterm</option>
          <option value="Pre-Final">Pre-Final</option>
          <option value="Final">Final</option>
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 fade-in">{error}</p>}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 shadow-lg overflow-hidden rounded-lg fade-in delay-300">
          <table className="min-w-full table-fixed">
            <thead className="bg-[#0065A8] text-white">
              <tr>
                <th className="border p-2">Subject Code</th>
                <th className="border p-2">Subject Name</th>
                <th className="border p-2">Credit</th>
                <th className="border p-2">Instructor</th>
                <th className="border p-2">Grade</th>
                <th className="border p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b hover:bg-[#edf8ff] align-middle animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grades Table */}
      {!loading && grades.length > 0 && (
        <div className=" rounded-xl p-6 overflow-y-auto fade-in delay-300">
          <table className="min-w-full table-fixed shadow-lg rounded-lg">
            <thead className="bg-[#0065A8] text-white">
              <tr>
                <th className="border p-2">Subject Code</th>
                <th className="border p-2">Subject Name</th>
                <th className="border p-2">Credit</th>
                <th className="border p-2">Instructor</th>
                <th className="border p-2">Grade</th>
                <th className="border p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b hover:bg-[#edf8ff] align-middle text-center"> 
                  <td className="px-4 py-3">{grade.courseID}</td>
                  <td className="px-4 py-3">{grade.courseName}</td>
                  <td className="px-4 py-3">3.0</td>
                  <td className="px-4 py-3">{grade.facultyName}</td>
                  <td className="px-4 py-3">{grade.grade}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-white text-sm rounded-md inline-block w-24 text-center ${
                        grade.remarks === "PASSED"
                          ? "bg-green-500"
                          : grade.remarks === "FAILED"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {grade.remarks || "NOT ENCODED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Grades Message */}
      {!loading && grades.length === 0 && !error && (
        <p className="text-gray-500 fade-in delay-200">No grades available.</p>
      )}
    </div>
  );
};

export default GradeViewer;
