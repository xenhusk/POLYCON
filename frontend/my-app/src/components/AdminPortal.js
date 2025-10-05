import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { clearUserAuth } from '../utils/authUtils';
import { ReactComponent as EditIcon } from "./icons/Edit.svg";
import { ReactComponent as DeleteIcon } from "./icons/delete.svg";
import { motion, AnimatePresence } from "framer-motion";
import './transitions.css';  // Add this import

export default function AdminPortal() {
  const navigate = useNavigate();
  // Detect if on mobile/tablet - persistent check
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    // Check immediately
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Force check on component mount (handles navigation/reload cases)
    const timer = setTimeout(checkMobile, 100);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);
  
  // Additional check for mobile state on page visibility change (handles browser back/forward)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);
  
  const PolyconLogo = require('./icons/Polycon.svg').ReactComponent;
  // Fix: define userRole from localStorage - always check fresh
  const userRole = localStorage.getItem('userRole');

  // Logout function
  const handleLogout = () => {
    clearUserAuth();
    navigate('/login', { replace: true });
  };
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [sex, setSex] = useState('');
  const [yearSection, setYearSection] = useState('');
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [userList, setUserList] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [AddClicked, setAddClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);
  const [SaveClicked, setSaveClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [showStudentFields, setShowStudentFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Try to get data from cache first
      const cachedUsers = localStorage.getItem('users');
      const cachedDepartments = localStorage.getItem('departments');

      if (cachedUsers && cachedDepartments) {
        const usersData = JSON.parse(cachedUsers);
        const departmentsData = JSON.parse(cachedDepartments);

        setUserList(usersData);
        setDepartments(departmentsData);
      } else {
        // If no cache, fetch from server
        const [usersResponse, departmentsResponse] = await Promise.all([
          fetch(`${API_URL}/account/get_all_users`),
          fetch(`${API_URL}/account/departments`)
        ]);

        const usersData = await usersResponse.json();
        const departmentsData = await departmentsResponse.json();

        setUserList(Array.isArray(usersData) ? usersData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

        // Cache the fetched data
        localStorage.setItem('users', JSON.stringify(usersData));
        localStorage.setItem('departments', JSON.stringify(departmentsData));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setUserList([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/account/get_all_users`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserList(data);
        localStorage.setItem('users', JSON.stringify(data));
      } else {
        setUserList([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/account/departments`);
      const data = await response.json();
      setDepartments(data);
      localStorage.setItem('departments', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPrograms = async (departmentID) => {
    try {
      const response = await fetch(`${API_URL}/account/programs?departmentID=${departmentID}`);
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };
  const handleAddUser = async () => {
    // Use direct admin endpoint instead of signup to avoid email verification
    const userData = {
      idNumber,
      firstName,
      lastName,
      email,
      password: 'password123', // Default password for new users
      role: role || 'student',
      department: department || undefined,
      program: program || undefined,
      sex: sex || undefined,
      year_section: yearSection || undefined,
    };

    // Remove empty/undefined fields
    Object.keys(userData).forEach(key => (userData[key] === undefined || userData[key] === '') && delete userData[key]);

    try {
      const response = await fetch(`${API_URL}/account/admin_add_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', content: `${data.message} User has been created and can login immediately.` });
        fetchAllUsers();
        // Clear input fields
        setIdNumber('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setRole('');
        setDepartment('');
        setProgram('');
        setSex('');
        setYearSection('');
        // Close the modal
        setShowAddModal(false);
        // Auto-hide message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', content: data.error || 'Failed to add user' });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setMessage({ type: 'error', content: 'Failed to add user' });
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    }
  };

  const handleEditClick = async (user) => {
    setModalClosing(false);
    setIsEditLoading(false);
    try {
        // Find the department ID based on department name
        let departmentId = null;
        if (user.department && departments.length > 0) {
            const deptObj = departments.find(d => d.name === user.department);
            if (deptObj) {
                departmentId = deptObj.id;
            }
        }

        setEditUser({
            id: user.ID,
            id_number: user.idNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            department: departmentId, // Use the numeric ID
            program: user.programID || user.program || '',
            sex: user.sex || '',
            yearSection: user.year_section || ''
        });

        // Fetch programs if department is set
        if (departmentId) {
            await fetchPrograms(departmentId);
        }
    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        setIsEditLoading(false);
        setModalClosing(false);
    }
  };

  const handleUpdateUser = async () => {
    const updateData = {
      id: editUser.id,
      id_number: editUser.id_number,
      firstName: editUser.firstName,
      lastName: editUser.lastName,
      email: editUser.email,
      role: editUser.role,
      department: editUser.department, // This will now be the numeric ID
      program: editUser.program,
      sex: editUser.sex,
      year_section: editUser.yearSection
    };

    try {
      const response = await fetch(`${API_URL}/account/update_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        setMessage({ type: 'success', content: 'User updated successfully' });
        setEditUser(null);
        fetchAllUsers();
        // Auto-hide message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', content: data.error || 'Failed to update user' });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', content: 'Error updating user' });
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`${API_URL}/account/delete_user?id=${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the archived user from the table immediately
        setUserList(prevList => prevList.filter(user => user.ID !== userId));
        setMessage({ type: 'success', content: 'User archived successfully' });
        // Auto-hide message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', content: data.error || 'Failed to archive user' });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error archiving user:', error);
      setMessage({ type: 'error', content: 'Error archiving user. Please try again.' });
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    } finally {
      setIsDeleteLoading(false);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    
    if (selectedRole === "student") {
      setShowStudentFields(true);
    } else {
      setShowStudentFields(false);
    }
  };

  // When department changes in Add User modal, fetch programs just like Signup
  useEffect(() => {
    if (department) {
      fetchPrograms(department);
      setProgram(""); // Reset program when department changes
    } else {
      setPrograms([]);
      setProgram("");
    }
  }, [department]);

  // Always check if user is admin on mobile/tablet - persistent across navigation
  const isAdminOnMobile = userRole === 'admin' && (isMobile || window.innerWidth < 768);
  
  if (isAdminOnMobile) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#005B98] overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full w-full px-6 py-8">
          <PolyconLogo style={{ height: '200px', width: 'auto', marginBottom: '24px' }} />
          <h3 className="text-2xl font-bold text-white mb-4 text-center max-w-md">
            Admin Portal Unavailable on Mobile/Tablet
          </h3>
          <p className="text-white mb-8 text-center max-w-md leading-relaxed">
            For security and usability, please use a desktop or laptop to access admin features.
          </p>
          <button
            className="bg-[#057DCD] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#54BEFF] transition-all duration-200 font-semibold"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-16 overflow-hidden"
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
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              User Management
            </h1>
            
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Add, edit, and manage user accounts and permissions across the institution
            </p>
          </motion.div>
        </div>
      </motion.section>

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
                : message.type === "warning"
                ? "bg-yellow-500/90 text-white border border-yellow-400"
                : "bg-red-500/90 text-white border border-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : message.type === "warning" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {typeof message.content === 'string' ? message.content : message.content}
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
                <h3 className="text-xl font-bold text-gray-800">Search Users</h3>
              </div>
              
              <div className="relative w-full" style={{ zIndex: 12 }}>
                <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center min-h-[50px] w-full gap-2 hover:border-[#0065A8] transition-colors">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users by name, email, or ID..."
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                  </div>
              </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex-1 max-w-[140px] sm:flex-none bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </motion.button>
            </div>
          </div>
        </motion.div>      
        {/* Users Table Section - Enhanced with modern design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 relative"
          style={{ zIndex: 1 }}
        >
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-center" style={{ minWidth: "800px" }}>
                  <thead className="bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] text-white sticky top-0" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="px-4 py-4 text-sm font-bold min-w-[100px]">ID Number</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[200px]">Name</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[200px]">Email</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[120px]">Role</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[150px]">Department</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[150px] text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Desktop table loading state */}
                    {loading ? (
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
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-20"></div></td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center space-x-2">
                              <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                              <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : userList
                        .filter(user => {
                          const searchLower = searchTerm.toLowerCase();
                          return (
                            user.firstName?.toLowerCase().includes(searchLower) ||
                            user.lastName?.toLowerCase().includes(searchLower) ||
                            user.email?.toLowerCase().includes(searchLower) ||
                            user.idNumber?.toLowerCase().includes(searchLower) ||
                            user.role?.toLowerCase().includes(searchLower) ||
                            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
                          );
                        }).length > 0 ? (
                      userList
                        .filter(user => {
                          const searchLower = searchTerm.toLowerCase();
                          return (
                            user.firstName?.toLowerCase().includes(searchLower) ||
                            user.lastName?.toLowerCase().includes(searchLower) ||
                            user.email?.toLowerCase().includes(searchLower) ||
                            user.idNumber?.toLowerCase().includes(searchLower) ||
                            user.role?.toLowerCase().includes(searchLower) ||
                            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((u, index) => { 
                        let departmentDisplay = u.department;
                        if (departmentDisplay && departments.length > 0) {
                          let deptObj = departments.find(d => 
                            d.id === u.department ||
                            d.name === u.department ||
                            d.departmentID === u.department ||
                            d.departmentName === u.department
                          );
                          if (deptObj) {
                            departmentDisplay = deptObj.name || deptObj.departmentName;
                          }
                        }
                        return (
                          <motion.tr 
                            key={u.ID} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                            className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                          >
                            <td className="px-4 py-4 text-sm text-gray-700 font-semibold">
                              {u.idNumber}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-800 font-semibold">{u.firstName} {u.lastName}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                u.role === 'faculty' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">{departmentDisplay}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                                  onClick={() => {
                                    setEditClicked(true);
                                    setTimeout(() => setEditClicked(false), 300);
                                    handleEditClick(u);
                                  }}
                                  title="Edit user"
                                >
                                  <EditIcon className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                                  onClick={() => {
                                    setDeleteClicked(true);
                                    setTimeout(() => {
                                      setDeleteClicked(false);
                                      setUserToDelete(u.ID);
                                      // Show confirmation toast instead of modal
                                      setMessage({
                                        type: 'warning',
                                        content: (
                                          <div className="flex items-center justify-between">
                                            <span>Are you sure you want to archive this user?</span>
                                            <div className="flex gap-2 ml-4">
                                              <button
                                                onClick={() => handleDeleteUser(u.ID)}
                                                disabled={isDeleteLoading}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                                              >
                                                {isDeleteLoading ? 'Archiving...' : 'Archive'}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setMessage({ type: '', content: '' });
                                                  setUserToDelete(null);
                                                }}
                                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      });
                                    }, 300);
                                  }}
                                  title="Delete user"
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
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria</p>
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

      {showAddModal && createPortal(
        <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ 
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0, padding: '1rem',
          zIndex: 9999
        }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
               style={{
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 zIndex: 9999
               }}>
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Add New User</h2>
              </div>
              <button
                onClick={() => {
                  setModalClosing(true);
                  setTimeout(() => {
                    setShowAddModal(false);
                    setModalClosing(false);
                  }, 300);
                }}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
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

            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-8 focus:ring-[#54BEFF]"
                />
              </div>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Role</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={department}
                  onChange={async (e) => {
                    setDepartment(e.target.value);
                    setProgram("");
                    await fetchPrograms(e.target.value);
                  }}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              {/* Program (show if department is selected and role is student) */}
              {role === 'student' && department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.programID} value={prog.programID}>{prog.programName}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Sex (show if role is student) */}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              )}
              {/* Year & Section (show if role is student) */}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year & Section</label>
                  <input
                    type="text"
                    placeholder='e.g. 1A'
                    value={yearSection}
                    onChange={(e) => setYearSection(e.target.value)}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  />
                </div>
              )}
            </div>

            <div className="flex mt-4">
              <button
                className={`flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium ${
                  AddClicked ? "scale-90" : "scale-100"
                }`}
                onClick={() => {
                  setAddClicked(true);
                  setTimeout(() => {
                    setAddClicked(false);
                    handleAddUser();
                    setShowAddModal(false);
                  }, 300);
                }}
              >
                Add User
              </button>
              <button
                className={`flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium ${
                  CancelClicked ? "scale-90" : "scale-100"
                }`}
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setShowAddModal(false);
                  }, 300);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}      {editUser && createPortal(
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
          <div className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-opacity duration-500 ${
            modalClosing ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
               onClick={(e) => e.stopPropagation()}
               style={{
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 zIndex: 9999
               }}>
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Edit User</h2>
              </div>
              <button
                onClick={() => {
                  setModalClosing(true);
                  setTimeout(() => {
                    setEditUser(null);
                    setModalClosing(false);
                  }, 300);
                }}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
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

            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={editUser.id_number}
                  onChange={(e) => setEditUser({ ...editUser, id_number: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={editUser.department || ''}
                  onChange={async (e) => {
                    const newDepartment = e.target.value;
                    setEditUser({ ...editUser, department: newDepartment, program: '' });
                    if (newDepartment) {
                        await fetchPrograms(newDepartment);
                    }
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
              {/* Program (only show for students) */}
              {editUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={editUser.program}
                    onChange={(e) => setEditUser({ ...editUser, program: e.target.value })}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.programID} value={prog.programID}>
                        {prog.programName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Gender (only show for students) */}
              {editUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={editUser.sex}
                    onChange={(e) => setEditUser({ ...editUser, sex: e.target.value })}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              )}
              {/* Year and Section (only show for students) */}
              {editUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year & Section</label>
                  <input
                    type="text"
                    value={editUser.yearSection}
                    onChange={(e) => setEditUser({ ...editUser, yearSection: e.target.value })}
                    placeholder="e.g. 4A"
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  />
                </div>
              )}
            </div>

            <div className="flex mt-4">
              <button
                className={`flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium ${
                  SaveClicked ? "scale-90" : "scale-100"
                } ${isEditLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isEditLoading}
                onClick={() => {
                  setSaveClicked(true);
                  setTimeout(() => {
                    setSaveClicked(false);
                    setModalClosing(true);
                    setTimeout(() => {
                      handleUpdateUser();
                      setEditUser(null);
                    }, 500);
                  }, 200);
                }}
              >
                {isEditLoading ? (
                  <div className="flex items-center space-x-2">
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
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                className={`flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium ${
                  CancelClicked ? "scale-90" : "scale-100"
                }`}
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setModalClosing(true);
                    setTimeout(() => setEditUser(null), 500);
                  }, 200);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}