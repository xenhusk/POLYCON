import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API_URL from '../apiConfig';
import { ReactComponent as DeleteIcon } from "./icons/delete.svg";
import { ReactComponent as EditIcon } from "./icons/Edit.svg";
import { ReactComponent as FilterIcon } from "./icons/FilterAdd.svg";
import { ReactComponent as RedoIcon } from "./icons/redo.svg"; // Add this import
import { motion, AnimatePresence } from 'framer-motion';
import "./transitions.css";
import { fetchInitialGradeData } from '../utils/gradeUtils';

// Edit Grade Modal Component
const EditGradeModal = ({ grade, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: grade.id,
    studentID: grade.studentID,
    studentName: grade.studentName,
    courseID: grade.courseID,
    courseName: grade.courseName,
    grade: grade.grade,
    period: grade.period,
    school_year: grade.school_year,
    semester: grade.semester
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000]"
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        zIndex: 10000
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#fc6969] text-white p-4 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Grade</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form id="edit-grade-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={formData.studentID}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={formData.studentName}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <input
              type="text"
              value={`${formData.courseID} - ${formData.courseName}`}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period *
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({...formData, period: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
              required
            >
              <option value="">Select Period</option>
              <option value="Prelim">Prelim</option>
              <option value="Midterm">Midterm</option>
              <option value="Pre-Final">Pre-Final</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Year *
            </label>
            <select
              value={formData.school_year}
              onChange={(e) => setFormData({...formData, school_year: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
              required
            >
              <option value="">Select School Year</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester *
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
              required
            >
              <option value="">Select Semester</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
            </select>
          </div>
          </form>
        </div>

        {/* Modal Footer - Fixed at bottom */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-grade-form"
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#fc6969] border border-transparent rounded-md hover:bg-[#ff7b7b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fc6969]"
          >
            Update Grade
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default function AddGrade() {
  const [studentID, setStudentID] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseID, setCourseID] = useState("");
  const [courseName, setCourseName] = useState("");
  // const [courseName, setCourseName] = useState(""); // Removed unused variable
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
  // const [filteredCourses, setFilteredCourses] = useState([]); // Removed unused variable
  const [schoolYearFilter, setSchoolYearFilter] = useState(""); // School year filter input
  const [semesterFilter, setSemesterFilter] = useState(""); // Semester filter input

  // NEW: States for filtering by student names (Google Docs style)
  const [filterStudentQuery, setFilterStudentQuery] = useState("");
  const [selectedFilterStudents, setSelectedFilterStudents] = useState([]);
  const [filterStudentSuggestions, setFilterStudentSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [FilterClicked, setFilterClicked] = useState(false);
  const [SearchClicked, setSearchClicked] = useState(false);
  const [SubmitClicked, setSubmitClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" }); // Add this new state
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [gradeToEdit, setGradeToEdit] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Add state for unique school years
  const [uniqueSchoolYears, setUniqueSchoolYears] = useState([]);

  // Wrapper function to call external fetchInitialGradeData
  const fetchInitialData = async () => {
    const setters = {
      setIsLoading,
      setSchoolYear,
      setSemester,
      setSchoolYearFilter,
      setSemesterFilter,
      setStudents,
      setGrades,
      setFilteredGrades,
      setCourses,
      setUniqueSchoolYears,
      setMessage
    };
    await fetchInitialGradeData(setters);
  };

  useEffect(() => {
    const uniqueSchoolYears = [
      ...new Set(grades.map((grade) => grade.school_year)),
    ];
    setUniqueSchoolYears(uniqueSchoolYears);
  }, [grades]);

  const handleStudentNameChange = async (e) => {
    const enteredName = e.target.value;
    setStudentName(enteredName);

    if (enteredName.length === 0) {
      setFilteredStudents([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/grade/search_students?name=${enteredName}`
      );
      const data = await response.json();
      setFilteredStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching students:", error);
      setFilteredStudents([]);
    }
  };

  const handleDeleteGrade = async (gradeDocID) => {
    setGradeToDelete(gradeDocID);
    setShowDeleteModal(true);
  };

  const confirmDeleteGrade = async () => {
    if (!gradeToDelete) return;
    
    try {
      const response = await fetch(
        `${API_URL}/grade/delete_grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gradeID: gradeToDelete }),
        }
      );
      if (response.ok) {
        // Reload grades
        const gradesUrl = new URL(`${API_URL}/grade/get_grades`);
        gradesUrl.searchParams.append(
          "facultyID",
          localStorage.getItem("teacherID")
        );
        const gradesResponse = await fetch(gradesUrl);
        const gradesData = await gradesResponse.json();
        // Update grades state
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setFilteredGrades(Array.isArray(gradesData) ? gradesData.filter(
          (grade) => grade.school_year === schoolYear && grade.semester === semester
        ) : []);
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
    
    setShowDeleteModal(false);
    setGradeToDelete(null);
    setTimeout(() => setMessage({ type: "", content: "" }), 3000);
  };

  const handleEditGrade = (grade) => {
    console.log("🟡 Edit Button Clicked for Grade:", grade); // Debugging log
    setGradeToEdit(grade);
    setShowEditModal(true);
  };
  const handleCancelEdit = () => {
    console.log("🔴 Cancel Edit Clicked - Resetting Form"); // Debugging log
    setSelectedGradeID(null); // This will revert to "Submit Grade"
    setStudentID("");
    setStudentName("");
    setCourseID("");
    setCourseName("");
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
      const response = await fetch(`${API_URL}/grade/edit_grade`, {
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
        // Reload grades
        const gradesUrl = new URL(`${API_URL}/grade/get_grades`);
        gradesUrl.searchParams.append(
          "facultyID",
          localStorage.getItem("teacherID")
        );
        const gradesResponse = await fetch(gradesUrl);
        const gradesData = await gradesResponse.json();
        // Update grades state
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setFilteredGrades(Array.isArray(gradesData) ? gradesData.filter(
          (grade) => grade.school_year === schoolYear && grade.semester === semester
        ) : []);
        // Don't reset page after update
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
    // If student has a courseID or course property, set it here
    if (student.courseID) {
      setCourseID(student.courseID);
    } else if (student.course) {
      setCourseID(student.course);
    }
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
      const response = await fetch(`${API_URL}/grade/add_grade`, {
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
        // Reload grades
        const gradesUrl = new URL(`${API_URL}/grade/get_grades`);
        gradesUrl.searchParams.append(
          "facultyID",
          localStorage.getItem("teacherID")
        );
        const gradesResponse = await fetch(gradesUrl);
        const gradesData = await gradesResponse.json();
        // Update grades state
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setFilteredGrades(Array.isArray(gradesData) ? gradesData.filter(
          (grade) => grade.school_year === schoolYear && grade.semester === semester
        ) : []);
        // Don't reset page after add
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
      setCurrentPage(1); // Reset to first page when filters change
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
    setCurrentPage(1); // Reset to first page when filters change
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
    setCurrentPage(1); // Reset to first page when filters change
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
        `${API_URL}/grade/search_students?name=${query}`
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
    setCurrentPage(1); // Reset to first page when filters change
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGrades = filteredGrades.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);
    setCurrentPage(1); // Reset to first page when filters change
    applyFilters();
  };

  // Move useEffect to the end to ensure all functions are defined
  useEffect(() => {
    const storedTeacherID = localStorage.getItem("teacherID");
    if (storedTeacherID) {
      setFacultyID(storedTeacherID);
      
      // Add this new fetch for latest semester defaults
      const fetchLatestSemester = async () => {
        try {
          const response = await fetch(
            `${API_URL}/semester/get_latest_filter`
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

      // Only call fetchInitialData if teacherID is available
      try {
        console.log("About to call fetchInitialData and fetchLatestSemester");
        Promise.all([fetchInitialData(), fetchLatestSemester()]).catch(error => {
          console.error("Error in Promise.all:", error);
          setMessage({ type: "error", content: "Failed to load initial data. Please refresh the page." });
        });
      } catch (error) {
        console.error("Error calling fetchInitialData:", error);
        setMessage({ type: "error", content: "Failed to initialize data. Please refresh the page." });
      }
    } else {
      console.log("teacherID not found in localStorage, skipping data fetch");
    }
  }, []);

  // Additional useEffect to fetch data when facultyID becomes available
  useEffect(() => {
    if (facultyID && !grades.length) {
      console.log("FacultyID is now available, fetching data...");
      try {
        fetchInitialData().catch(error => {
          console.error("Error in delayed fetchInitialData:", error);
          setMessage({ type: "error", content: "Failed to load data. Please refresh the page." });
        });
      } catch (error) {
        console.error("Error calling delayed fetchInitialData:", error);
        setMessage({ type: "error", content: "Failed to initialize delayed data. Please refresh the page." });
      }
    }
  }, [facultyID]);

  return (
    <div className="w-full mx-auto p-2 sm:p-4 lg:p-6 bg-white fade-in overflow-x-hidden">
      {/* Updated toast message display */}
      {message.content && (
        <div
          className={`fixed top-5 right-5 left-5 sm:left-auto sm:right-5 p-3 sm:p-4 rounded-lg shadow-lg z-50 text-sm sm:text-base ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      <div className="w-full mx-auto p-2 sm:p-4 bg-white mt-2 sm:mt-4 flex flex-col justify-center">
        {/* Centered Page Title */}
        <div className="flex justify-center items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0065A8] fade-in delay-100 text-center">
            Grade Management
          </h2>
        </div>

        {/* Search and Filter Section - Enhanced mobile layout */}
        <div className="mt-4 fade-in delay-200 z-50 flex justify-center">
          <div className="flex flex-col gap-3 w-full max-w-4xl">
            {/* Search Input Container */}
            <div className="relative w-full">
              <div className="border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px] w-full gap-1">
                <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                  {selectedFilterStudents.map((student) => (
                    <div
                      key={student.studentID}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center text-xs sm:text-sm whitespace-nowrap"
                    >
                      <span className="truncate max-w-[120px] sm:max-w-[150px]">
                        {student.name}
                      </span>
                      <span
                        onClick={() => handleRemoveFilterStudent(student.studentID)}
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
            <div className="flex gap-3 w-full justify-center sm:justify-start">
              <button
                className={`flex-1 max-w-[120px] sm:flex-none bg-[#057DCD] text-white px-4 sm:px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition text-sm
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
                className={`w-12 h-10 sm:w-auto bg-[#057DCD] text-white p-2 sm:px-3 rounded-lg shadow-md flex items-center justify-center hover:bg-[#54BEFF] transition
                  ${FilterClicked ? "scale-90" : "scale-100"}`}
              >
                <FilterIcon className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Filter</span>
              </button>

              <button
                onClick={() => {
                  handleResetFilters();
                }}
                className={`flex-1 max-w-[120px] sm:flex-none bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition text-sm flex items-center justify-center`}
              >
                <RedoIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel - Enhanced mobile responsiveness */}
        <div className="relative">
          {showFilters && (
            <div className="absolute left-0 right-0 sm:right-0 sm:left-auto sm:w-80 lg:w-96 mt-1 rounded-xl shadow-2xl overflow-hidden z-40 max-h-[70vh] flex flex-col mx-2 sm:mx-0">
              {/* Filter Header */}
              <div className="bg-[#0065A8] px-4 py-3 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-semibold text-white">FILTERS</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="text-white hover:text-gray-200 transition-transform hover:scale-110 p-1"
                    title="Reset filters"
                  >
                    <RedoIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-white hover:text-gray-200 transition-transform hover:scale-110 p-1 sm:hidden text-xl leading-5"
                    title="Close filters"
                  >
                    ×
                  </button>
                </div>
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
        </div>        {/* Table Section - Enhanced mobile responsiveness */}
        <div className="mt-4 shadow-md overflow-hidden rounded-lg fade-in delay-300 relative z-0">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="max-h-[60vh] overflow-y-auto space-y-3 p-4">
              {isLoading || isFiltering ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : currentGrades.length > 0 ? (
                currentGrades.map((gradeData) => {
                  const grade = sanitizeGrade(gradeData);
                  if (!grade) return null;

                  return (
                    <div key={grade.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-sm">{grade.studentName}</h3>
                          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">{grade.studentID}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                            onClick={() => {
                              handleEditGrade(gradeData);
                            }}
                            title="Edit Grade"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                            onClick={() => handleDeleteGrade(grade.id)}
                            title="Delete Grade"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-500 block mb-1">Course:</span>
                          <p className="font-medium text-gray-800 truncate">{grade.courseName}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <span className="text-gray-500 block mb-1">Grade:</span>
                          <p className="font-bold text-blue-600">{grade.grade}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-500 block mb-1">Period:</span>
                          <p className="font-medium text-gray-800">{grade.period}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-500 block mb-1">Semester:</span>
                          <p className="font-medium text-gray-800">{grade.semester}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-500 block mb-1">School Year:</span>
                          <p className="font-medium text-gray-800">{grade.school_year}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-500 block mb-1">Remarks:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            grade.remarks === "PASSED" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {grade.remarks}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No grades found
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full bg-white text-center shadow-sm rounded-lg overflow-hidden" style={{ minWidth: "800px" }}>
                <thead className="bg-gradient-to-r from-[#0065A8] to-[#0077BE] text-white sticky top-0 z-10">
                  <tr className="border-b border-blue-700">
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[80px] lg:min-w-[120px]">Student ID</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[120px] lg:min-w-[180px]">Student Name</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[140px] lg:min-w-[200px]">Course</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[60px] lg:min-w-[100px]">Grade</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[80px] lg:min-w-[120px]">Period</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[100px] lg:min-w-[150px]">School Year</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[70px] lg:min-w-[100px]">Semester</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[90px] lg:min-w-[140px]">Remarks</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[80px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Desktop table loading state */}
                  {isLoading || isFiltering ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse border-b">
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-24"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-32"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-20"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        <td className="px-2 lg:px-4 py-3">
                          <div className="flex justify-center space-x-1">
                            <div className="h-4 w-4 bg-gray-300 rounded"></div>
                            <div className="h-4 w-4 bg-gray-300 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : currentGrades.length > 0 ? (
                    currentGrades.map((gradeData) => {
                      const grade = sanitizeGrade(gradeData);
                      if (!grade) return null;

                      return (
                        <tr key={grade.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 align-middle">
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700 font-medium">{String(grade.studentID)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-800 font-medium">{String(grade.studentName)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700">{String(grade.courseName)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-bold text-blue-600 bg-blue-50 rounded-md mx-1">{String(grade.grade)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700">{String(grade.period)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700">{String(grade.school_year)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700">{String(grade.semester)}</td>
                          <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              grade.remarks === "PASSED" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {String(grade.remarks)}
                            </span>
                          </td>
                          <td className="align-middle px-2 lg:px-4 py-3">
                            <div className="flex items-center justify-center h-full space-x-1 lg:space-x-2">
                              <button
                                className={`text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200 ${
                                  EditClicked ? "scale-90" : "scale-100"
                                }`}
                                onClick={() => {
                                  setEditClicked(true);
                                  setTimeout(() => setEditClicked(false), 300);
                                  handleEditGrade(gradeData);
                                }}
                                title="Edit Grade"
                              >
                                <EditIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                              </button>
                              <button
                                className={`text-gray-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200 ${
                                  DeleteClicked ? "scale-90" : "scale-100"
                                }`}
                                onClick={() => {
                                  setDeleteClicked(true);
                                  setTimeout(() => setDeleteClicked(false), 300);
                                  handleDeleteGrade(grade.id);
                                }}
                                title="Delete Grade"
                              >
                                <DeleteIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No grades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {filteredGrades.length > itemsPerPage && (
          <div className="mt-4 flex justify-center items-center gap-2 sm:gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#057DCD] text-white hover:bg-[#54BEFF]"
              }`}
            >
              Previous
            </button>
            
            <div className="flex gap-1 sm:gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 sm:px-3 py-1 rounded text-sm ${
                      currentPage === pageNum
                        ? "bg-[#057DCD] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#057DCD] text-white hover:bg-[#54BEFF]"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Results Info */}
        <div className="mt-2 text-center text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length} grades
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000]"
            onClick={() => setShowDeleteModal(false)}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0,
              zIndex: 10000
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Grade</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this grade? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteGrade}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Edit Grade Modal */}
      <AnimatePresence>
        {showEditModal && gradeToEdit && (
          <EditGradeModal 
            grade={gradeToEdit}
            onClose={() => {
              setShowEditModal(false);
              setGradeToEdit(null);
            }}
            onSave={async (updatedGrade) => {
              try {
                const response = await fetch(`${API_URL}/grade/edit_grade`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updatedGrade),
                });
                
                if (response.ok) {
                  // Reload grades
                  await fetchInitialData();
                  setMessage({
                    type: "success",
                    content: "Grade updated successfully",
                  });
                } else {
                  const result = await response.json();
                  setMessage({
                    type: "error",
                    content: "Failed to update grade: " + result.error,
                  });
                }
              } catch (error) {
                console.error("Error updating grade:", error);
                setMessage({
                  type: "error",
                  content: "Error updating grade",
                });
              }
              
              setShowEditModal(false);
              setGradeToEdit(null);
              setTimeout(() => setMessage({ type: "", content: "" }), 3000);
            }}
          />
        )}
      </AnimatePresence>

    </div>
    );
  }
