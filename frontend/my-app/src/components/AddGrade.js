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
import { getProfilePictureUrl } from '../utils/utils';

// Modal variants for animations (same as AddGradePopup)
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// CSS for hiding scrollbar (same as AddGradePopup)
const modalStyles = `
  .modal-no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .modal-no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles into head if not already present
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('modal-scrollbar-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'modal-scrollbar-styles';
    style.textContent = modalStyles;
    document.head.appendChild(style);
  }
}

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
    <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: '1rem'
    }}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
        }}
      >
        {/* Modal Header */}
        <div className="bg-[#fc6969] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-white">
            Edit Grade
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <form id="edit-grade-form" onSubmit={handleSubmit}>
            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={formData.studentID}
                disabled
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={formData.studentName}
                disabled
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <input
                type="text"
                value={`${formData.courseID} - ${formData.courseName}`}
                disabled
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Grade and Period Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <input
                  type="number"
                  placeholder="Enter grade"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full border-2 border-[#fc6969] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <input
                  type="text"
                  value={formData.period}
                  disabled
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Semester and School Year Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  disabled
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Year
                </label>
                <input
                  type="text"
                  value={formData.school_year}
                  disabled
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer - Now outside the padded container to reach edges */}
        <div className="flex mt-4">
          <button
            type="submit"
            form="edit-grade-form"
            className="flex-1 py-3 sm:py-4 bg-[#fc6969] hover:bg-[#ff7b7b] text-white text-center justify-center rounded-bl-xl transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium"
          >
            Update Grade
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 rounded-br-xl hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>,
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
  const [tempFilters, setTempFilters] = useState({
    schoolYearFilter: "",
    semesterFilter: "",
    selectedPeriods: [],
    courseFilter: "",
    selectedFilterStudents: []
  }); // Temporary filter state for modal
  const [isApplyingFilters, setIsApplyingFilters] = useState(false); // Loading state for filter application
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

  // Initialize temp filters when modal opens
  useEffect(() => {
    if (showFilters) {
      setTempFilters({
        schoolYearFilter,
        semesterFilter,
        selectedPeriods: [...selectedPeriods],
        courseFilter,
        selectedFilterStudents: [...selectedFilterStudents]
      });
    }
  }, [showFilters, schoolYearFilter, semesterFilter, selectedPeriods, courseFilter, selectedFilterStudents]);

  // Function to apply filters with feedback
  const applyFilters = async () => {
    setIsApplyingFilters(true);
    
    // Apply temporary filters to actual state
    setSchoolYearFilter(tempFilters.schoolYearFilter);
    setSemesterFilter(tempFilters.semesterFilter);
    setSelectedPeriods([...tempFilters.selectedPeriods]);
    setCourseFilter(tempFilters.courseFilter);
    setSelectedFilterStudents([...tempFilters.selectedFilterStudents]);
    
    // Apply the filters
    const filtered = grades.filter((grade) => {
      // Period filter
      if (tempFilters.selectedPeriods.length && !tempFilters.selectedPeriods.includes(grade.period))
        return false;

      // Course filter
      if (
        tempFilters.courseFilter &&
        !grade.courseName.toLowerCase().includes(tempFilters.courseFilter.toLowerCase())
      )
        return false;

      // School year filter
      if (tempFilters.schoolYearFilter && grade.school_year !== tempFilters.schoolYearFilter) return false;

      // Semester filter
      if (tempFilters.semesterFilter && grade.semester !== tempFilters.semesterFilter) return false;

      // Student filter
      if (
        tempFilters.selectedFilterStudents.length &&
        !tempFilters.selectedFilterStudents.some(
          (student) =>
            grade.studentName.toLowerCase() === student.name.toLowerCase()
        )
      )
        return false;

      return true;
    });

    setFilteredGrades(filtered);
    setCurrentPage(1);
    
    // Show feedback message
    setTimeout(() => {
      setMessage({
        type: "success",
        content: `Filters applied! Found ${filtered.length} grade${filtered.length !== 1 ? 's' : ''}.`
      });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
    }, 500);
    
    setTimeout(() => {
      setIsApplyingFilters(false);
      setShowFilters(false);
    }, 600);
  };

  // Function to reset filters
  const resetFilters = () => {
    setTempFilters({
      schoolYearFilter: "",
      semesterFilter: "",
      selectedPeriods: [],
      courseFilter: "",
      selectedFilterStudents: []
    });
    // Also reset the main selected students state
    setSelectedFilterStudents([]);
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
        const newGrades = Array.isArray(gradesData) ? gradesData : [];
        setGrades(newGrades);
        // Apply all current filters to maintain search and other filter states
        setFilteredGrades(applyAllFilters(newGrades));
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
        const newGrades = Array.isArray(gradesData) ? gradesData : [];
        setGrades(newGrades);
        // Apply all current filters to maintain search and other filter states
        setFilteredGrades(applyAllFilters(newGrades));
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
        const newGrades = Array.isArray(gradesData) ? gradesData : [];
        setGrades(newGrades);
        // Apply all current filters to maintain search and other filter states
        setFilteredGrades(applyAllFilters(newGrades));
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

  // Add click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close main search dropdown
      if (filterStudentSuggestions.length > 0) {
        const searchContainer = document.querySelector('[data-search-container]');
        if (searchContainer && !searchContainer.contains(event.target)) {
          setFilterStudentSuggestions([]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterStudentSuggestions.length]);

  // NEW: Handler to add a student to the filter list
  const handleSelectFilterStudent = (student) => {
    // Check if student is already selected to avoid duplicates
    if (selectedFilterStudents.some(s => s.studentID === student.studentID)) {
      return;
    }
    
    // Update both the main state and temp filters state
    setSelectedFilterStudents(prev => [...prev, student]);
    setTempFilters(prev => ({
      ...prev,
      selectedFilterStudents: [...prev.selectedFilterStudents, student]
    }));
    setFilterStudentQuery("");
    setFilterStudentSuggestions([]);
  };

  // NEW: Handler to remove a selected student from filter list
  const handleRemoveFilterStudent = (studentID) => {
    // Update both the main state and temp filters state
    setSelectedFilterStudents(prev => prev.filter((s) => s.studentID !== studentID));
    setTempFilters(prev => ({
      ...prev,
      selectedFilterStudents: prev.selectedFilterStudents.filter((s) => s.studentID !== studentID)
    }));
  };

  // Helper function to apply all current filters to grades
  const applyAllFilters = (gradesToFilter) => {
    return gradesToFilter.filter((grade) => {
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
      if (schoolYearFilter && grade.school_year !== schoolYearFilter) return false;

      // Semester filter
      if (semesterFilter && grade.semester !== semesterFilter) return false;

      // Student filter (search filter)
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
    
    // Also reset temp filters
    setTempFilters({
      schoolYearFilter: "",
      semesterFilter: "",
      selectedPeriods: [],
      courseFilter: "",
      selectedFilterStudents: []
    });
    
    // Show feedback message
    setMessage({
      type: "success",
      content: "All filters have been reset. Showing all grades."
    });
    setTimeout(() => setMessage({ type: "", content: "" }), 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Grade Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto"
          >
            Manage student grades with precision and efficiency
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ overflow: 'visible' }}>
        {/* Updated toast message display */}
        {message.content && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-5 right-5 left-5 sm:left-auto sm:right-5 p-4 rounded-xl shadow-xl z-50 text-sm sm:text-base backdrop-blur-sm ${
              message.type === "success"
                ? "bg-green-500/90 text-white border border-green-400"
                : "bg-red-500/90 text-white border border-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.content}
            </div>
          </motion.div>
        )}

        {/* Search and Filter Section - Enhanced with modern card design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex justify-center"
          style={{ zIndex: 10 }}
        >
          <div className="w-full max-w-6xl">
            {/* Search Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 relative" style={{ zIndex: 11, overflow: 'visible' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Search Students</h3>
              </div>
              
              <div className="relative w-full" style={{ zIndex: 12 }} data-search-container>
                <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center min-h-[50px] w-full gap-2 hover:border-[#0065A8] transition-colors">
                  {/* Scrollable Container with Selected Students and Search Input */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
                    {/* Selected Students */}
                    {selectedFilterStudents.map((student) => (
                      <motion.div
                        key={student.studentID}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white px-3 py-2 rounded-full flex items-center gap-2 text-sm whitespace-nowrap shadow-md flex-shrink-0"
                      >
                        <img
                          src={getProfilePictureUrl(student.profile_picture, student.name)}
                          alt={student.name}
                          className="w-5 h-5 rounded-full border border-white/30"
                        />
                        <span className="truncate max-w-[120px] sm:max-w-[150px] font-medium">
                          {student.name}
                        </span>
                        <button
                          onClick={() => handleRemoveFilterStudent(student.studentID)}
                          className="ml-1 cursor-pointer text-white hover:text-red-200 transition-colors p-1 hover:bg-white/20 rounded-full"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                    
                    {/* Search Input - Now within the scrollable area */}
                    <input
                      type="text"
                      value={filterStudentQuery}
                      onChange={handleFilterStudentQueryChange}
                      placeholder={selectedFilterStudents.length > 0 ? `Search for more students... (${selectedFilterStudents.length} selected)` : "Search by student name..."}
                      className="border-none focus:ring-0 outline-none min-w-[200px] text-gray-700 placeholder-gray-400 flex-shrink-0"
                    />
                    
                    {/* Search Status - Also within scrollable area */}
                    {filterStudentQuery && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                        {filterStudentSuggestions.length > 0 ? (
                          <span className="text-green-600 font-medium">✓ {filterStudentSuggestions.length} found</span>
                        ) : (
                          <span className="text-gray-400">Searching...</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Clear All Button - Fixed rightmost position */}
                  {selectedFilterStudents.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedFilterStudents([]);
                        setTempFilters(prev => ({
                          ...prev,
                          selectedFilterStudents: []
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 border border-red-200 hover:border-red-300"
                      title="Clear all selected students"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Dropdown Suggestions with Profile Pictures - Fixed positioning and z-index */}
                {filterStudentSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl max-h-48 overflow-y-auto shadow-xl backdrop-blur-sm"
                    style={{ 
                      zIndex: 50,
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.5rem',
                      maxHeight: '12rem',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      minWidth: '300px',
                      maxWidth: '500px'
                    }}
                  >
                    {filterStudentSuggestions.map((student) => (
                      <motion.li
                        key={student.studentID}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleSelectFilterStudent(student)}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={getProfilePictureUrl(student.profile_picture, student.name)}
                          alt={student.name}
                          className="w-10 h-10 rounded-full border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.studentID}</div>
                        </div>
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 max-w-[140px] sm:flex-none bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2
                  ${SearchClicked ? "scale-90" : "scale-100"}`}
                onClick={() => {
                  setSearchClicked(true);
                  setTimeout(() => setSearchClicked(false), 300);
                  // Apply current name-based search
                  const filtered = grades.filter((grade) => {
                    return selectedFilterStudents.length === 0 || 
                           selectedFilterStudents.some(student => 
                             grade.studentName.toLowerCase() === student.name.toLowerCase()
                           );
                  });
                  setFilteredGrades(filtered);
                  setCurrentPage(1);
                  setMessage({
                    type: "success",
                    content: `Search completed! Found ${filtered.length} grade${filtered.length !== 1 ? 's' : ''}.`
                  });
                  setTimeout(() => setMessage({ type: "", content: "" }), 3000);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilterClicked(true);
                  setTimeout(() => setFilterClicked(false), 300);
                  setShowFilters(!showFilters);
                }}
                className={`w-14 h-12 sm:w-auto bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold
                  ${FilterClicked ? "scale-90" : "scale-100"}`}
              >
                <FilterIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Filter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleResetFilters();
                }}
                className={`flex-1 max-w-[140px] sm:flex-none bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2`}
              >
                <RedoIcon className="w-4 h-4" />
                Reset
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filter Modal - Full screen popup */}
        {showFilters && createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999]"
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
                zIndex: 9999
              }}
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Grade Filters</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={resetFilters}
                      className="text-white hover:text-gray-200 transition-transform hover:scale-110 p-1"
                      title="Reset filters"
                    >
                      <RedoIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-white hover:text-gray-200 transition-transform hover:scale-110 p-1 text-xl leading-5"
                      title="Close filters"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* Period Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Period
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Prelim", "Midterm", "Pre-Final", "Final"].map((period) => (
                        <label
                          key={period}
                          className={`flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer border-2
                            ${tempFilters.selectedPeriods.includes(period)
                              ? "bg-[#0065A8] text-white border-[#0065A8]"
                              : "hover:bg-[#54BEFF] hover:text-white border-gray-200 hover:border-[#54BEFF]"
                            }`}
                        >
                          <input
                            type="checkbox"
                            value={period}
                            checked={tempFilters.selectedPeriods.includes(period)}
                            onChange={() => {
                              setTempFilters(prev => ({
                                ...prev,
                                selectedPeriods: prev.selectedPeriods.includes(period)
                                  ? prev.selectedPeriods.filter(p => p !== period)
                                  : [...prev.selectedPeriods, period]
                              }));
                            }}
                            className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded"
                          />
                          <span>{period}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Course Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Course
                    </label>
                    <input
                      type="text"
                      value={tempFilters.courseFilter}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, courseFilter: e.target.value }))}
                      placeholder="Search Course"
                      className="w-full border-2 border-[#0065A8] rounded-lg px-4 py-3 text-gray-700 
                        focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                    />
                  </div>

                  {/* School Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      School Year
                    </label>
                    <select
                      value={tempFilters.schoolYearFilter}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, schoolYearFilter: e.target.value }))}
                      className="w-full border-2 border-[#0065A8] rounded-lg px-4 py-3 text-gray-700
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Semester
                    </label>
                    <select
                      value={tempFilters.semesterFilter}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, semesterFilter: e.target.value }))}
                      className="w-full border-2 border-[#0065A8] rounded-lg px-4 py-3 text-gray-700
                        focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                    >
                      <option value="">All Semesters</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                    </select>
                  </div>

                  {/* Student Filter with Profile Pictures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Students
                    </label>
                    <div className="min-h-[50px] flex flex-wrap items-center gap-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                      {tempFilters.selectedFilterStudents.map((student) => (
                        <div
                          key={student.studentID}
                          className="bg-[#0065A8] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm"
                        >
                          <img
                            src={getProfilePictureUrl(student.profile_picture, student.name)}
                            alt={student.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="max-w-[120px] truncate">{student.name}</span>
                          <button
                            onClick={() => handleRemoveFilterStudent(student.studentID)}
                            className="hover:text-red-300 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={filterStudentQuery}
                        onChange={handleFilterStudentQueryChange}
                        placeholder="Search students..."
                        className="flex-1 min-w-[120px] outline-none bg-transparent"
                      />
                    </div>
                    {/* Student Search Suggestions - Fixed z-index */}
                    {filterStudentSuggestions.length > 0 && (
                      <div 
                        className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                        style={{ zIndex: 60 }}
                      >
                        {filterStudentSuggestions.map((student) => (
                          <div
                            key={student.studentID}
                            onClick={() => handleSelectFilterStudent(student)}
                            className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                          >
                            <img
                              src={getProfilePictureUrl(student.profile_picture, student.name)}
                              alt={student.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium text-sm">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.studentID}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    disabled={isApplyingFilters}
                    className="bg-[#0065A8] hover:bg-[#0088FF] text-white px-6 py-2 rounded-lg 
                      transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isApplyingFilters ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Applying...
                      </>
                    ) : (
                      'Apply Filters'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}        {/* Grades Table Section - Enhanced with modern design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 relative"
          style={{ zIndex: 1 }}
        >
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="max-h-[60vh] overflow-y-auto space-y-4 p-4">
              {isLoading || isFiltering ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 animate-pulse shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </motion.div>
                ))
              ) : currentGrades.length > 0 ? (
                currentGrades.map((gradeData, index) => {
                  const grade = sanitizeGrade(gradeData);
                  if (!grade) return null;

                  return (
                    <motion.div 
                      key={grade.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg mb-1">{grade.studentName}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{grade.studentID}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              grade.remarks === "PASSED" 
                                ? "bg-green-100 text-green-700" 
                                : grade.remarks === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {grade.remarks}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-3 rounded-xl transition-all duration-200"
                            onClick={() => {
                              handleEditGrade(gradeData);
                            }}
                            title="Edit Grade"
                          >
                            <EditIcon className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-100 p-3 rounded-xl transition-all duration-200"
                            onClick={() => handleDeleteGrade(grade.id)}
                            title="Delete Grade"
                          >
                            <DeleteIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                          <span className="text-gray-600 text-sm font-medium block mb-2">Course</span>
                          <p className="font-semibold text-gray-800 truncate">{grade.courseName}</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                          <span className="text-gray-600 text-sm font-medium block mb-2">Grade</span>
                          <p className="font-bold text-blue-700 text-xl">{grade.grade}</p>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                          <span className="text-gray-600 text-sm font-medium block mb-2">Period</span>
                          <p className="font-semibold text-gray-800">{grade.period}</p>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                          <span className="text-gray-600 text-sm font-medium block mb-2">Semester</span>
                          <p className="font-semibold text-gray-800">{grade.semester}</p>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl col-span-2">
                          <span className="text-gray-600 text-sm font-medium block mb-2">School Year</span>
                          <p className="font-semibold text-gray-800">{grade.school_year}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No grades found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-center" style={{ minWidth: "900px" }}>
                  <thead className="bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] text-white sticky top-0" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="px-4 py-4 text-sm font-bold min-w-[120px]">Student ID</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[180px]">Student Name</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[200px]">Course</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[100px]">Grade</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[120px]">Period</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[150px]">School Year</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[100px]">Semester</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[140px]">Remarks</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[120px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Desktop table loading state */}
                    {isLoading || isFiltering ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <motion.tr 
                          key={index} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="animate-pulse border-b border-gray-100"
                        >
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-24"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-32"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-20"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center space-x-2">
                              <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                              <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : currentGrades.length > 0 ? (
                      currentGrades.map((gradeData, index) => {
                        const grade = sanitizeGrade(gradeData);
                        if (!grade) return null;

                        return (
                          <motion.tr 
                            key={grade.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                            className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                          >
                            <td className="px-4 py-4 text-sm text-gray-700 font-semibold">{String(grade.studentID)}</td>
                            <td className="px-4 py-4 text-sm text-gray-800 font-semibold">{String(grade.studentName)}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{String(grade.courseName)}</td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 font-bold rounded-lg text-sm">
                                {String(grade.grade)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 font-medium">{String(grade.period)}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{String(grade.school_year)}</td>
                            <td className="px-4 py-4 text-sm text-gray-700 font-medium">{String(grade.semester)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                grade.remarks === "PASSED" 
                                  ? "bg-green-100 text-green-700" 
                                  : grade.remarks === "FAILED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {String(grade.remarks)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                                  onClick={() => {
                                    setEditClicked(true);
                                    setTimeout(() => setEditClicked(false), 300);
                                    handleEditGrade(gradeData);
                                  }}
                                  title="Edit Grade"
                                >
                                  <EditIcon className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                                  onClick={() => {
                                    setDeleteClicked(true);
                                    setTimeout(() => setDeleteClicked(false), 300);
                                    handleDeleteGrade(grade.id);
                                  }}
                                  title="Delete Grade"
                                >
                                  <DeleteIcon className="w-5 h-5" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No grades found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pagination Controls */}
        {filteredGrades.length > itemsPerPage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <div className="text-sm text-gray-600 font-medium">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length} grades
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white hover:shadow-lg"
                }`}
              >
                Previous
              </motion.button>
              
              <div className="flex gap-1">
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
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white hover:shadow-lg"
                }`}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-3 sm:mx-6 md:mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 sm:px-6 md:px-8 py-4 sm:py-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Grade</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this grade? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 rounded-bl-xl hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteGrade}
                  className="flex-1 py-3 sm:py-4 text-white bg-red-600 hover:bg-red-700 rounded-br-xl transition-colors text-xs sm:text-sm font-medium"
                >
                  Delete
                </button>
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
                  body: JSON.stringify({
                    gradeID: updatedGrade.id,
                    studentID: updatedGrade.studentID,
                    courseID: updatedGrade.courseID,
                    grade: updatedGrade.grade,
                    period: updatedGrade.period,
                    school_year: updatedGrade.school_year,
                    semester: updatedGrade.semester
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
                  const newGrades = Array.isArray(gradesData) ? gradesData : [];
                  setGrades(newGrades);
                  // Apply all current filters to maintain search and other filter states
                  setFilteredGrades(applyAllFilters(newGrades));
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

