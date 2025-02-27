import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // NEW: import motion and AnimatePresence from framer-motion
import { ReactComponent as FilterIcon } from './icons/FilterAdd.svg';

const SemesterManagement = () => {
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('1st');
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
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [latestSemester, setLatestSemester] = useState(null);
  const [canEndSemester, setCanEndSemester] = useState(false); // Add new state for checking if we can show the end semester button
  // Add new loading states
  const [isStartingSemester, setIsStartingSemester] = useState(false);
  const [isEndingSemester, setIsEndingSemester] = useState(false);
  const [isSchedulingEnd, setIsSchedulingEnd] = useState(false);
  const [isActivatingTeacher, setIsActivatingTeacher] = useState(null); // Will store teacher ID

  // NEW: function to fetch latest (active) semester
  const fetchLatestSemester = async () => {
    try {
      const response = await fetch('http://localhost:5001/semester/latest');
      if(response.ok) {
        const data = await response.json();
        setLatestSemester(data);
        // Use the canEnd flag from backend
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
    fetch('http://localhost:5001/semester/teachers')
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
        // Cache the fresh data
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
  }, [error]);

  const validateSchoolYear = (input) => {
    const regex = /^\d{2}-\d{2}$/;
    const errorElement = document.querySelector('.fixed.top-5.right-5');
    if (!regex.test(input)) {
      setError('School year must be in format XX-XX');
      if (errorElement) {
        errorElement.classList.replace('bg-red-100', 'bg-yellow-100');
        errorElement.classList.replace('text-red-700', 'text-yellow-700');
      }
      return false;
    }
    const [start, end] = input.split('-').map(Number);
    if (end !== start + 1) {
      setError('Second year must be one year after the first');
      if (errorElement) {
        errorElement.classList.replace('bg-red-100', 'bg-yellow-100');
        errorElement.classList.replace('text-red-700', 'text-yellow-700');
      }
      return false;
    }
    setError('');
    return true;
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
      return;
    }
    if (!startDate) {
      setError("Please select a Start Date");
      setIsStartingSemester(false);
      return;
    }
    if (!semester) {
      setError("Please select a Semester");
      setIsStartingSemester(false);
      return;
    }
    
    if (!validateSchoolYear(schoolYear)) {
      setIsStartingSemester(false);
      return;
    }
    const formattedDate = format(new Date(startDate), 'yyyy-MM-dd');
    const fullSchoolYear = `20${schoolYear.split('-')[0]}-20${schoolYear.split('-')[1]}`;
    try {
      const response = await fetch('http://localhost:5001/semester/start', {
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
      // NEW: refresh the latest active semester display
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
      const response = await fetch('http://localhost:5001/semester/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester_id: currentSemester,
          endDate: format(new Date(endDate), 'yyyy-MM-dd')
        }),
      });
      if (!response.ok) throw new Error('Failed to end semester');
      setCurrentSemester(null);
      const teachersResponse = await fetch('http://localhost:5001/semester/teachers');
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
    
    // Show confirmation toast instead of window.confirm
    setError(
      <div className="flex items-center justify-between">
        <span>Are you sure you want to end the current semester? This cannot be undone. </span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsEndingSemester(true); // Only set loading when confirmed
              try {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
                const response = await fetch('http://localhost:5001/semester/end', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    semester_id: latestSemester.id,
                    endDate: currentDate
                  }),
                });
                
                if (!response.ok) throw new Error('Failed to end semester');
                
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

    // Show confirmation toast
    setError(
      <div className="flex items-center justify-between">
        <span>{confirmationMessage}</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsSchedulingEnd(true); // Only set loading when confirmed
              try {
                const endpoint =
                  selectedEndDate > now
                    ? 'http://localhost:5001/semester/end/schedule'
                    : 'http://localhost:5001/semester/end';
                // Changed key from end_date to endDate for consistency with the database field
                const payload = {
                  semester_id: latestSemester?.id || currentSemester,
                  endDate: format(new Date(endDate), 'yyyy-MM-dd')
                };
                console.log("DEBUG: Scheduling payload:", payload);
                const response = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                console.log("DEBUG: Response status:", response.status);
                const responseText = await response.text();
                console.log("DEBUG: Response text:", responseText);
                if (!response.ok) {
                  throw new Error(JSON.parse(responseText).message || 'Failed to schedule semester end');
                }
                setCurrentSemester(null);
                setError("Semester end date scheduled successfully!");
                fetchLatestSemester();
              } catch (err) {
                console.error("DEBUG: Error in scheduling semester end:", err);
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
      const res = await fetch('http://localhost:5001/semester/delete_duplicate', {
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
  };

  // Update cache when activating a single teacher
  const handleActivate = async (teacherId) => {
    if (isActivatingTeacher === teacherId) return;
    setIsActivatingTeacher(teacherId);
    try {
      const response = await fetch('http://localhost:5001/semester/teacher/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      if (!response.ok) throw new Error('Activation failed');
      
      const updatedTeachers = teachers.map(teacher =>
        teacher.ID === teacherId ? { ...teacher, isActive: true } : teacher
      );
      setTeachers(updatedTeachers);
      // Update cache
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    } catch (err) {
      setError('Failed to activate teacher');
    } finally {
      setIsActivatingTeacher(null);
    }
  };

  // Update cache when activating all teachers
  const handleActivateAll = async () => {
    setIsActivatingAll(true);
    try {
      const response = await fetch('http://localhost:5001/semester/teacher/activate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to activate all teachers');
      
      const updatedTeachers = teachers.map(teacher => ({ ...teacher, isActive: true }));
      setTeachers(updatedTeachers);
      // Update cache
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    } catch (err) {
      setError('Failed to activate all teachers');
    } finally {
      setIsActivatingAll(false);
    }
  };

  // NEW: Debounced teacher search function
  const debouncedTeacherSearch = (term) => {
    if (teacherSearchTimeout.current) clearTimeout(teacherSearchTimeout.current);
    teacherSearchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5001/semester/teacher/search?query=${encodeURIComponent(term)}`);
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

  return (
    <div className="p-6">
    
      {/* Error/Success Message Toast - Updated with dynamic colors */}
      {error && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 
          ${typeof error === 'string' && error.toLowerCase().includes("successfully") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"}`}>
          {error}
          {/* Render Delete Duplicate button if error indicates duplicate */}
          {typeof error === 'string' && error.includes("already exists") && (
            <button
              onClick={handleDeleteDuplicate}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Delete Duplicate?
            </button>
          )}
        </div>
      )}

      <h2 className="text-3xl font-bold text-[#0065A8] pt-10 pb-4 mb-6 text-center">Semester Management</h2>

      <div className="flex gap-6">
        {/* Left side - Teacher List (filtered if teacherSearchTerm is set) */}
        <div className="w-2/3">
          <div className="flex justify-between items-center mb-4">
            {/* Left: Title */}
            <h3 className="text-xl font-semibold text-gray-800 w-1/4">Teacher List</h3>

            {/* Center: Search and Filter Controls */}
            <div className="flex items-center justify-center gap-2 w-2/4">
              <input 
                type="text"
                value={teacherSearchTerm}
                onChange={handleTeacherSearchChange}
                placeholder="Search teacher by name..."
                className="w-64 border border-gray-300 shadow-md rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
              <div className="relative">
                <button 
                  onClick={() => setShowDepartmentModal(!showDepartmentModal)}
                  className={`p-3 rounded-full bg-[#057DCD] hover:bg-[#0065A8] shadow-md transition-colors
                    ${showDepartmentModal ? 'bg-[#0065A8]' : ''}`}
                  title="Filter by Department"
                >
                  <FilterIcon className="w-5 h-5 text-white" />
                </button>

                {/* Keep existing modal code here */}
                {showDepartmentModal && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg z-50">
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, scale: 0.95, y: 10 },
                        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
                        exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
                      }}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg z-50 bg-opacity-90"
                    >
                      <div className="overflow-hidden rounded-lg">
                        <div className="bg-[#0065A8] px-4 py-3 ">
                          <h3 className="text-lg font-semibold text-white">Select Department</h3>
                        </div>
                        <div className="p-4">
                          <ul className="space-y-2">
                            {distinctDepartments.map((dep, index) => (
                              <li 
                                key={index}
                                onClick={() => {
                                  setSelectedDepartmentFilter(dep);
                                  setShowDepartmentModal(false);
                                }}
                                className="cursor-pointer hover:bg-blue-100 px-3 py-2 rounded"
                              >
                                {dep}
                              </li>
                            ))}
                            <li
                              onClick={() => {
                                setSelectedDepartmentFilter("");
                                setShowDepartmentModal(false);
                              }}
                              className="cursor-pointer hover:bg-blue-100 px-3 py-2 rounded"
                            >
                              All Departments
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Activate All Button */}
            <div className="w-1/4 flex justify-end">
              <button
                onClick={handleActivateAll}
                disabled={isActivatingAll || teachers.every(t => t.isActive)}
                className={`bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors
                  ${(isActivatingAll || teachers.every(t => t.isActive)) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isActivatingAll ? 'Activating...' : 'Activate All Teachers'}
              </button>
            </div>
          </div>

          <div className="shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full bg-white">
              <thead className="bg-[#057DCD] text-white">
                <tr>
                  <th className="py-3 px-4 text-center">ID</th>
                  <th className="py-3 px-4 text-center">Name</th>
                  <th className="py-3 px-4 text-center">Department</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers
                  .filter(teacher => 
                    (teacherSearchTerm.trim() === "" ||
                     teacher.fullName.toLowerCase().includes(teacherSearchTerm.toLowerCase())) &&
                    (selectedDepartmentFilter === "" ||
                     teacher.department === selectedDepartmentFilter)
                  )
                  .map(teacher => (
                  <tr key={teacher.ID} className="border-b hover:bg-[#edf8ff]">
                    <td className="py-3 px-4 text-center">{teacher.ID}</td>
                    <td className="py-3 px-4 text-center">{teacher.fullName}</td>
                    <td className="py-3 px-4 text-center">{teacher.department}</td>
                    <td className="py-3 px-4 text-center">
                      {teacher.isActive ? (
                        <span className="text-green-500 font-medium">Active</span>
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

        {/* Right side - Semester Management */}
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {latestSemester && canEndSemester ? 'Current Semester' : 'Start New Semester'}
            </h3>
          </div>

          {/* Current Semester Display */}
          {latestSemester && canEndSemester ? (
            <div className="space-y-4">
              <div className="bg-[#edf8ff] p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Semester: {latestSemester.semester} Semester
                    </p>
                    <p className="text-gray-600">
                      School Year: {latestSemester.school_year}
                    </p>
                    <p className="text-gray-600">
                      Start Date: {new Date(latestSemester.startDate).toLocaleDateString()}
                    </p>
                    {/* Add end date display if it exists */}
                    {latestSemester.endDate && (
                      <p className="text-gray-600">
                        End Date: {new Date(latestSemester.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={handleEndSemesterNow}
                  className="w-full bg-red-600 text-white px-4 py-2 mb-4 rounded-lg hover:bg-[#FF7171] disabled:opacity-50"
                  disabled={isEndingSemester}
                >
                  {isEndingSemester ? 'Ending...' : 'End Semester Now'}
                </button>
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
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF] mb-4"
                />
                <button
                  onClick={handleEndSemesterScheduled}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-[#FF7171] mb-2 disabled:opacity-50"
                  disabled={isSchedulingEnd || !endDate}
                >
                  {isSchedulingEnd ? 'Scheduling...' : 'Schedule End Date'}
                </button>
              </div>
            </div>
          ) : (
            /* Start New Semester Form */
            <div className="space-y-4">
              {/* ...existing form fields for starting semester... */}
              <div>
                <label className="block text-sm font-medium text-gray-700">School Year (20XX-20XX)</label>
                <input
                  type="text"
                  placeholder="23-24"
                  value={schoolYear}
                  onChange={handleSchoolYearChange}
                  className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* ...rest of the start semester form fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={shouldDisableInputs()}
                  className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option className="p-4" value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getTodayString()} // Prevents selecting dates before today
                  disabled={shouldDisableInputs()}
                  className="mt-1 block w-full rounded-md px-3 py-2 border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {currentSemester && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  />
                </div>
              )}
              <div className="pt-4 flex flex-col gap-2">
                {!currentSemester ? (
                  <button
                    onClick={handleStartSemester}
                    className="w-full bg-[#057DCD] text-white px-4 py-2 rounded-lg hover:bg-[#54BEFF] disabled:opacity-50"
                    disabled={!schoolYear || !startDate || isStartingSemester}
                  >
                    {isStartingSemester ? 'Starting...' : 'Start Semester'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleEndSemesterScheduled}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      End Semester on Selected Date
                    </button>
                    <button
                      onClick={handleEndSemesterNow}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      End Semester Now
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemesterManagement;
