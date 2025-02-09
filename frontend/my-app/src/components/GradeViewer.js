import React, { useState, useEffect } from "react";

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
      } else {
        setError(data.error || "Failed to fetch grades.");
      }
    } catch (err) {
      setError("Error fetching grades. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Grades</h2>

      {/* Filters for School Year, Semester, and Period */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded-lg"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
        >
          <option value="">All School Years</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
        </select>

        <select
          className="border p-2 rounded-lg"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All Semesters</option>
          <option value="1st">1st Semester</option>
          <option value="2nd">2nd Semester</option>
        </select>

        <select
          className="border p-2 rounded-lg"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="">All Periods</option>
          <option value="Prelim">Prelim</option>
          <option value="Midterm">Midterm</option>
          <option value="Pre-Final">Pre-Final</option>
          <option value="Final">Final</option>
        </select>

        {/* <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={fetchGrades}
        >
          View
        </button> */}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Loading State */}
      {loading && <p>Loading grades...</p>}

      {/* Grades Table */}
      {!loading && grades.length > 0 && (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Course ID</th>
              <th className="border p-2">Subject Name</th>
              <th className="border p-2">Credit</th>
              <th className="border p-2">Instructor</th>
              <th className="border p-2">Grade</th>
              <th className="border p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="text-center">
                <td className="border p-2">{grade.courseID}</td>
                <td className="border p-2">{grade.courseName}</td>
                <td className="border p-2">3.0</td>
                <td className="border p-2">{grade.facultyID}</td>
                <td className="border p-2">{grade.grade}</td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 text-white text-sm rounded-md ${
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
      )}

      {/* No Grades Message */}
      {!loading && grades.length === 0 && !error && (
        <p className="text-gray-500">No grades available.</p>
      )}
    </div>
  );
};

export default GradeViewer;
