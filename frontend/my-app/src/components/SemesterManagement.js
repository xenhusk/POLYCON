import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const SemesterManagement = () => {
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('1st');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentSemester, setCurrentSemester] = useState(null);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [isActivatingAll, setIsActivatingAll] = useState(false);

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
      if (!response.ok) throw new Error('Failed to start semester');
      const data = await response.json();
      setCurrentSemester(data.semester_id);
    } catch (err) {
      setError('Failed to start semester');
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#0065A8] mb-6">Semester Management</h2>
      
      <div className="flex gap-6">
        {/* Left side - Teacher List */}
        <div className="w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Teacher List</h3>
            <button
              onClick={handleActivateAll}
              disabled={isActivatingAll || teachers.every(t => t.isActive)}
              className={`bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors
                ${(isActivatingAll || teachers.every(t => t.isActive)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isActivatingAll ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Activating...</span>
                </div>
              ) : 'Activate All Teachers'}
            </button>
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
                {teachers.map(teacher => (
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
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
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
