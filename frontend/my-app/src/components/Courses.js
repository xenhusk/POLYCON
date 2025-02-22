import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as FilterIcon } from "./icons/FilterAdd.svg";
import { ReactComponent as EditIcon } from "./icons/Edit.svg";
import { ReactComponent as DeleteIcon } from "./icons/delete.svg";
import { motion, AnimatePresence } from "framer-motion";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courseID, setCourseID] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [filteredPrograms, setFilteredPrograms] = useState([]); // Filtered programs for selected department
  const [filteredCourses, setFilteredCourses] = useState([]); // Stores filtered courses
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Selected department for filtering
  const [showFilters, setShowFilters] = useState(false); // Controls filter visibility
  const [filterSelectedPrograms, setFilterSelectedPrograms] = useState([]); // Programs selected in filter
  const [courseFilter, setCourseFilter] = useState(""); // Course filter input
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedDepartmentPrograms, setSelectedDepartmentPrograms] = useState(
    []
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const filterRef = useRef(null);
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [FilterClicked, setFilterClicked] = useState(false);
  const [SearchClicked, setSearchClicked] = useState(false);
  const [AddClicked, setAddClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [SaveClicked, setSaveClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);

  // Add these animation variants before your component
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8, // Changed scale for stronger exit effect
      y: 20,
      transition: {
        duration: 0.3, // Extended duration for smoother fade
      },
    },
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProgramModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
        setSelectedDepartment("");
        setFilteredPrograms([]);
        setFilteredCourses(courses);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef, courses]);

  const fetchInitialData = async () => {
    setIsCourseLoading(true);
    try {
      const cachedCourses = localStorage.getItem("courses");
      const cachedDepartments = localStorage.getItem("departments");
      const cachedPrograms = localStorage.getItem("programs");

      if (cachedCourses && cachedDepartments && cachedPrograms) {
        const coursesData = JSON.parse(cachedCourses);
        const departmentsData = JSON.parse(cachedDepartments);
        const programsData = JSON.parse(cachedPrograms);

        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setDepartments(departmentsData);
        setPrograms(programsData);
      } else {
        const [coursesResponse, departmentsResponse, programsResponse] =
          await Promise.all([
            fetch("http://localhost:5001/course/get_courses"),
            fetch("http://localhost:5001/course/get_departments"),
            fetch("http://localhost:5001/course/get_programs"),
          ]);

        const coursesData = await coursesResponse.json();
        const departmentsData = await departmentsResponse.json();
        const programsData = await programsResponse.json();

        setCourses(coursesData.courses || []);
        setFilteredCourses(coursesData.courses || []);
        setDepartments(departmentsData);
        setPrograms(programsData);

        localStorage.setItem("courses", JSON.stringify(coursesData.courses));
        localStorage.setItem("departments", JSON.stringify(departmentsData));
        localStorage.setItem("programs", JSON.stringify(programsData));
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsCourseLoading(false);
    }
  };

  const handleDepartmentClick = (departmentId) => {
    const departmentPrograms = programs.filter(
      (prog) => prog.departmentID === departmentId
    );
    setSelectedDepartmentPrograms(departmentPrograms);
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setSelectedDepartmentPrograms([]);
  };
  // Add this new function for handling edit save
  const handleEditSave = async () => {
    if (
      !editCourse ||
      !editCourse.courseID ||
      !editCourse.courseName ||
      !editCourse.credits ||
      !department ||
      !selectedPrograms.length
    ) {
      setMessage({ type: "error", content: "All fields are required" });
      return;
    }

    setIsEditLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/course/edit_course/${editCourse.courseID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseID: editCourse.courseID,
            courseName: editCourse.courseName,
            credits: editCourse.credits,
            department: department,
            program: selectedPrograms,
          }),
        }
      );

      if (response.ok) {
        // Convert department ID to name and program IDs to names
        const departmentName =
          departments.find((d) => d.id === department)?.name || department;
        const programNames = selectedPrograms.map((progId) => {
          const program = programs.find((p) => p.id === progId);
          return program ? program.name : progId;
        });

        const updatedCourse = {
          courseID: editCourse.courseID,
          courseName: editCourse.courseName,
          credits: editCourse.credits,
          department: departmentName,
          program: programNames,
        };

        // Update the courses state
        const updatedCourses = courses.map((course) =>
          course.courseID === editCourse.courseID ? updatedCourse : course
        );

        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
        localStorage.setItem("courses", JSON.stringify(updatedCourses));

        setMessage({
          type: "success",
          content: "Course updated successfully!",
        });
        setTimeout(() => {
          setShowEditModal(false);
          setEditCourse(null);
          resetForm();
          setMessage({ type: "", content: "" });
        }, 2000);
      } else {
        setMessage({ type: "error", content: "Failed to update course" });
      }
    } catch (error) {
      console.error("Error updating course:", error);
      setMessage({ type: "error", content: "Error updating course" });
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const selectedDeptName = e.target.value;
    setSelectedDepartment(selectedDeptName);

    // Find department ID using name
    const selectedDept = departments.find(
      (dept) => dept.name === selectedDeptName
    );
    const selectedDeptId = selectedDept ? selectedDept.id : null;

    // Get programs belonging to the selected department
    if (selectedDeptId) {
      const departmentPrograms = programs.filter(
        (prog) => prog.departmentID === selectedDeptId
      );
      setFilteredPrograms(departmentPrograms);
    } else {
      setFilteredPrograms([]);
    }

    // Filter courses based on selected department
    const filtered = selectedDeptName
      ? courses.filter((course) => course.department === selectedDeptName)
      : courses;
    setFilteredCourses(filtered);
  };

  const handleProgramFilterChange = (programId) => {
    const updatedPrograms = filterSelectedPrograms.includes(programId)
      ? filterSelectedPrograms.filter((id) => id !== programId) // Remove if already selected
      : [...filterSelectedPrograms, programId]; // Add if not selected

    setFilterSelectedPrograms(updatedPrograms);

    // Filter courses based on selected programs
    const selectedProgramNames = programs
      .filter((prog) => updatedPrograms.includes(prog.id))
      .map((prog) => prog.name);

    const filtered =
      selectedProgramNames.length > 0
        ? courses.filter((course) =>
            selectedProgramNames.every((progName) =>
              course.program.includes(progName)
            )
          )
        : courses;

    setFilteredCourses(filtered);
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);

    // Filter programs based on extracted department ID
    const departmentPrograms = programs.filter(
      (prog) => prog.departmentID === selectedDepartment
    );
    setFilteredPrograms(departmentPrograms);
    setSelectedPrograms([]); // Reset selected programs when department changes
  };

  const handleProgramChange = (programId) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter((id) => id !== programId));
    } else {
      setSelectedPrograms([...selectedPrograms, programId]);
    }
  };

  const handleSaveCourse = async () => {
    // Use different values based on editing mode
    const cID = editing ? editCourse.courseID : courseID;
    const cName = editing ? editCourse.courseName : courseName;
    const cCredits = editing ? editCourse.credits : credits;
    const cDepartment = department; // This should be set to the selected department id
    const cPrograms = selectedPrograms; // Array of selected program ids

    // Debug log to check what values you have
    console.log({ cID, cName, cCredits, cDepartment, cPrograms });

    if (!cID || !cName || !cCredits || !cDepartment || cPrograms.length === 0) {
      setMessage({ type: "error", content: "All fields are required" });
      return;
    }

    setIsAddLoading(true);
    try {
      const endpoint = editing
        ? `http://localhost:5001/course/edit_course/${cID}`
        : `http://localhost:5001/course/add_course`;
      const method = editing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseID: cID,
          courseName: cName,
          credits: cCredits,
          department: cDepartment,
          program: cPrograms,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          content: editing
            ? "Course updated successfully!"
            : "Course added successfully!",
        });

        // Convert department ID to department name and program IDs to names
        const departmentName =
          departments.find((d) => d.id === cDepartment)?.name || cDepartment;
        const programNames = cPrograms.map((progId) => {
          const program = programs.find((p) => p.id === progId);
          return program ? program.name : progId;
        });

        const newCourse = {
          courseID: cID,
          courseName: cName,
          credits: cCredits,
          department: departmentName, // store department as name
          program: programNames, // store programs as names
        };

        const updatedCourses = editing
          ? courses.map((course) =>
              course.courseID === cID ? newCourse : course
            )
          : [...courses, newCourse];

        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
        localStorage.setItem("courses", JSON.stringify(updatedCourses));
        setTimeout(() => {
          setMessage({ type: "", content: "" });
          resetForm();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          content: "Failed to save course. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving course:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsAddLoading(false);
    }
  };
  const handleEdit = (course) => {
    setEditCourse({ ...course });

    // Convert department name to its ID for editing if needed
    const deptObj = departments.find((d) => d.name === course.department);
    if (deptObj) {
      setDepartment(deptObj.id);
      const relatedPrograms = programs.filter(
        (prog) => prog.departmentID === deptObj.id
      );
      setFilteredPrograms(relatedPrograms);
      const selectedProgramIds = relatedPrograms
        .filter((p) => course.program.includes(p.name))
        .map((p) => p.id);
      setSelectedPrograms(selectedProgramIds);
    } else {
      setDepartment("");
      setFilteredPrograms([]);
      setSelectedPrograms([]);
    }

    setShowEditModal(true);
  };

  const handleDelete = async (courseID) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/course/delete_course/${courseID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          content: "Course deleted successfully!",
        });
        const updatedCourses = courses.filter(
          (course) => course.courseID !== courseID
        );
        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
        localStorage.setItem("courses", JSON.stringify(updatedCourses));

        setTimeout(() => {
          setMessage({ type: "", content: "" });
        }, 2000);
      } else {
        setMessage({
          type: "error",
          content: "Failed to delete course. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCourseID("");
    setCourseName("");
    setCredits("");
    setDepartment("");
    setSelectedPrograms([]);
    setFilteredPrograms([]);
    setEditing(false);
    setShowEditModal(false); // Hide edit modal after reset
  };

  const applyFilters = () => {
    setIsFiltering(true);
    
    // Simulate a delay to show the preloader (adjust the delay as needed)
    setTimeout(() => {
      let filtered = courses;
      if (courseFilter) {
        filtered = filtered.filter((course) =>
          course.courseName.toLowerCase().includes(courseFilter.toLowerCase())
        );
      }
      setFilteredCourses(filtered);
      setIsFiltering(false);
    }, 500);
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);
    applyFilters();
  };

  return (
    <div className=" items-center mx-auto p-6 bg-white">
      {/* Global Message display – show only when NOT editing */}
      {!showEditModal && message.content && (
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

      {/* Loading overlay
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center space-x-3">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </div>
        </div>
      )} */}
      <h2 className="text-3xl mt-10 font-bold text-center text-[#0065A8] pb-5">
        Courses
      </h2>

      <div className="flex items-center justify-center space-x-2 w-full mt-4">
        <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
          <input
            type="text"
            value={courseFilter}
            onChange={handleCourseFilterChange}
            placeholder="Search by Course Name"
            className="border-none focus:ring-0 outline-none w-[100%]"
          />
        </div>
        <button 
          className={`bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition 
            ${SearchClicked ? "scale-90" : "scale-100"}`}
          onClick={() => {
            setSearchClicked(true);
            setTimeout(() => setSearchClicked(false), 300);
            applyFilters();}}
        >
          Search
        </button>
        <button
          onClick={() => {setFilterClicked(true); 
            setTimeout(() => setFilterClicked(false), 300); 
            setShowFilters(!showFilters);}}
          className={`bg-blue-500 text-white p-3 rounded-full shadow-md flex items-center justify-center hover:bg-blue-600 transition
            ${FilterClicked ? "scale-90" : "scale-100"}`}
        >
          <FilterIcon className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div
          ref={filterRef}
          className="absolute right-[23rem] mt-2 mx-auto w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-40 bg-opacity-80"
        >
          {/* Header */}
          <div className="bg-[#0065A8] px-6 py-4">
            <h3 className="text-xl font-semibold text-white">FILTERS</h3>
          </div>

          {/* Filter Content */}
          <div className="p-6 space-y-4 bg-opacity-80">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 bg-opacity-80">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={handleDepartmentFilterChange}
                className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Programs Filter */}
            {filteredPrograms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programs
                </label>
                <div className="max-h-40 overflow-y-auto border-2 border-[#0065A8] rounded-lg">
                  {filteredPrograms.map((prog) => (
                    <div key={prog.id} className="px-2 py-1">
                      <label
                        className={`flex items-center p-2 rounded-lg transition-colors duration-200
                        ${filterSelectedPrograms.includes(prog.id)
                            ? "bg-[#0065A8] text-white"
                            : "hover:bg-[#54BEFF] text-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={prog.id}
                          checked={filterSelectedPrograms.includes(prog.id)}
                          onChange={() => handleProgramFilterChange(prog.id)}
                          className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded 
                          checked:bg-[#0065A8] checked:hover:bg-[#54BEFF] "
                        />
                        <span
                          className={filterSelectedPrograms.includes(prog.id)
                              ? "text-white"
                              : "text-gray-700"
                          }
                        >
                          {prog.name}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-center w-full">
        <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[90%] mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center table-fixed">
              {/* Fixed Table Header */}
              <thead className="bg-[#057DCD] text-white top-0 z-10">
                <tr className="border-b">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="pr-5">Actions</th>
                </tr>
              </thead>
            </table>

            {/* Scrollable Table Body */}
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full bg-white text-center table-fixed">
                <tbody>
                  {(isCourseLoading || isFiltering) ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="py-2 px-6">
                          <div className="flex justify-center h-[8vh] items-center">
                            <div className="h-5 w-20 bg-gray-200 rounded mx-auto"></div>
                          </div>
                        </td>
                        <td className="py-2 px-6">
                          <div className="flex justify-center h-[8vh] items-center">
                            <div className="h-5 w-28 bg-gray-200 rounded mx-auto"></div>
                          </div>
                        </td>
                        <td className="py-2 px-6 pl-5">
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-40 bg-gray-200 rounded mx-auto"></div>
                          </div>
                        </td>
                        <td className="py-2 px-6 pl-10">
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-20 bg-gray-200 rounded mx-auto"></div>
                          </div>
                        </td>
                        <td className="py-2 px-6 pl-10">
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-28 bg-gray-200 rounded mx-auto"></div>
                          </div>
                        </td>
                        <td className="py-2 pl-6">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="h-8 w-16 bg-gray-300 rounded"></div>
                            <div className="h-8 w-16 bg-gray-300 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : courses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr
                        key={course.courseID}
                        className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle"
                      >
                        <td className="px-4 py-3">{course.courseID}</td>
                        <td className="px-4 py-3">{course.courseName}</td>
                        <td className="px-4 py-3">{course.credits}</td>
                        <td className="px-4 py-3">{course.department}</td>
                        <td className="px-4 py-3">
                          {course.program.join(", ")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              className={`text-gray-500 hover:text-gray-700 ${
                                EditClicked ? "scale-90" : "scale-100"}`}
                              onClick={() => {
                                setEditClicked(true);
                                setTimeout(() => setEditClicked(false), 300);
                                handleEdit(course);}}
                            >
                              <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                              className={`text-gray-500 hover:text-gray-700 ${
                                DeleteClicked ? "scale-90" : "scale-100"}`}
                              onClick={() => { setDeleteClicked(true);
                                setTimeout(() => setDeleteClicked(false), 300);
                                handleDelete(course.courseID);}}
                            >
                              <DeleteIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full">
        <div className="relative w-[73%] h-[7vh] mt-6 shadow-md rounded-lg p-1 bg-white">
          <div className="flex flex-row items-center justify-between">
            {/* Course ID */}
            <input
              type="text"
              placeholder="Course ID"
              value={courseID}
              onChange={(e) => setCourseID(e.target.value)}
              className="rounded-lg w-[20%] px-3 py-2 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              disabled={editing}
            />

            {/* Course Name */}
            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="rounded-lg w-[20%] px-3 py-2 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Credits */}
            <input
              type="text"
              placeholder="Credits"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="rounded-lg w-[20%] px-3 py-2 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Department Selection */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setDepartment(e.target.value); // Update department state for validation
                handleDepartmentClick(e.target.value);
              }}
              className="block w-[20%] p-2 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 text-black rounded-lg"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {/* Program Modal */}
            {showProgramModal && (
              <div className="absolute right-[3.5rem] bottom-[4rem] mt-2 w-64 bg-blue-500 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-50">
                <div ref={modalRef}>
                  <h3 className="text-xl font-bold mb-4">Programs</h3>
                  <div className="max-h-60 overflow-y-auto">
                    {selectedDepartmentPrograms.map((prog) => (
                      <div key={prog.id} className="mb-1">
                        <label
                          className={`block p-2 rounded-lg transition-colors duration-200 ${
                            selectedPrograms.includes(prog.id)
                              ? "bg-white text-black"
                              : "hover:bg-white hover:text-black"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={prog.id}
                            checked={selectedPrograms.includes(prog.id)}
                            onChange={() => handleProgramChange(prog.id)}
                            className="mr-2"
                          />
                          {prog.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {showEditModal && editCourse && (
              <AnimatePresence>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white rounded-xl shadow-2xl w-[40rem] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="bg-[#0065A8] px-8 py-4 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white">
                        Edit Course
                      </h2>
                      <button
                        onClick={() => {
                          setShowEditModal(false);
                          setEditCourse(null);
                        }}
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8 mx-3 space-y-6 bg-white rounded-b-lg">
                      {/* Course Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editCourse.courseName}
                          onChange={(e) =>
                            setEditCourse({
                              ...editCourse,
                              courseName: e.target.value,
                            })
                          }
                          className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                        />
                      </div>

                      {/* Credits */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Credits <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editCourse.credits}
                          onChange={(e) =>
                            setEditCourse({
                              ...editCourse,
                              credits: e.target.value,
                            })
                          }
                          className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={department}
                          onChange={(e) => {
                            const deptId = e.target.value;
                            setDepartment(deptId);
                            const deptProgs = programs.filter(
                              (prog) => prog.departmentID === deptId
                            );
                            setSelectedDepartmentPrograms(deptProgs);
                          }}
                          className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Programs */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Programs <span className="text-red-500">*</span>
                        </label>
                        <div className="h-[20vh] overflow-y-auto border-2 border-[#0065A8] rounded-lg px-3 pt-2">
                          {selectedDepartmentPrograms.map((prog) => (
                            <div key={prog.id} className="mb-2">
                              <label
                                className={`flex items-center p-2 rounded-lg transition-colors duration-200
                                ${selectedPrograms.includes(prog.id)
                                    ? "bg-[#0065A8] text-white hover:bg-[#54BEFF]"
                                    : "hover:bg-[#54BEFF] text-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  value={prog.id}
                                  checked={selectedPrograms.includes(prog.id)}
                                  onChange={() => handleProgramChange(prog.id)}
                                  className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded 
                                  checked:bg-[#0065A8] checked:hover:bg-[#54BEFF] "
                                />
                                <span
                                  className={`${
                                    selectedPrograms.includes(prog.id)
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {prog.name}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* NEW: Message display inside modal */}
                    {message.content && (
                      <div
                        className={`mt-2 mx-4 p-3 rounded-lg ${
                          message.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {message.content}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="px-6 py-4 flex justify-end space-x-4 bg-white rounded-b-lg">
                      <button
                        onClick={() => {
                          setSaveClicked(true); 
                          setTimeout(() => {setSaveClicked(false); 
                            setTimeout(() => { handleEditSave();
                            }, 500);
                          }, 200);
                        }}
                        disabled={isEditLoading}
                        className={`bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors
                        ${isEditLoading ? "opacity-50 cursor-not-allowed" : ""} 
                        ${SaveClicked ? "scale-90" : "scale-100"}
                        flex items-center space-x-2`}
                      >
                        {isEditLoading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setCancelClicked(true); 
                          setTimeout(() => { setCancelClicked(false); 
                            setTimeout(() => setEditCourse(null), 
                            500);
                          }, 200);
                        }}
                        className={`bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors 
                          ${
                          CancelClicked ? "scale-90" : "scale-100"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              </AnimatePresence>
            )}

            {/* Submit and Cancel Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setAddClicked(true);
                  setTimeout(() => setAddClicked(false), 300);
                  handleSaveCourse();}}
                disabled={isAddLoading}
                className={`w-full px-10 py-2 rounded-lg bg-[#057DCD] text-white hover:bg-blue-500 
                ${isAddLoading ? "opacity-50 cursor-not-allowed" : ""} 
                ${AddClicked ? "scale-90" : "scale-100"} 
                flex items-center space-x-2`}
              >
                {isAddLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>ADD</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
