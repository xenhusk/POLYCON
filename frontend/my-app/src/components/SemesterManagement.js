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

  useEffect(() => {
    fetch('http://localhost:5001/semester/teachers')
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.error('Failed to load teachers', err));
  }, []);

  const validateSchoolYear = (input) => {
    const regex = /^\d{2}-\d{2}$/;
    if (!regex.test(input)) {
      setError('School year must be in format XX-XX');
      return false;
    }
    const [start, end] = input.split('-').map(Number);
    if (end !== start + 1) {
      setError('Second year must be one year after the first');
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
    if (!validateSchoolYear(schoolYear)) return;
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
        return;
      }
      
      setCurrentSemester(data.semester_id);
    } catch (err) {
      setError(`Failed to start semester. School year ${fullSchoolYear} already exists.`);
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

  // NEW: Add function to end semester immediately (using current date)
  const handleEndSemesterNow = async () => {
    if (!currentSemester) return;
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      const response = await fetch('http://localhost:5001/semester/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester_id: currentSemester,
          endDate: currentDate
        }),
      });
      if (!response.ok) throw new Error('Failed to end semester now');
      setCurrentSemester(null);
      const teachersResponse = await fetch('http://localhost:5001/semester/teachers');
      if (!teachersResponse.ok) throw new Error('Failed to fetch teachers');
      const teachersData = await teachersResponse.json();
      setTeachers(teachersData);
    } catch (err) {
      setError('Failed to end semester now');
    }
  };

  // NEW: Function to end semester using selected date without immediately deactivating teachers if in future
  const handleEndSemesterScheduled = async () => {
    if (!currentSemester || !endDate) return;
    try {
      const selectedDate = new Date(endDate);
      const today = new Date();
      const endpoint = selectedDate > today 
        ? 'http://localhost:5001/semester/end/schedule'
        : 'http://localhost:5001/semester/end';  // Fallback for past/now dates
      
      const response = await fetch(endpoint, {
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

  const handleActivate = async (teacherId) => {
    try {
      const response = await fetch('http://localhost:5001/semester/teacher/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      if (!response.ok) throw new Error('Activation failed');
      setTeachers(prev =>
        prev.map(teacher =>
          teacher.ID === teacherId ? { ...teacher, isActive: true } : teacher
        )
      );
    } catch (err) {
      setError('Failed to activate teacher');
    }
  };

  const handleActivateAll = async () => {
    setIsActivatingAll(true);
    try {
      const response = await fetch('http://localhost:5001/semester/teacher/activate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to activate all teachers');
      
      // Update local state to reflect all teachers as active
      setTeachers(prevTeachers =>
        prevTeachers.map(teacher => ({ ...teacher, isActive: true }))
      );
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

  return (
    <div className="p-6">
      {/* Error/Success Message Toast */}
      {error && (
        <div className="fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold text-[#0065A8] mb-6">Semester Management</h2>

      <div className="flex gap-6">
        {/* Left side - Teacher List (filtered if teacherSearchTerm is set) */}
        <div className="w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Teacher List</h3>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center relative">
                {/* Teacher Search Field */}
                <input 
                  type="text"
                  value={teacherSearchTerm}
                  onChange={handleTeacherSearchChange}
                  placeholder="Search teacher by name..."
                  className="border border-gray-300 shadow-md rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
                {/* Department Filter Icon Button - Updated onClick to toggle */}
                <button 
                  onClick={() => setShowDepartmentModal(!showDepartmentModal)}
                  className={`p-2 rounded-full bg-[#057DCD] hover:bg-[#0065A8] shadow-md transition-colors
                    ${showDepartmentModal ? 'bg-[#0065A8]' : ''}`}
                  title="Filter by Department"
                >
                  <FilterIcon className="w-5 h-5 text-white" />
                </button>
                
                {/* AnimatePresence for smooth animation when closing */}
                <AnimatePresence>
                  {showDepartmentModal && (
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
                  )}
                </AnimatePresence>
              </div>
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
                  <tr key={teacher.ID} className="border-b hover:bg-[#DBF1FF]">
                    <td className="py-3 px-4 text-center">{teacher.ID}</td>
                    <td className="py-3 px-4 text-center">{teacher.fullName}</td>
                    <td className="py-3 px-4 text-center">{teacher.department}</td>
                    <td className="py-3 px-4 text-center">
                      {teacher.isActive ? (
                        <span className="text-green-500 font-medium">Active</span>
                      ) : (
                        <button
                          onClick={() => handleActivate(teacher.ID)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                        >
                          Activate
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
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Start/End Semester</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">School Year (20XX-20XX)</label>
              <input
                type="text"
                placeholder="23-24"
                value={schoolYear}
                onChange={handleSchoolYearChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {currentSemester && (
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="pt-4 flex flex-col gap-2">
              {!currentSemester ? (
                <button
                  onClick={handleStartSemester}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={!schoolYear || !startDate}
                >
                  Start Semester
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEndSemesterScheduled}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    disabled={!endDate}
                  >
                    End Semester on Selected Date
                  </button>
                  <button
                    onClick={handleEndSemesterNow}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    End Semester Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterManagement;
