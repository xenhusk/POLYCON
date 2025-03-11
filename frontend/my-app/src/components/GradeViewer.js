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
    const fetchLatestFilter = async () => {
      try {
        const response = await fetch('http://localhost:5001/semester/get_latest_filter');
        if (response.ok) {
          const data = await response.json();
          setSchoolYear(data.school_year);
          setSemester(data.semester);
        }
      } catch (error) {
        console.error('Error fetching latest filter:', error);
      }
    };

    fetchLatestFilter();
    if (!studentID) {
      setError("Student ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchGrades();
  }, [studentID]);

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
    <div className="w-[24rem] md:w-[44rem] lg:w-[64rem] xl:w-[96%] mx-auto p-2 sm:p-4 lg:p-6 bg-white fade-in">
      <div className="w-full mx-auto p-2 sm:p-4 bg-white mt-2 sm:mt-6 flex flex-col justify-center">
        <h2 className="relative top-0 text-2xl sm:text-3xl font-bold text-center text-[#0065A8] mb-4 fade-in delay-100">
          Grades
        </h2>

        {/* Filter Section - Updated for responsiveness */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 fade-in delay-200 justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[60%]">
            <select
              className="shadow-md focus:ring-[#54BEFF] focus:ring-2 focus:outline-none px-4 py-2 rounded-lg text-sm"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
            >
              <option value="">School Years</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>

            <select
              className="shadow-md focus:ring-[#54BEFF] focus:ring-2 focus:outline-none px-4 py-2 rounded-lg text-sm"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">Semesters</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
            </select>

            <select
              className="shadow-md focus:ring-[#54BEFF] focus:ring-2 focus:outline-none px-4 py-2 rounded-lg text-sm"
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-red-500 fade-in text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Table Section - Updated for better responsiveness */}
        <div className="mt-4 shadow-md overflow-hidden rounded-lg fade-in delay-300 relative z-0">
          <div className="overflow-x-auto">
            <div className="max-h-[400px] md:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
              <table className="w-full bg-white text-sm sm:text-base" style={{ minWidth: '1000px' }}>
                <thead className="bg-[#0065A8] text-white sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="px-3 py-3 min-w-[120px]">Subject Code</th>
                    <th className="px-3 py-3 min-w-[200px]">Subject Name</th>
                    <th className="px-3 py-3 min-w-[100px]">Credit</th>
                    <th className="px-3 py-3 min-w-[180px]">Instructor</th>
                    <th className="px-3 py-3 min-w-[100px]">Grade</th>
                    <th className="px-3 py-3 min-w-[120px]">Remarks</th>
                  </tr>
                </thead>

                {/* Loading State - Updated for consistent styling */}
                {loading ? (
                  <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b animate-pulse">
                        <td className="px-3 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-20"></div></td>
                        <td className="px-3 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-40"></div></td>
                        <td className="px-3 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-10"></div></td>
                        <td className="px-3 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-32"></div></td>
                        <td className="px-3 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        <td className="px-3 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-24"></div></td>
                      </tr>
                    ))}
                  </tbody>
                ) : grades.length > 0 ? (
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id} className="border-b hover:bg-[#edf8ff] align-middle text-center">
                        <td className="px-3 py-3">{grade.courseID}</td>
                        <td className="px-3 py-3">{grade.courseName}</td>
                        <td className="px-3 py-3">3.0</td>
                        <td className="px-3 py-3">{grade.facultyName}</td>
                        <td className="px-3 py-3">{grade.grade}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 text-white text-xs sm:text-sm rounded-md inline-block w-20 sm:w-24 
                            ${grade.remarks === "PASSED" 
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
                ) : null}
              </table>

              {/* No Grades Message - Centered and responsive */}
              {!loading && grades.length === 0 && !error && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm sm:text-base fade-in delay-200">No grades available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeViewer;
