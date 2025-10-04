import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import './transitions.css';
import API_URL from '../apiConfig';

export default function Departments() {
  // All hooks at the top
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const PolyconLogo = require('./icons/Polycon.svg').ReactComponent;
  const shouldBlockAdminMobile = userRole === 'admin' && isMobile;
  const [departments, setDepartments] = useState([]);
  const [departmentID, setDepartmentID] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [editing, setEditing] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLoadingDepartment, setIsLoadingDepartment] = useState(true);//preloader
  const filterRef = useRef(null);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [AddClicked, setAddClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [SearchClicked, setSearchClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoadingDepartment(true);
    try {
      const cachedDepartments = localStorage.getItem('departments');
      if (cachedDepartments) {
        const departmentsData = JSON.parse(cachedDepartments);
        console.log("Cached Departments:", departmentsData);
        setDepartments(departmentsData);
        setFilteredDepartments(departmentsData);
      } else {
        const response = await fetch(`${API_URL}/departments/get_departments`);
        const departmentsData = await response.json();
        console.log("Fetched Departments:", departmentsData);
        setDepartments(departmentsData);
        setFilteredDepartments(departmentsData);
        localStorage.setItem('departments', JSON.stringify(departmentsData));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoadingDepartment(false);
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const input = e.target.value;
    setDepartmentFilter(input);
    applyFilters(input);
  };

  const applyFilters = (input) => {
    setIsFiltering(true);

    setTimeout(() => {
      let filtered = departments;

      // Filter by department name
      if (input) {
        filtered = filtered.filter((department) =>
          department.name.toLowerCase().includes(input.toLowerCase())
        );
      }
      setFilteredDepartments(filtered);
      setIsFiltering(false);
    }, 500);
  };

  const handleSaveDepartment = async () => {
    if (!departmentName) {
      setMessage({ type: 'error', content: 'Department name is required' });
      return;
    }
    setIsAddLoading(true);
    try {
      const endpoint = editing 
        ? `${API_URL}/departments/edit_department/${departmentID}`
        : `${API_URL}/departments/add_department`;
      const method = editing ? 'PUT' : 'POST';
      console.log(`Sending ${method} request to ${endpoint} with data:`, { name: departmentName });
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: departmentName })
      });
      console.log(`Received response with status: ${response.status}`);
      const respJson = await response.json();
      if (response.ok) {
        let newId = editing ? departmentID : respJson.id;
        const newDepartment = { 
          id: newId, 
          name: departmentName 
        };
        const updatedDepartments = editing 
          ? departments.map(dept => String(dept.id) === String(departmentID) ? newDepartment : dept)
          : [...departments, newDepartment];
        setDepartments(updatedDepartments);
        setFilteredDepartments(updatedDepartments);
        localStorage.setItem('departments', JSON.stringify(updatedDepartments));
        setMessage({ type: 'success', content: editing ? 'Department updated successfully!' : 'Department added successfully!' });
        setTimeout(() => {
          resetForm();
          setMessage({ type: '', content: '' });
        }, 2000);
      } else {
        console.error("Request failed:", response.status, respJson);
        setMessage({ type: 'error', content: respJson.error || `Failed to save department. Status: ${response.status}` });
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: 'error', content: `Network error. Please try again. ${error}` });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEdit = (department) => {
    setDepartmentID(department.id);
    setDepartmentName(department.name);
    setEditing(true);
    setShowEditModal(true);
  };

  const handleDelete = (departmentId) => {
    setDepartmentToDelete(departmentId);
    // Show confirmation toast instead of modal
    setMessage({
      type: 'warning',
      content: (
        <div className="flex items-center justify-between">
          <span>Are you sure you want to delete this department?</span>
          <div className="flex gap-2 ml-4">
            <button
              onClick={confirmDelete}
              disabled={isDeleteLoading}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => {
                setMessage({ type: '', content: '' });
                setDepartmentToDelete(null);
              }}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    });
  };

  const confirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`${API_URL}/departments/delete_department/${departmentToDelete}`, {
        method: 'DELETE'
      });
      const respJson = await response.json();
      if (response.ok) {
        const updatedDepartments = departments.filter(department => String(department.id) !== String(departmentToDelete));
        setDepartments(updatedDepartments);
        setFilteredDepartments(updatedDepartments);
        localStorage.setItem('departments', JSON.stringify(updatedDepartments));
        setMessage({ type: 'success', content: 'Department deleted successfully!' });
        setDepartmentToDelete(null);
        // Auto-hide message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        console.error("Request failed:", response.status, respJson);
        setMessage({ type: 'error', content: respJson.error || `Failed to delete department. Status: ${response.status}` });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: 'error', content: `Network error. Please try again. ${error}` });
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setDepartmentID('');
    setDepartmentName('');
    setEditing(false);
    setShowAddModal(false);
    setShowEditModal(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Blocking message for admin on mobile/tablet */}
      {shouldBlockAdminMobile ? (
        <div className="fixed inset-0 flex flex-col pt-10 items-center min-h-screen w-screen bg-[#005B98] z-50">
          <PolyconLogo style={{ height: '200px', width: 'auto', marginBottom: '24px' }} />
          <h3 className="text-2xl font-bold text-white mb-4 mx-9 text-center">Faculty Portal Unavailable on Mobile/Tablet</h3>
          <p className="text-white mb-6 mx-9 text-center">For security and usability, please use a desktop or laptop to access admin features.</p>
          <button
            className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <>
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
                  Department Management
                </h1>
                <p className="text-xl md:text-2xl text-blue-200 mb-2">
                  Admin Dashboard
                </p>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                  Organize and manage academic departments across the institution
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
                  message.type === 'success'
                    ? "bg-green-500/90 text-white border border-green-400"
                    : message.type === 'warning'
                    ? "bg-yellow-500/90 text-white border border-yellow-400"
                    : "bg-red-500/90 text-white border border-red-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : message.type === 'warning' ? (
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
                    <h3 className="text-xl font-bold text-gray-800">Search Departments</h3>
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
                        value={departmentFilter}
                        onChange={handleDepartmentFilterChange}
                        placeholder="Search departments by name..."
                        className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className={`flex-1 max-w-[200px] sm:flex-none bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2
                      ${AddClicked ? "scale-90" : "scale-100"}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Department
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Departments Table Section - Enhanced with modern design */}
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
                    <table className="w-full text-center" style={{ minWidth: "600px" }}>
                      <thead className="bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] text-white sticky top-0" style={{ zIndex: 10 }}>
                        <tr>
                          <th className="px-4 py-4 text-sm font-bold min-w-[300px]">Department Name</th>
                          <th className="px-4 py-4 text-sm font-bold min-w-[120px] text-center">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Desktop table loading state */}
                        {(isLoadingDepartment || isFiltering) ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <motion.tr 
                              key={index} 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="animate-pulse border-b border-gray-100"
                            >
                              <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-48"></div></td>
                              <td className="px-4 py-4">
                                <div className="flex justify-center space-x-2">
                                  <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                                  <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : filteredDepartments.length > 0 ? (
                          filteredDepartments.map((department, index) => (
                            <motion.tr 
                              key={department.id} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                              className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                            >
                              <td className="px-4 py-4 text-sm text-gray-800 font-semibold">{department.name}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                                    onClick={() => {
                                      setEditClicked(true);
                                      setTimeout(() => setEditClicked(false), 300);
                                      handleEdit(department);
                                    }}
                                    title="Edit department"
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
                                      handleDelete(department.id);
                                    }}
                                    title="Delete department"
                                  >
                                    <DeleteIcon className="w-5 h-5" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No departments found</h3>
                                <p className="text-gray-500">Try adjusting your search or add a new department</p>
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
          </div>
      ):
      )
          {showAddModal && createPortal(
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
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                   onClick={(e) => e.stopPropagation()}
                   style={{
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none',
                     zIndex: 9999
                   }}>
                {/* Modern Add Department Modal Header */}
                <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Add New Department
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
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
                  {/* Department Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Department Name"
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                    />
                  </div>

                  {/* Message display */}
                  {message.content && (
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex mt-4">
                  <button
                    onClick={() => {
                      setAddClicked(true);
                      setTimeout(() => {
                        setAddClicked(false);
                        handleSaveDepartment();
                        setShowAddModal(false);
                      }, 300);
                    }}
                    disabled={isAddLoading}
                    className={`flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium
                    ${isAddLoading ? "opacity-50 cursor-not-allowed" : ""} 
                    ${AddClicked ? "scale-90" : "scale-100"}`}
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
                      <span>Add Department</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCancelClicked(true);
                      setTimeout(() => {
                        setCancelClicked(false);
                        setShowAddModal(false);
                      }, 300);
                    }}
                    className={`flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium ${
                      CancelClicked ? "scale-90" : "scale-100"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {showEditModal && createPortal(
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
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                   onClick={(e) => e.stopPropagation()}
                   style={{
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none',
                     zIndex: 9999
                   }}>
                {/* Modern Edit Department Modal Header */}
                <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Edit Department
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Department Name"
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                    />
                  </div>

                  {message.content && (
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>

                <div className="flex mt-4">
                  <button
                    onClick={() => {
                      setAddClicked(true);
                      setTimeout(() => setAddClicked(false), 300);
                      handleSaveDepartment();
                    }}
                    disabled={isAddLoading}
                    className={`flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium
                    ${isAddLoading ? "opacity-50 cursor-not-allowed" : ""} 
                    ${AddClicked ? "scale-90" : "scale-100"}`}
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
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Department</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCancelClicked(true);
                      setTimeout(() => {
                        setCancelClicked(false);
                        setShowEditModal(false);
                        resetForm();
                      }, 300);
                    }}
                    className={`flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium ${
                      CancelClicked ? "scale-90" : "scale-100"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
