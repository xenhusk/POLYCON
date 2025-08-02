import React, { useState, useEffect, useRef, use } from 'react';
import API_URL from '../apiConfig';
import { format } from 'date-fns';
import { motion } from 'framer-motion'; // NEW: import motion from framer-motion
import { ReactComponent as FilterIcon } from './icons/FilterAdd.svg';
import { ReactComponent as RedoIcon } from './icons/redo.svg';
import { createPortal } from 'react-dom';
import './transitions.css'; // Import the transitions CSS
import { useNavigate } from 'react-router-dom';

const SemesterManagement = () => {
  const navigate = useNavigate();
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('1st');
  // Detect mobile/tablet
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // userRole already declared above if present, remove duplicate
  const PolyconLogo = require('./icons/Polycon.svg').ReactComponent;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentSemester, setCurrentSemester] = useState(null);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [isActivatingAll, setIsActivatingAll] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [teacherResults, setTeacherResults] = useState([]);
  const [isTeacherInputFocused, setIsTeacherInputFocused] = useState(false);
  const teacherSearchTimeout = useRef(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [latestSemester, setLatestSemester] = useState(null);
  const [canEndSemester, setCanEndSemester] = useState(false); // Add new state for checking if we can show the end semester button
  // Add new loading states
  const [isStartingSemester, setIsStartingSemester] = useState(false);
  const [isEndingSemester, setIsEndingSemester] = useState(false);
  const [isSchedulingEnd, setIsSchedulingEnd] = useState(false);
  const [isActivatingTeacher, setIsActivatingTeacher] = useState(null); // Will store teacher ID
  const [showSemesterModal, setShowSemesterModal] = useState(false); // Add this state

  // NEW: function to fetch latest (active) semester
  const fetchLatestSemester = async () => {
    try {
      const response = await fetch(`${API_URL}/semester/latest`);
      if(response.ok) {
        const data = await response.json();
        setLatestSemester(data);
        setCanEndSemester(data.canEnd);
      }
    } catch (error) {
      console.error('Failed to fetch latest semester:', error);
      setCanEndSemester(false);
    }
  };

  useEffect(() => {
    fetchLatestSemester();
  }, []);

  useEffect(() => {
    // Try to get data from localStorage first
    const cachedTeachers = localStorage.getItem('teachers');
    if (cachedTeachers) {
      setTeachers(JSON.parse(cachedTeachers));
    }

    // Fetch fresh data from the server
    fetch(`${API_URL}/semester/teachers`)
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
        localStorage.setItem('teachers', JSON.stringify(data));
      })
      .catch(err => console.error('Failed to load teachers', err));
  }, []);

  useEffect(() => {
    if (error) {
      console.log("Error set:", error);
      // Clear error after 5 seconds for demonstration purposes
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);  const validateSchoolYear = (input) => {
    if (!input) {
      setError('');
      return false;
    }

    const year = parseInt(input);
    
    // For partially entered year
    if (input.length < 4) {
      setError('Please enter a complete 4-digit year');
      return false;
    }

    // Validate year range when 4 digits are entered
    if (input.length === 4) {
      if (isNaN(year) || year < 2024 || year > 2099) {
        setError('Year must be between 2024 and 2099');
        return false;
      }
      setError('');
      return true;
    }

    setError('');
    return false;
  };

  const handleSchoolYearChange = (e) => {
    const input = e.target.value;
    setSchoolYear(input);
    validateSchoolYear(input);
  };

  const handleStartSemester = async () => {
    if (isStartingSemester) return;
    setIsStartingSemester(true);
    // Validation: ensure School Year is provided
    if (!schoolYear) {
      setError("Please fill in the School Year");
      setIsStartingSemester(false);
      setError("Please select a Semester");
      setIsStartingSemester(false);
      return;
    }
    
    if (!validateSchoolYear(schoolYear)) {
      setIsStartingSemester(false);
      return;
    }
    const formattedDate = format(new Date(startDate), 'yyyy-MM-dd');
    // Fix: Use the user's input as xxxx-xxxx
    let fullSchoolYear = schoolYear;
    if (/^\d{4}$/.test(schoolYear)) {
      fullSchoolYear = `${schoolYear}-${parseInt(schoolYear) + 1}`;
    }
    try {
      const response = await fetch(`${API_URL}/semester/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: formattedDate,
          school_year: fullSchoolYear,
          semester: semester
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || `Failed to start semester. School year ${fullSchoolYear} already exists.`);
        setIsStartingSemester(false);
        return;
      }
      setCurrentSemester(data.semester_id);
      setError("Semester started successfully!");
      fetchLatestSemester();
    } catch (err) {
      setError(`Failed to start semester: ${err}`);
    } finally {
      setIsStartingSemester(false);
    }
  };

  const handleEndSemester = async () => {
    if (!currentSemester || !endDate) return;
    try {
      const response = await fetch(`${API_URL}/semester/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester_id: currentSemester,
          endDate: format(new Date(endDate), 'yyyy-MM-dd')
        }),
      });
      if (!response.ok) throw new Error('Failed to end semester');
      setCurrentSemester(null);
      // Fetch updated teachers after ending the semester
      const teachersResponse = await fetch(`${API_URL}/semester/teachers`);
      if (!teachersResponse.ok) throw new Error('Failed to fetch teachers');
      const teachersData = await teachersResponse.json();
      setTeachers(teachersData);
    } catch (err) {
      setError('Failed to end semester');
    }
  };

  // Modified handleEndSemesterNow function with confirmation
  const handleEndSemesterNow = async () => {
    if (!latestSemester) return;
    
    setError(
      <div className="flex items-center justify-between bg-yellow-100 text-yellow-700 border-yellow-500 p-4 rounded">
        <span>Are you sure you want to end the current semester? This cannot be undone. </span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsEndingSemester(true);
              try {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
                const response = await fetch(`${API_URL}/semester/end`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    semester_id: latestSemester.id,
                    endDate: currentDate
                  }),
                });
                if (!response.ok) throw new Error('Failed to end semester');
                // After successfully ending semester, deactivate all teachers
                const updatedTeachers = teachers.map(teacher => ({
                  ...teacher,
                  isActive: false
                }));
                setTeachers(updatedTeachers);
                localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
                setSchoolYear('');
                setSemester('1st');
                setStartDate('');
                setEndDate('');
                setCurrentSemester(null);
                setCanEndSemester(false);
                setError("Semester ended successfully!");
                fetchLatestSemester();
              } catch (err) {
                setError('Failed to end semester now');
              } finally {
                setIsEndingSemester(false);
              }
            }}
            className="bg-red-500 text-white px-3 ml-2 py-1 rounded hover:bg-red-600"
            disabled={isEndingSemester}
          >
            {isEndingSemester ? 'Ending...' : 'Confirm'}
          </button>
          <button
            onClick={() => setError('')}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Modified handleEndSemesterScheduled function with extra logging for debugging
  const handleEndSemesterScheduled = async () => {
    const selectedEndDate = new Date(endDate);
    
    // Validate end date
    const validationError = validateEndDate(endDate, latestSemester.startDate);
    if (validationError) {
      setError(validationError);
      setIsSchedulingEnd(false);
      return;
    }

    console.log("DEBUG: handleEndSemesterScheduled triggered, endDate:", endDate);
    if (!(latestSemester || currentSemester) || !endDate) {
      setIsSchedulingEnd(false);
      return;
    }

    const formattedDate = format(selectedEndDate, 'MMMM dd, yyyy');
    const now = new Date();
    const confirmationMessage =
      selectedEndDate <= now
        ? `This will end the semester immediately and deactivate teachers (scheduled end date: ${formattedDate}). Confirm?`
        : `Schedule semester to end on ${formattedDate}? Teachers and Students will remain active until that day.`;

    // Show confirmation toast - Remove shadow-lg class and adjust styling
    setError(
      <div className="flex items-center justify-between bg-yellow-100 text-yellow-700 border-yellow-500 p-4 rounded">
        <span>{confirmationMessage}</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsSchedulingEnd(true);
              try {
                const endpoint =
                  selectedEndDate > now
                    ? `${API_URL}/semester/end/schedule`
                    : `${API_URL}/semester/end`;
                const payload = {
                  semester_id: latestSemester?.id || currentSemester,
                  endDate: format(new Date(endDate), 'yyyy-MM-dd')
                };
                const response = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!response.ok) {
                  const responseText = await response.text();
                  throw new Error(JSON.parse(responseText).message || 'Failed to schedule semester end');
                }
                setCurrentSemester(null);
                setError("Semester end date scheduled successfully!");
                fetchLatestSemester();
              } catch (err) {
                setError(`Failed to schedule semester end: ${err.message}`);
              } finally {
                setIsSchedulingEnd(false);
              }
            }}
            className="bg-red-500 text-white px-3 py-1 ml-3 rounded hover:bg-red-600"
            disabled={isSchedulingEnd}
          >
            {isSchedulingEnd ? 'Scheduling...' : 'Confirm'}
          </button>
          <button
            onClick={() => setError('')}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // New function to delete duplicate semester from the database.
  const handleDeleteDuplicate = async () => {
    const fullSchoolYear = `20${schoolYear.split('-')[0]}-20${schoolYear.split('-')[1]}`;
    try {
      const res = await fetch(`${API_URL}/semester/delete_duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_year: fullSchoolYear,
          semester: semester
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete duplicate semester");
      } else {
        setError("Duplicate semester deleted. You can now start a new semester.");
        document.querySelector('.fixed.top-5.right-5').classList.replace('bg-red-100', 'bg-green-100');
        document.querySelector('.fixed.top-5.right-5').classList.replace('text-red-700', 'text-green-700');
      }
    } catch (err) {
      setError(`Deletion error: ${err}`);
    }
  };  // Update cache when activating a single teacher
  const handleActivate = async (teacherId) => {
    if (isActivatingTeacher === teacherId) return;
    setIsActivatingTeacher(teacherId);
    try {
      const response = await fetch(`${API_URL}/semester/teacher/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Failed to parse server response' };
      }
      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          if (data.error && data.error.includes('No active semester')) {
            setError('Please start a semester first before activating teachers');
          } else {
            setError(data.error || 'Failed to activate teacher');
          }
        } else {
          setError('Internal server error. Please try again later.');
        }
        return;
      }
      const updatedTeachers = teachers.map(teacher =>
        teacher.ID === teacherId ? { ...teacher, isActive: true } : teacher
      );
      setTeachers(updatedTeachers);
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
      setError('Teacher activated successfully');
    } catch (err) {
      console.error('Error activating teacher:', err);
    } finally {
      setIsActivatingTeacher(null);
    }
  };

  // Update cache when activating all teachers
  const handleActivateAll = async () => {
    setIsActivatingAll(true);
    try {
      const response = await fetch(`${API_URL}/semester/teacher/activate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Failed to parse server response' };
      }
      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          if (data.error && data.error.includes('No active semester')) {
            setError('Please start a semester first before activating teachers');
          } else {
            setError(data.error || 'Failed to activate all teachers');
          }
        } else {
          setError('Internal server error. Please try again later.');
        }
        return;
      }
      const updatedTeachers = teachers.map(teacher => ({ ...teacher, isActive: true }));
      setTeachers(updatedTeachers);
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
      setError('All teachers activated successfully');
    } catch (err) {
      setError('Failed to activate all teachers. Please try again.');
    } finally {
      setIsActivatingAll(false);
    }
  };

  // NEW: Debounced teacher search function
  const debouncedTeacherSearch = (term) => {
    if (teacherSearchTimeout.current) clearTimeout(teacherSearchTimeout.current);
    teacherSearchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/semester/teacher/search?query=${encodeURIComponent(term)}`);
        const data = await res.json();
        setTeacherResults(data || []);
      } catch (error) {
        console.error('Teacher search error:', error);
      }
    }, 200);
  };

  // NEW: Handle teacher search input change
  const handleTeacherSearchChange = (e) => {
    const value = e.target.value;
    setTeacherSearchTerm(value);
    if (value.trim() !== '') {
      debouncedTeacherSearch(value);
    } else {
      setTeacherResults([]);
    }
  };

  // Compute distinct departments from the teacher list (assumes teacher.department is a string)
  const distinctDepartments = Array.from(
    new Set(teachers.map(teacher => teacher.department).filter(dep => dep))
  );

  // Add reset filters function
  const handleResetFilters = () => {
    setSelectedDepartmentFilter([]);
    setTeacherSearchTerm("");
    setTeacherResults([]);
    setShowDepartmentModal(false);
  };

  // Add department filter change handler
  const handleDepartmentFilterChange = (department) => {
    const updatedDepartments = selectedDepartmentFilter.includes(department)
      ? selectedDepartmentFilter.filter((dep) => dep !== department)
      : [...selectedDepartmentFilter, department];
    
    setSelectedDepartmentFilter(updatedDepartments);
  };

  // Apply filters function
  const applyDepartmentFilters = () => {
    setShowDepartmentModal(false);
  };

  // Add new helper function to determine if inputs should be disabled
  const shouldDisableInputs = () => {
    return latestSemester && canEndSemester;
  };

  // Add these helper functions
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const validateEndDate = (selectedDate, startDate) => {
    const selectedDateObj = new Date(selectedDate);
    const startDateObj = new Date(startDate);
    const todayObj = new Date();
    
    // Reset time portions for accurate date comparison
    selectedDateObj.setHours(0, 0, 0, 0);
    startDateObj.setHours(0, 0, 0, 0);
    todayObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < startDateObj) {
      return "End date cannot be earlier than the start date";
    }
    
    if (selectedDateObj < todayObj) {
      return "End date cannot be earlier than today";
    }

    return null; // null means validation passed
  };

  const userRole = localStorage.getItem('userRole');
  // Render blocking message for admin on mobile/tablet
  if (userRole === 'admin' && isMobile) {
    return (
      <div className="flex flex-col pt-10 items-center min-h-screen w-screen bg-[#005B98]">
        <PolyconLogo style={{ height: '200px', width: 'auto', marginBottom: '24px' }} />
        <h3 className="text-2xl font-bold text-white mb-4 mx-9 text-center">Faculty Portal Unavailable on Mobile/Tablet</h3>
        <p className="text-white mb-6 mx-9 text-center">For security and usability, please use a desktop or laptop to access admin features.</p>
        <button
          className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen items-center mx-auto p-6 bg-white fade-in">
      {/* Toasts for specific messages outside the modal */}
      {(error === 'Please start a semester first before activating teachers' || error === 'Teacher activated successfully') && (
        <div className={`fixed top-5 right-5 z-50 rounded-lg shadow-lg max-w-md p-4 
          ${error === 'Teacher activated successfully' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">{error}</div>
          </div>
        </div>
      )}

      <h2 className="text-3xl mt-10 font-bold text-center text-[#0065A8] pb-5 fade-in delay-100">
        Semester Management
      </h2>

      <div className="flex items-center justify-between space-x-4 w-[90%] mt-4 fade-in delay-200">
        {/* Manage Semester Button */}
        <button
          onClick={() => setShowSemesterModal(true)}
          className="px-6 py-2 bg-[#057DCD] text-white rounded-lg hover:bg-[#54BEFF] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
        >
          Manage Semester
        </button>

        {/* Search and Filter Section */}
        <div className="flex items-center space-x-2">
          <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
            <input
              type="text"
              value={teacherSearchTerm}
              onChange={handleTeacherSearchChange}
              placeholder="Search teachers by name..."
              className="border-none focus:ring-0 outline-none w-[100%]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDepartmentModal(!showDepartmentModal)}
              className={`bg-[#057DCD] text-white p-3 rounded-full shadow-md flex items-center justify-center hover:bg-[#54BEFF] transition
                ${showDepartmentModal ? "scale-90" : "scale-100"}`}
            >
              <FilterIcon className="w-5 h-5" />
            </button>
            {selectedDepartmentFilter.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{selectedDepartmentFilter.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="flex justify-center w-full fade-in delay-300">
        <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[90%] mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center table-fixed">
              {/* Fixed Table Header */}
              <thead className="bg-[#057DCD] text-white top-0 z-10">
                <tr className="border-b">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="pr-5">Actions</th>
                </tr>
              </thead>
            </table>

            {/* Scrollable Table Body */}
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full bg-white text-center table-fixed">
                <tbody>
                  {teachers
                    .filter(teacher => 
                      (teacherSearchTerm.trim() === "" ||
                       teacher.fullName.toLowerCase().includes(teacherSearchTerm.toLowerCase())) &&
                      (selectedDepartmentFilter.length === 0 ||
                       selectedDepartmentFilter.includes(teacher.department))
                    )
                    .map((teacher, index) => (
                    <tr key={teacher.ID} className="border-b hover:bg-[#edf8ff] transition-all duration-200">
                      <td className="py-2 px-6">{teacher.ID}</td>
                      <td className="py-2 px-6">{teacher.fullName}</td>
                      <td className="py-2 px-6">{teacher.department}</td>
                      <td className="py-2 px-6">
                        {teacher.isActive ? (
                          <span className="text-green-500 font-medium">Active</span>
                        ) : (
                          <span className="text-gray-500 font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="py-2 px-6">
                        {teacher.isActive ? (
                          <span className="text-green-600 font-medium">✓ Activated</span>
                        ) : (
                          <button
                            onClick={() => handleActivate(teacher.ID)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                            disabled={isActivatingTeacher === teacher.ID}
                          >
                            {isActivatingTeacher === teacher.ID ? 'Activating...' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Activate All Button moved to after table */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleActivateAll}
                disabled={isActivatingAll || teachers.every(t => t.isActive)}
                className={`bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md transform hover:scale-105 font-medium
                  ${(isActivatingAll || teachers.every(t => t.isActive)) ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
              >
                {isActivatingAll ? 'Activating...' : 'Activate All Teachers'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Management Modal */}
      {showSemesterModal && createPortal(
        <div 
          className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem',
            zIndex: 9999
          }}
          onClick={() => setShowSemesterModal(false)}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 20 },
              visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
              exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.3 } }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[90vh] overflow-y-auto border border-gray-200"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 9999
            }}
          >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  {latestSemester && canEndSemester ? 'Current Semester' : 'Start New Semester'}
                </h2>
                <button
                  onClick={() => setShowSemesterModal(false)}
                  className="text-white hover:text-gray-200 transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* All other error/success messages inside the modal */}
                {error && error !== 'Please start a semester first before activating teachers' && error !== 'Teacher activated successfully' && (
                  <div className={`fixed top-5 right-5 z-50 rounded p-4 transform transition-all duration-500 ease-in-out 
          ${
            typeof error === 'string'
              ? error.toLowerCase().includes('successfully')
                ? 'bg-green-100 text-green-700'
                : error.toLowerCase().includes('no active semester') || error.toLowerCase().includes('please start a semester') || error.toLowerCase().includes('please enter a complete')
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              : ''
          }
        `}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {error}
                        {typeof error === 'string' && error.includes('already exists') && (
                          <button
                            onClick={handleDeleteDuplicate}
                            className="ml-4 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                          >
                            Delete Duplicate?
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Semester Management Content */}
                {latestSemester && canEndSemester ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-3 animate-pulse"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Active Semester</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500 font-medium">Semester</p>
                          <p className="text-lg font-bold text-blue-900">{latestSemester.semester} Semester</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500 font-medium">School Year</p>
                          <p className="text-lg font-bold text-blue-900">{latestSemester.school_year}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500 font-medium">Start Date</p>
                          <p className="text-lg font-bold text-blue-900">{new Date(latestSemester.startDate).toLocaleDateString()}</p>
                        </div>
                        {latestSemester.endDate && (
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-500 font-medium">End Date</p>
                            <p className="text-lg font-bold text-blue-900">{new Date(latestSemester.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Semester Actions</h4>
                        
                        <button
                          onClick={handleEndSemesterNow}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 mb-4 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none font-medium"
                          disabled={isEndingSemester}
                        >
                          {isEndingSemester ? (
                            <div className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Ending Semester...
                            </div>
                          ) : (
                            'End Semester Now'
                          )}
                        </button>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule End Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={new Date(Math.max(
                              new Date(latestSemester?.startDate).getTime(),
                              new Date(getTodayString()).getTime()
                            )).toISOString().split('T')[0]}
                            className="w-full rounded-lg border-2 border-gray-300 shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#54BEFF] focus:border-[#0065A8] mb-4 transition-all"
                          />
                          <button
                            onClick={handleEndSemesterScheduled}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none font-medium"
                            disabled={isSchedulingEnd || !endDate}
                          >
                            {isSchedulingEnd ? (
                              <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Scheduling...
                              </div>
                            ) : (
                              'Schedule End Date'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Start New Semester Form */
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        Create New Semester
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="XXXX"
                              value={schoolYear || ''}
                              onChange={e => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length > 4) val = val.slice(0, 4);
                                setSchoolYear(val);
                                validateSchoolYear(val);
                              }}
                              disabled={shouldDisableInputs()}
                              className="block w-24 px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#54BEFF] focus:border-[#0065A8] text-center font-medium transition-all"
                            />
                            <span className="text-gray-700 text-lg font-medium">-</span>
                            <input
                              type="text"
                              readOnly
                              value={schoolYear && schoolYear.length === 4 && !isNaN(parseInt(schoolYear)) ? (parseInt(schoolYear) + 1).toString() : ''}
                              className="w-24 px-4 py-3 bg-gray-100 text-gray-700 text-center rounded-lg border-2 border-gray-200 font-medium"
                            />
                            <span className="ml-2 text-gray-500 text-sm">(Enter start year)</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                          <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            disabled={shouldDisableInputs()}
                            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#54BEFF] focus:border-[#0065A8] transition-all"
                          >
                            <option value="1st">1st Semester</option>
                            <option value="2nd">2nd Semester</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={getTodayString()}
                            disabled={shouldDisableInputs()}
                            className="w-full rounded-lg border-2 border-gray-300 shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#54BEFF] focus:border-[#0065A8] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={handleStartSemester}
                        className="w-full bg-gradient-to-r from-[#057DCD] to-[#0065A8] text-white px-6 py-4 rounded-lg hover:from-[#54BEFF] hover:to-[#057DCD] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-semibold text-lg"
                        disabled={!schoolYear || !startDate || isStartingSemester}
                      >
                        {isStartingSemester ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Starting Semester...
                          </div>
                        ) : (
                          'Start Semester'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* Modern Department Filter Modal */}
      {showDepartmentModal && createPortal(
        <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: '1rem',
          zIndex: 9999
        }}>
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 20 },
              visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
              exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.3 } }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 9999
            }}
          >
            <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-white">
                Teacher Filters
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-white hover:text-gray-200 transition-transform hover:scale-110"
                title="Reset filters"
              >
                <RedoIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="max-h-60 overflow-y-auto border-2 border-[#0065A8] rounded-lg">
                  {distinctDepartments.length > 0 ? (
                    distinctDepartments.map((dep, index) => (
                      <div key={index} className="p-2">
                        <label className={`flex items-center p-2 rounded-lg transition-colors duration-200 cursor-pointer
                          ${selectedDepartmentFilter.includes(dep)
                            ? "bg-[#0065A8] text-white"
                            : "hover:bg-[#54BEFF] hover:text-white"}`}
                        >
                          <input
                            type="checkbox"
                            value={dep}
                            checked={selectedDepartmentFilter.includes(dep)}
                            onChange={() => handleDepartmentFilterChange(dep)}
                            className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded
                            checked:bg-[#0065A8] checked:hover:bg-[#54BEFF]"
                          />
                          <span className={selectedDepartmentFilter.includes(dep)
                            ? "text-white"
                            : "text-gray-700"}
                          >
                            {dep}
                          </span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500 text-center">No departments found</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex mt-4">
              <button
                onClick={applyDepartmentFilters}
                className="flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
export default SemesterManagement;
