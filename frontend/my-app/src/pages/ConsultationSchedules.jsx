import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../apiConfig';
import logo from '../components/icons/logo2.png';
import { getProfilePictureUrl } from '../utils/utils';

const ConsultationSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semesterInfo, setSemesterInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState('');
  const [selectedTeacherDepartment, setSelectedTeacherDepartment] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');

  const dayNames = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday'
  };

  useEffect(() => {
    fetchDepartments();
    fetchSchedules();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedDepartment, selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      // Use search endpoint with empty query to get all teachers with profile pictures
      const response = await fetch(`${API_URL}/search/teachers?query=`);
      if (response.ok) {
        const data = await response.json();
        // Filter to only show active teachers and transform the data format
        const activeTeachers = data
          .filter(teacher => teacher.isActive)
          .map(teacher => {
            const nameParts = teacher.fullName.split(' ');
            return {
              id: teacher.ID,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              department: teacher.department,
              profile_picture: teacher.profilePicture,
              isActive: teacher.isActive
            };
          });
        setTeachers(activeTeachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/teacher_schedule/departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/teacher_schedule/public`;
      
      // Add filters based on selected teacher or department
      const params = new URLSearchParams();
      if (selectedTeacher) {
        params.append('teacher_id', selectedTeacher);
      } else if (selectedDepartment) {
        params.append('department_id', selectedDepartment);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules);
        setSemesterInfo(data.semester_info);
        setError('');
      } else {
        setError('Failed to fetch consultation schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to fetch consultation schedules');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupSchedulesByDay = (schedules) => {
    const grouped = {};
    
    schedules.forEach(schedule => {
      schedule.schedules.forEach(sched => {
        const day = sched.day_of_week;
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push({
          ...sched,
          teacher_name: schedule.teacher_name,
          teacher_id: schedule.teacher_id,
          profile_picture: schedule.profile_picture,
          department: schedule.department
        });
      });
    });

    // Sort schedules within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  };

  const groupedSchedules = groupSchedulesByDay(schedules);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#057DCD] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading consultation schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
      {/* Navigation Header */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50"
      >
        <div className="w-full">
          <div className="bg-[#057DCD] shadow-xl">
            <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <img
                  src={logo}
                  alt="POLYCON Logo"
                  className="h-14 w-14 object-contain"
                />
                <span className="text-white font-bold text-xl">
                  POLYCON
                </span>
              </motion.div>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/'}
                  className="text-white font-medium hover:text-blue-200 transition-colors duration-200 relative group"
                >
                  Home
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </motion.button>

                <span className="text-blue-200 font-medium">
                  Consultation Schedule
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/admin-consultation'}
                  className="text-white font-medium hover:text-blue-200 transition-colors duration-200 relative group"
                >
                  Leaderboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </motion.button>
            
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.href = '/'}
                className="md:hidden text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-15"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Teacher Consultation Schedules
            </h1>
            {semesterInfo && (
              <p className="text-xl md:text-2xl text-blue-200 mb-2">
                {semesterInfo.school_year} - {semesterInfo.semester} Semester
              </p>
            )}
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Find available consultation hours for our faculty members
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Filter Options</h3>
                  <p className="text-blue-100">Find schedules by department or specific teacher</p>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Department Filter */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#057DCD] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  Filter by Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    // Clear teacher selection when department changes
                    if (selectedTeacher) {
                      setSelectedTeacher('');
                      setSelectedTeacherName('');
                      setSelectedTeacherProfile('');
                      setSelectedTeacherDepartment('');
                      setTeacherSearchTerm('');
                    }
                  }}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-lg shadow-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Teacher Search */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Search by Teacher
                </label>
                <div className="relative">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all duration-200 shadow-sm">
                    {selectedTeacher && !teacherSearchTerm ? (
                      // Show selected teacher info when a teacher is selected and not searching
                      <div className="flex items-center gap-4 flex-grow bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-lg -mx-4 -my-4">
                        <img
                          src={getProfilePictureUrl(selectedTeacherProfile, selectedTeacherName)}
                          alt={selectedTeacherName}
                          className="rounded-full w-12 h-12 border-3 border-white shadow-lg"
                        />
                        <div className="flex flex-col flex-grow">
                          <span className="text-base font-bold text-white">{selectedTeacherName}</span>
                          <span className="text-sm text-emerald-100">{selectedTeacherDepartment}</span>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedTeacher('');
                            setSelectedTeacherName('');
                            setSelectedTeacherProfile('');
                            setSelectedTeacherDepartment('');
                          }}
                          className="text-white hover:text-red-200 ml-2 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>
                    ) : (
                      // Show search input when no teacher is selected or when searching
                      <>
                        <input
                          type="text"
                          value={teacherSearchTerm}
                          onChange={(e) => {
                            setTeacherSearchTerm(e.target.value);
                            if (selectedTeacher) {
                              setSelectedTeacher('');
                              setSelectedTeacherName('');
                              setSelectedTeacherProfile('');
                              setSelectedTeacherDepartment('');
                            }
                          }}
                          placeholder="Search by teacher name..."
                          className="flex-grow focus:outline-none text-lg"
                        />
                        <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </>
                    )}
                  </div>
                  {teacherSearchTerm && (
                    <motion.ul 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 bg-white border-2 border-gray-200 rounded-xl mt-2 max-h-60 overflow-y-auto w-full shadow-2xl"
                    >
                      {teachers
                        .filter(teacher => {
                          const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
                          return fullName.includes(teacherSearchTerm.toLowerCase());
                        })
                        .map((teacher, index) => (
                          <motion.li 
                            key={teacher.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setSelectedTeacher(teacher.id);
                              setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
                              setSelectedTeacherProfile(teacher.profile_picture);
                              setSelectedTeacherDepartment(teacher.department);
                              setTeacherSearchTerm('');
                            }} 
                            className="px-4 py-3 cursor-pointer hover:bg-emerald-50 flex items-center transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <img 
                              src={getProfilePictureUrl(teacher.profile_picture, `${teacher.firstName} ${teacher.lastName}`)}
                              alt={`${teacher.firstName} ${teacher.lastName}`}
                              className="rounded-full w-10 h-10 mr-3 border-2 border-white shadow-sm" 
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{teacher.firstName} {teacher.lastName}</span>
                              <span className="text-sm text-gray-500">{teacher.department}</span>
                            </div>
                          </motion.li>
                        ))}
                      {teachers.filter(teacher => {
                        const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
                        return fullName.includes(teacherSearchTerm.toLowerCase());
                      }).length === 0 && (
                        <li className="px-4 py-3 text-gray-500 text-center">
                          No teachers found matching "{teacherSearchTerm}"
                        </li>
                      )}
                    </motion.ul>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Schedules</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Schedules Display */}
        {schedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Schedules Available</h3>
              <p className="text-lg text-gray-600">
                No consultation schedules are available at this time. Please check back later.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {Object.keys(groupedSchedules)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((day, dayIndex) => (
                <motion.div 
                  key={day} 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * dayIndex }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white p-6">
                    <h3 className="text-2xl font-bold flex items-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold">{parseInt(day) + 1}</span>
                      </div>
                      {dayNames[day]}
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {groupedSchedules[day].map((schedule, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#057DCD] pl-6 p-6 rounded-r-xl transition-all duration-300 hover:shadow-lg hover:from-blue-100 hover:to-indigo-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <motion.img
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                              src={getProfilePictureUrl(schedule.profile_picture, schedule.teacher_name)}
                              alt={schedule.teacher_name}
                              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg hover:shadow-xl cursor-pointer"
                            />
                            <div>
                              <h4 className="font-bold text-xl text-gray-800 mb-1">
                                {schedule.teacher_name}
                              </h4>
                              <p className="text-gray-600 text-sm">Consultation Hours</p>
                            </div>
                          </div>
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="text-sm bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white px-4 py-2 rounded-full font-semibold shadow-lg"
                          >
                            {schedule.department}
                          </motion.span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                            <div className="w-10 h-10 bg-[#057DCD] rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 block">Time</span>
                              <span className="text-lg font-bold text-[#057DCD]">
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </span>
                            </div>
                          </div>
                          {schedule.venue && (
                            <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 block">Venue</span>
                                <span className="text-lg font-bold text-emerald-600">{schedule.venue}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Back to Homepage Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl text-lg border-2 border-transparent hover:border-white hover:border-opacity-20"
          >
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Homepage
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsultationSchedules;
