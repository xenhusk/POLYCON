import React, { useState, useEffect } from "react";
import { ReactComponent as DeleteIcon } from "./icons/delete.svg";
import { ReactComponent as EditIcon } from "./icons/Edit.svg";
import { ReactComponent as FilterIcon } from "./icons/FilterAdd.svg";
import { ReactComponent as RedoIcon } from "./icons/redo.svg"; // Add this import
import "./transitions.css";

export default function AddGrade() {
  const [studentID, setStudentID] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseID, setCourseID] = useState("");
  const [grade, setGrade] = useState("");
  const [grades, setGrades] = useState([]);
  const [period, setPeriod] = useState("");
  const [schoolYear, setSchoolYear] = useState("2024-2025");
  const [semester, setSemester] = useState("");
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyID, setFacultyID] = useState("");
  const [selectedGradeID, setSelectedGradeID] = useState(null); // For editing
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Controls filter visibility
  const [filteredGrades, setFilteredGrades] = useState([]); // Stores filtered grades
  const [selectedPeriods, setSelectedPeriods] = useState([]); // Selected periods for filtering
  const [courseFilter, setCourseFilter] = useState(""); // Course filter input
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses for predictive dropdown
  const [schoolYearFilter, setSchoolYearFilter] = useState(""); // School year filter input
  const [semesterFilter, setSemesterFilter] = useState(""); // Semester filter input

  // NEW: States for filtering by student names (Google Docs style)
  const [filterStudentQuery, setFilterStudentQuery] = useState("");
  const [selectedFilterStudents, setSelectedFilterStudents] = useState([]);
  const [filterStudentSuggestions, setFilterStudentSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [FilterClicked, setFilterClicked] = useState(false);
  const [SearchClicked, setSearchClicked] = useState(false);
  const [SubmitClicked, setSubmitClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" }); // Add this new state

  useEffect(() => {
    const storedTeacherID = localStorage.getItem("teacherID");
    if (storedTeacherID) {
      setFacultyID(storedTeacherID);
    }

    // Add this new fetch for latest semester defaults
    const fetchLatestSemester = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/semester/get_latest_filter"
        );
        if (response.ok) {
          const data = await response.json();
          setSchoolYear(data.school_year);
          setSemester(data.semester);
          // Also set the filter values
          setSchoolYearFilter(data.school_year);
          setSemesterFilter(data.semester);
        }
      } catch (error) {
        console.error("Error fetching latest semester:", error);
      }
    };

    Promise.all([fetchInitialData(), fetchLatestSemester()]);
  }, []);

  useEffect(() => {
    const uniqueSchoolYears = [
      ...new Set(grades.map((grade) => grade.school_year)),
    ];
    setUniqueSchoolYears(uniqueSchoolYears);
  }, [grades]);

  // Add state for unique school years
  const [uniqueSchoolYears, setUniqueSchoolYears] = useState([]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // First get the latest semester info
      const latestSemesterResponse = await fetch(
        "http://localhost:5001/semester/get_latest_filter"
      );
      const latestSemesterData = await latestSemesterResponse.json();

      // Set both form and filter values
      setSchoolYear(latestSemesterData.school_year);
      setSemester(latestSemesterData.semester);
      setSchoolYearFilter(latestSemesterData.school_year);
      setSemesterFilter(latestSemesterData.semester);

      const cachedStudents = localStorage.getItem("students");
      const cachedCourses = localStorage.getItem("courses");

      // Fetch ALL grades for this teacher without semester filter
      const gradesUrl = new URL("http://localhost:5001/grade/get_grades");
      gradesUrl.searchParams.append(
        "facultyID",
        localStorage.getItem("teacherID")
      );

      let gradesData; // Declare gradesData here

      if (cachedStudents && cachedCourses) {
        setStudents(JSON.parse(cachedStudents));
        setCourses(JSON.parse(cachedCourses));

        // Fetch all grades
        const gradesResponse = await fetch(gradesUrl);
        gradesData = await gradesResponse.json(); // Assign to gradesData

        // Store all grades
        setGrades(Array.isArray(gradesData) ? gradesData : []);

        // Filter to show only latest semester grades initially
        const filteredGradesData = (
          Array.isArray(gradesData) ? gradesData : []
        ).filter(
          (grade) =>
            grade.school_year === latestSemesterData.school_year &&
            grade.semester === latestSemesterData.semester
        );

        setFilteredGrades(filteredGradesData);
      } else {
        const [studentsResponse, gradesResponse, coursesResponse] =
          await Promise.all([
            fetch("http://localhost:5001/grade/get_students"),
            fetch(gradesUrl),
            fetch(
              `http://localhost:5001/course/get_courses?facultyID=${localStorage.getItem(
                "teacherID"
              )}`
            ),
          ]);

        const studentsData = await studentsResponse.json();
        gradesData = await gradesResponse.json(); // Assign to gradesData
        const coursesData = await coursesResponse.json();

        setStudents(Array.isArray(studentsData) ? studentsData : []);

        // Store all grades
        setGrades(Array.isArray(gradesData) ? gradesData : []);

        // Filter to show only latest semester grades initially
        const filteredGradesData = (
          Array.isArray(gradesData) ? gradesData : []
        ).filter(
          (grade) =>
            grade.school_year === latestSemesterData.school_year &&
            grade.semester === latestSemesterData.semester
        );

        setFilteredGrades(filteredGradesData);
        setCourses(
          Array.isArray(coursesData.courses) ? coursesData.courses : []
        );

        // Update cache
        localStorage.setItem("students", JSON.stringify(studentsData));
        localStorage.setItem("grades", JSON.stringify(gradesData)); // Cache all grades
        localStorage.setItem("courses", JSON.stringify(coursesData.courses));
      }

      // Move this after we have gradesData
      const uniqueYears = [
        ...new Set(
          (Array.isArray(gradesData) ? gradesData : []).map(
            (grade) => grade.school_year
          )
        ),
      ];
      setUniqueSchoolYears(uniqueYears);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setMessage({ type: "error", content: "Error loading grades" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentNameChange = async (e) => {
    const enteredName = e.target.value;
    setStudentName(enteredName);

    if (enteredName.length === 0) {
      setFilteredStudents([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/grade/search_students?name=${enteredName}`
      );
      const data = await response.json();
      setFilteredStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching students:", error);
      setFilteredStudents([]);
    }
  };

  const handleDeleteGrade = async (gradeDocID) => {
    setMessage({
      type: "error",
      content: (
        <div className="flex items-center justify-between">
          <span>Are you sure you want to delete this grade?</span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "http://localhost:5001/grade/delete_grade",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ gradeID: gradeDocID }),
                    }
                  );

                  if (response.ok) {
                    setGrades((prevGrades) =>
                      prevGrades.filter((grade) => grade.id !== gradeDocID)
                    );
                    setFilteredGrades((prevFiltered) =>
                      prevFiltered.filter((grade) => grade.id !== gradeDocID)
                    );
                    setMessage({
                      type: "success",
                      content: "Grade deleted successfully",
                    });
                  } else {
                    const result = await response.json();
                    setMessage({
                      type: "error",
                      content: "Failed to delete grade: " + result.error,
                    });
                  }
                } catch (error) {
                  console.error("Error deleting grade:", error);
                  setMessage({
                    type: "error",
                    content: "Error deleting grade",
                  });
                }
                setTimeout(() => setMessage({ type: "", content: "" }), 3000);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setMessage({ type: "", content: "" })}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleEditGrade = (grade) => {
    console.log("🟡 Edit Button Clicked for Grade:", grade); // Debugging log
    setSelectedGradeID(grade.id); // Ensure we're setting the correct grade ID
    setStudentID(grade.studentID);
    setStudentName(grade.studentName);
    setCourseID(grade.courseID);
    setGrade(grade.grade);
    setPeriod(grade.period);
    setSchoolYear(grade.school_year);
    setSemester(grade.semester);
  };

  const handleCancelEdit = () => {
    console.log("🔴 Cancel Edit Clicked - Resetting Form"); // Debugging log
    setSelectedGradeID(null); // This will revert to "Submit Grade"
    setStudentID("");
    setStudentName("");
    setCourseID("");
    setGrade("");
    setPeriod("");
    setSchoolYear("2024-2025");
    setSemester("");
  };

  const handleUpdateGrade = async () => {
    if (!selectedGradeID) {
      setMessage({ type: "error", content: "No grade selected for update" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/grade/edit_grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeID: selectedGradeID,
          studentID,
          courseID,
          facultyID,
          grade,
          period,
          school_year: schoolYear,
          semester,
        }),
      });

      if (response.ok) {
        // Update local state immediately
        const updatedGrade = {
          id: selectedGradeID,
          studentID,
          studentName,
          courseID,
          courseName:
            courses.find((c) => c.courseID === courseID)?.courseName || "",
          grade,
          period,
          school_year: schoolYear,
          semester,
          remarks: determineRemarks(grade),
        };

        setGrades((prevGrades) =>
          prevGrades.map((g) => (g.id === selectedGradeID ? updatedGrade : g))
        );
        setFilteredGrades((prevFiltered) =>
          prevFiltered.map((g) => (g.id === selectedGradeID ? updatedGrade : g))
        );

        // Reset form and selected grade
        handleCancelEdit();
        setMessage({ type: "success", content: "Grade updated successfully" });
      } else {
        const result = await response.json();
        setMessage({
          type: "error",
          content: "Failed to update grade: " + result.error,
        });
      }
    } catch (error) {
      console.error("❌ Error updating grade:", error);
      setMessage({ type: "error", content: "Error updating grade" });
    }
    setTimeout(() => setMessage({ type: "", content: "" }), 3000);
  };

  const handleSchoolYearChange = (e) => {
    let input = e.target.value;

    // Allow only numbers and dash (-)
    input = input.replace(/[^0-9-]/g, "");

    // Ensure the format is 20XX-20XX
    const match = input.match(/^20\d{2}-20\d{2}$/);

    if (input.length <= 9) {
      setSchoolYear(input);
    }

    if (input.length === 9 && !match) {
      alert("❌ Invalid format! Use YYYY-YYYY (e.g., 2024-2025)");
      setSchoolYear("2024-2025"); // Reset to default if incorrect
    }
  };

  const handleStudentSelect = (student) => {
    setStudentName(student.name);
    setStudentID(student.studentID);
    setFilteredStudents([]); // Hide dropdown after selection
  };

  const determineRemarks = (grade) => {
    if (grade === "") return "NOT ENCODED";
    return parseFloat(grade) >= 75 ? "PASSED" : "FAILED";
  };

  const handleSubmitGrade = async () => {
    if (
      !studentID ||
      !courseID ||
      !grade ||
      !period ||
      !schoolYear ||
      !semester ||
      !facultyID
    ) {
      setMessage({ type: "error", content: "All fields are required" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/grade/add_grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentID,
          courseID,
          facultyID,
          grade,
          period,
          remarks: determineRemarks(grade),
          school_year: schoolYear,
          semester,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Create new grade object with all necessary data
        const newGrade = {
          id: result.gradeID,
          studentID,
          studentName,
          courseID,
          courseName:
            courses.find((c) => c.courseID === courseID)?.courseName || "",
          grade,
          period,
          school_year: schoolYear,
          semester,
          remarks: determineRemarks(grade),
        };

        // Update local state immediately
        setGrades((prevGrades) => [...prevGrades, newGrade]);
        setFilteredGrades((prevFiltered) => [...prevFiltered, newGrade]);

        // Reset form
        setStudentID("");
        setStudentName("");
        setCourseID("");
        setGrade("");
        setPeriod("");
        setSchoolYear("2024-2025");
        setSemester("");

        setMessage({ type: "success", content: "Grade added successfully" });
      } else {
        setMessage({
          type: "error",
          content: "Failed to add grade: " + result.error,
        });
      }
    } catch (error) {
      console.error("❌ Error adding grade:", error);
      setMessage({ type: "error", content: "Error adding grade" });
    }
    setTimeout(() => setMessage({ type: "", content: "" }), 3000);
  };

  // Filter Handlers
  const handlePeriodFilterChange = (period) => {
    setSelectedPeriods((prevSelectedPeriods) => {
      const updatedPeriods = prevSelectedPeriods.includes(period)
        ? prevSelectedPeriods.filter((p) => p !== period)
        : [...prevSelectedPeriods, period];

      // Immediately filter grades based on all current criteria
      const filtered = grades.filter((grade) => {
        // Period filter
        if (updatedPeriods.length && !updatedPeriods.includes(grade.period))
          return false;

        // Course filter
        if (
          courseFilter &&
          !grade.courseName.toLowerCase().includes(courseFilter.toLowerCase())
        )
          return false;

        // School year filter
        if (schoolYearFilter && grade.school_year !== schoolYearFilter)
          return false;

        // Semester filter
        if (semesterFilter && grade.semester !== semesterFilter) return false;

        // Student filter
        if (
          selectedFilterStudents.length &&
          !selectedFilterStudents.some(
            (student) =>
              grade.studentName.toLowerCase() === student.name.toLowerCase()
          )
        )
          return false;

        return true;
      });

      setFilteredGrades(filtered);
      return updatedPeriods;
    });
  };

  const handleSchoolYearFilterChange = (e) => {
    const selectedYear = e.target.value;
    setSchoolYearFilter(selectedYear);

    // Immediately filter grades based on new school year
    const filtered = grades.filter((grade) => {
      // Period filter
      if (selectedPeriods.length && !selectedPeriods.includes(grade.period))
        return false;

      // Course filter
      if (
        courseFilter &&
        !grade.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      )
        return false;

      // School year filter
      if (selectedYear && grade.school_year !== selectedYear) return false;

      // Semester filter
      if (semesterFilter && grade.semester !== semesterFilter) return false;

      // Student filter
      if (
        selectedFilterStudents.length &&
        !selectedFilterStudents.some(
          (student) =>
            grade.studentName.toLowerCase() === student.name.toLowerCase()
        )
      )
        return false;

      return true;
    });

    setFilteredGrades(filtered);
  };

  const handleSemesterFilterChange = (e) => {
    const selectedSemester = e.target.value;
    setSemesterFilter(selectedSemester);

    // Immediately filter grades based on new semester
    const filtered = grades.filter((grade) => {
      // Period filter
      if (selectedPeriods.length && !selectedPeriods.includes(grade.period))
        return false;

      // Course filter
      if (
        courseFilter &&
        !grade.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      )
        return false;

      // School year filter
      if (schoolYearFilter && grade.school_year !== schoolYearFilter)
        return false;

      // Semester filter
      if (selectedSemester && grade.semester !== selectedSemester) return false;

      // Student filter
      if (
        selectedFilterStudents.length &&
        !selectedFilterStudents.some(
          (student) =>
            grade.studentName.toLowerCase() === student.name.toLowerCase()
        )
      )
        return false;

      return true;
    });

    setFilteredGrades(filtered);
  };

  // NEW: Handler for filter student query input
  const handleFilterStudentQueryChange = async (e) => {
    const query = e.target.value;
    setFilterStudentQuery(query);
    if (query.length === 0) {
      setFilterStudentSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5001/grade/search_students?name=${query}`
      );
      const data = await response.json();
      const suggestions = (Array.isArray(data) ? data : []).filter(
        (student) =>
          !selectedFilterStudents.some((s) => s.studentID === student.studentID)
      );
      setFilterStudentSuggestions(suggestions);
    } catch (error) {
      console.error("Error searching filter students:", error);
      setFilterStudentSuggestions([]);
    }
  };

  // NEW: Handler to add a student to the filter list
  const handleSelectFilterStudent = (student) => {
    setSelectedFilterStudents((prev) => [...prev, student]);
    setFilterStudentQuery("");
    setFilterStudentSuggestions([]);
  };

  // NEW: Handler to remove a selected student from filter list
  const handleRemoveFilterStudent = (studentID) => {
    setSelectedFilterStudents((prev) =>
      prev.filter((s) => s.studentID !== studentID)
    );
  };

  // Add this helper function at the top level of your component
  const sanitizeGrade = (gradeData) => {
    if (!gradeData || typeof gradeData !== "object") return null;

    // Extract only the required string/number values
    const sanitized = {
      id: gradeData.id || gradeData.gradeID || "",
      studentID:
        typeof gradeData.studentID === "string" ? gradeData.studentID : "",
      studentName:
        typeof gradeData.studentName === "string" ? gradeData.studentName : "",
      courseID:
        typeof gradeData.courseID === "string" ? gradeData.courseID : "",
      courseName:
        typeof gradeData.courseName === "string" ? gradeData.courseName : "",
      grade:
        typeof gradeData.grade === "string" ||
        typeof gradeData.grade === "number"
          ? gradeData.grade
          : "",
      period: typeof gradeData.period === "string" ? gradeData.period : "",
      school_year:
        typeof gradeData.school_year === "string" ? gradeData.school_year : "",
      semester:
        typeof gradeData.semester === "string" ? gradeData.semester : "",
      remarks: typeof gradeData.remarks === "string" ? gradeData.remarks : "",
    };

    return sanitized;
  };

  // Remove the setTimeout from applyFilters function
  const applyFilters = () => {
    setIsFiltering(true);

    const filtered = grades.filter((grade) => {
      // Period filter
      if (selectedPeriods.length && !selectedPeriods.includes(grade.period))
        return false;

      // Course filter
      if (
        courseFilter &&
        !grade.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      )
        return false;

      // School year filter
      if (schoolYearFilter && grade.school_year !== schoolYearFilter)
        return false;

      // Semester filter
      if (semesterFilter && grade.semester !== semesterFilter) return false;

      // Student filter
      if (
        selectedFilterStudents.length &&
        !selectedFilterStudents.some(
          (student) =>
            grade.studentName.toLowerCase() === student.name.toLowerCase()
        )
      )
        return false;

      return true;
    });

    setFilteredGrades(filtered);
    setIsFiltering(false);
  };

  // Add this new handler function
  const handleResetFilters = () => {
    setSelectedPeriods([]);
    setCourseFilter("");
    setSchoolYearFilter("");
    setSemesterFilter("");
    setSelectedFilterStudents([]);
    setFilterStudentQuery("");
    setFilterStudentSuggestions([]);
    setFilteredGrades(grades); // Reset to show all grades
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);
    applyFilters();
  };

  return (
    <div className="w-[24rem] md:w-[47rem] lg:w-[64rem] xl:w-[96%] mx-auto p-2 sm:p-3 bg-white fade-in">
      {/* Updated toast message display */}
      {message.content && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      <div className="w-full mx-auto p-2 sm:p-4 bg-white mt-2 sm:mt-4 flex flex-col justify-center">
        <h2 className="relative top-0 text-2xl sm:text-3xl font-bold text-center text-[#0065A8] mb-2 fade-in delay-100">
          Grade Management
        </h2>

        {/* Search and Filter Section - Updated for better mobile layout */}
        <div className="mt-4 fade-in delay-200 z-50 flex justify-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[60%] justify-center">
            {/* Search Input Container */}
            <div className="relative w-full lg:w-[26rem]">
              <div className="border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-nowrap items-center min-h-[42px] w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-1 w-auto">
                  {selectedFilterStudents.map((student) => (
                    <div
                      key={student.studentID}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center text-sm whitespace-nowrap"
                    >
                      <span className="truncate max-w-[150px]">
                        {student.name}
                      </span>
                      <span
                        onClick={() =>
                          handleRemoveFilterStudent(student.studentID)
                        }
                        className="ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={filterStudentQuery}
                    onChange={handleFilterStudentQueryChange}
                    placeholder="Search by Name"
                    className="border-none focus:ring-0 outline-none flex-1 min-w-[120px] text-sm py-1"
                  />
                </div>
              </div>

              {/* Dropdown Suggestions */}
              {filterStudentSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg z-[60]">
                  {filterStudentSuggestions.map((student) => (
                    <li
                      key={student.studentID}
                      onClick={() => handleSelectFilterStudent(student)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {student.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Buttons Container */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition text-sm
                  ${SearchClicked ? "scale-90" : "scale-100"}`}
                onClick={() => {
                  setSearchClicked(true);
                  setTimeout(() => setSearchClicked(false), 300);
                  applyFilters();
                }}
              >
                Search
              </button>

              <button
                onClick={() => {
                  setFilterClicked(true);
                  setTimeout(() => setFilterClicked(false), 300);
                  setShowFilters(!showFilters);
                }}
                className={`w-12 md:w-12 lg:w-auto bg-[#057DCD] text-white p-2 rounded-lg shadow-md flex items-center justify-center hover:bg-[#54BEFF] transition
                  ${FilterClicked ? "scale-90" : "scale-100"}`}
              >
                <FilterIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="relative">
          {showFilters && (
            <div className="absolute right-0 sm:right-20 lg:right-64 mt-1 w-full sm:w-80 rounded-xl shadow-2xl overflow-hidden z-40 max-h-[75vh] sm:max-h-[75vh] lg:max-h-[78vh] flex flex-col">
              {/* Filter Header */}
              <div className="bg-[#0065A8] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  FILTERS
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-white hover:text-gray-200 transition-transform hover:scale-110"
                  title="Reset filters"
                >
                  <RedoIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Content - Made scrollable */}
              <div className="bg-white p-4 md:p-6 space-y-4 overflow-y-auto">
                {/* Period Filter */}
                <div className="min-h-fit">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <div className="max-h-32 sm:max-h-40 overflow-y-auto border-2 border-[#0065A8] rounded-lg">
                    {["Prelim", "Midterm", "Pre-Final", "Final"].map(
                      (period) => (
                        <div key={period} className="px-2 py-1">
                          <label
                            className={`flex items-center p-2 rounded-lg transition-colors duration-200
                        ${
                          selectedPeriods.includes(period)
                            ? "bg-[#0065A8] text-white"
                            : "hover:bg-[#54BEFF] hover:text-white"
                        }`}
                          >
                            <input
                              type="checkbox"
                              value={period}
                              checked={selectedPeriods.includes(period)}
                              onChange={() => handlePeriodFilterChange(period)}
                              className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded
                            checked:bg-[#0065A8] checked:hover:bg-[#54BEFF]"
                            />
                            <span
                              className={
                                selectedPeriods.includes(period)
                                  ? "text-white"
                                  : "text-gray-700"
                              }
                            >
                              {period}
                            </span>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Other filters remain the same */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    value={courseFilter}
                    onChange={handleCourseFilterChange}
                    placeholder="Search Course"
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  />
                </div>

                {/* School Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Year
                  </label>
                  <select
                    value={schoolYearFilter}
                    onChange={handleSchoolYearFilterChange}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">All School Years</option>
                    {uniqueSchoolYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={semesterFilter}
                    onChange={handleSemesterFilterChange}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">All Semesters</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Section - Unified table structure */}
        <div className="mt-4 shadow-md overflow-hidden rounded-lg fade-in delay-300 relative z-0">
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <table
                className="w-full bg-white text-center"
                style={{ minWidth: "1200px" }}
              >
                <thead className="bg-[#0065A8] text-white sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="px-4 py-3 min-w-[120px]">Student ID</th>
                    <th className="px-4 py-3 min-w-[180px]">Student Name</th>
                    <th className="px-4 py-3 min-w-[200px]">Course</th>
                    <th className="px-4 py-3 min-w-[100px]">Grade</th>
                    <th className="px-4 py-3 min-w-[120px]">Period</th>
                    <th className="px-4 py-3 min-w-[150px]">School Year</th>
                    <th className="px-4 py-3 min-w-[100px]">Semester</th>
                    <th className="px-4 py-3 min-w-[140px]">Remarks</th>
                    <th className="px-4 py-3 pr-7 min-w-[80px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Your existing tbody content */}
                  {isLoading || isFiltering ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse border-b">
                        <td className="px-4 py-3 w-[150px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-20"></div>
                        </td>
                        <td className="px-4 py-3 w-[200px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-28"></div>
                        </td>
                        <td className="px-4 py-3 w-[350px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-32"></div>
                        </td>
                        <td className="px-4 py-3 w-[140px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-12"></div>
                        </td>
                        <td className="px-4 py-3 w-[150px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-16"></div>
                        </td>
                        <td className="px-4 py-3 w-[180px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-24"></div>
                        </td>
                        <td className="px-4 py-3 w-[120px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-12"></div>
                        </td>
                        <td className="px-4 py-3 w-[160px]">
                          <div className="h-4 bg-gray-200 rounded mx-auto w-20"></div>
                        </td>
                        <td className="px-4 py-3 w-[100px]">
                          <div className="flex justify-center space-x-2">
                            <div className="h-5 w-5 bg-gray-300 rounded"></div>
                            <div className="h-5 w-5 bg-gray-300 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredGrades.length > 0 ? (
                    filteredGrades.map((gradeData) => {
                      const grade = sanitizeGrade(gradeData);
                      if (!grade) return null;

                      return (
                        <tr
                          key={grade.id}
                          className="border-b hover:bg-gray-100 align-middle"
                        >
                          <td className="px-4 py-3 w-[150px] min-w-[120px]">
                            {String(grade.studentID)}
                          </td>
                          <td className="px-4 py-3 w-[200px] min-w-[180px]">
                            {String(grade.studentName)}
                          </td>
                          <td className="px-4 py-3 w-[350px] min-w-[200px]">
                            {String(grade.courseName)}
                          </td>
                          <td className="px-4 py-3 w-[140px] min-w-[100px]">
                            {String(grade.grade)}
                          </td>
                          <td className="px-4 py-3 w-[150px] min-w-[120px]">
                            {String(grade.period)}
                          </td>
                          <td className="px-4 py-3 w-[180px] min-w-[150px]">
                            {String(grade.school_year)}
                          </td>
                          <td className="px-4 py-3 w-[120px] min-w-[100px]">
                            {String(grade.semester)}
                          </td>
                          <td
                            className={`px-4 py-3 w-[160px] min-w-[140px] ${
                              grade.remarks === "PASSED"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {String(grade.remarks)}
                          </td>
                          <td className="align-middle px-4 py-3 w-[100px] min-w-[80px] space-x-3">
                            <div className="flex items-center justify-center h-full space-x-3">
                              <button
                                className={`text-gray-500 hover:text-gray-700 ${
                                  EditClicked ? "scale-90" : "scale-100"
                                }`}
                                onClick={() => {
                                  setEditClicked(true);
                                  setTimeout(() => setEditClicked(false), 300);
                                  handleEditGrade(gradeData);
                                }}
                              >
                                <EditIcon className="w-5 h-5 inline-block" />
                              </button>
                              <button
                                className={`text-gray-500 hover:text-gray-700 ${
                                  DeleteClicked ? "scale-90" : "scale-100"
                                }`}
                                onClick={() => {
                                  setDeleteClicked(true);
                                  setTimeout(
                                    () => setDeleteClicked(false),
                                    300
                                  );
                                  handleDeleteGrade(grade.id);
                                }}
                              >
                                <DeleteIcon className="w-5 h-5 inline-block" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No grades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Form Section - Updated grid layout for tablet */}
        <div className="mt-6 shadow-md rounded-lg p-2 mx-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
            {/* Student Name Input */}
            <div className="relative col-span-1 md:col-span-1">
              <input
                type="text"
                placeholder="Student Name"
                value={studentName}
                onChange={handleStudentNameChange}
                className="rounded-lg px-4 py-2 w-full outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
              />
              {filteredStudents.length > 0 && (
                <ul className="absolute z-[70] bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                  {filteredStudents.map((student) => (
                    <li
                      key={student.studentID}
                      onClick={() => handleStudentSelect(student)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      {student.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Rest of the form inputs with consistent col-span-1 */}
            <select
              value={courseID}
              onChange={(e) => setCourseID(e.target.value)}
              className="col-span-1 rounded-lg px-4 py-2 w-full focus:ring focus:ring-blue-300 focus:border-blue-500"
            >
              <option value="">Course</option>
              {courses.map((course) => (
                <option key={course.courseID} value={course.courseID}>
                  {course.courseName}
                </option>
              ))}
            </select>

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="col-span-1 rounded-lg px-4 py-2 w-full focus:ring focus:ring-blue-400 focus:border-blue-500"
            >
              <option value="">Semester</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
            </select>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="col-span-1 rounded-lg px-4 py-2 w-full focus:ring focus:ring-blue-400 focus:border-blue-500"
            >
              <option value="">Period</option>
              <option value="Prelim">Prelim</option>
              <option value="Midterm">Midterm</option>
              <option value="Pre-Final">Pre-Final</option>
              <option value="Final">Final</option>
            </select>

            <input
              type="number"
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="col-span-1 rounded-lg px-4 py-2 w-full text-center focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="YYYY-YYYY"
              value={schoolYear}
              onChange={(e) => handleSchoolYearChange(e)}
              className="col-span-1 rounded-lg px-4 py-2 w-full text-center focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-500"
            />

            {/* Button Container */}
            <div className="col-span-1 flex gap-2 md:justify-end">
              <button
                onClick={() => {
                  setSubmitClicked(true);
                  setTimeout(() => {
                    setSubmitClicked(false);
                    setTimeout(() => {
                      if (selectedGradeID) {
                        // Update grade
                        handleUpdateGrade();
                      } else {
                        // Submit new grade
                        handleSubmitGrade();
                      }
                    }, 500);
                  }, 200);
                }}
                className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-white shadow-md 
                  ${SubmitClicked ? "scale-90" : "scale-100"}
                  ${
                    selectedGradeID
                      ? "bg-yellow-400 hover:bg-yellow-300"
                      : "bg-[#057DCD] hover:bg-[#54BEFF] focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  }`}
              >
                {selectedGradeID ? "Update" : "Submit"}
              </button>

              {selectedGradeID && (
                <button
                  onClick={() => {
                    setCancelClicked(true);
                    setTimeout(() => {
                      setCancelClicked(false);
                      setTimeout(() => handleCancelEdit(), 500);
                    }, 200);
                  }}
                  className={`flex-1 md:flex-initial bg-gray-500 text-white px-5 py-2 rounded-lg transition-colors hover:bg-gray-400 
                    ${CancelClicked ? "scale-90" : "scale-100"}`}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
