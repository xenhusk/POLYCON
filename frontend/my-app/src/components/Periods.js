import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import './transitions.css';
import API_URL from '../apiConfig';

export default function Periods() {
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
  const [periods, setPeriods] = useState([]);
  const [periodID, setPeriodID] = useState('');
  const [periodName, setPeriodName] = useState('');
  const [editing, setEditing] = useState(false);
  const [filteredPeriods, setFilteredPeriods] = useState([]);
  const [periodFilter, setPeriodFilter] = useState('');
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(true);
  const filterRef = useRef(null);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState(null);
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
    setIsLoadingPeriod(true);
    try {
      const response = await fetch(`${API_URL}/periods/get_periods`);
      const periodsData = await response.json();
      console.log("Fetched Periods:", periodsData);
      setPeriods(periodsData);
      setFilteredPeriods(periodsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoadingPeriod(false);
    }
  };

  const handlePeriodFilterChange = (e) => {
    const input = e.target.value;
    setPeriodFilter(input);
    applyFilters(input);
  };

  const applyFilters = (input) => {
    setIsFiltering(true);

    setTimeout(() => {
      let filtered = periods;

      // Filter by period name
      if (input) {
        filtered = filtered.filter((period) =>
          period.name.toLowerCase().includes(input.toLowerCase())
        );
      }

      setFilteredPeriods(filtered);
      setIsFiltering(false);
    }, 500);
  };

  const handleSavePeriod = async () => {
    if (!periodName) {
      setMessage({ type: 'error', content: 'Period name is required' });
      return;
    }
    setIsAddLoading(true);
    try {
      const endpoint = editing 
        ? `${API_URL}/periods/edit_period/${periodID}`
        : `${API_URL}/periods/add_period`;
      const method = editing ? 'PUT' : 'POST';
      console.log(`Sending ${method} request to ${endpoint} with data:`, { name: periodName });
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: periodName })
      });
      console.log(`Received response with status: ${response.status}`);
      const respJson = await response.json();
      if (response.ok) {
        let newId = editing ? periodID : respJson.id;
        const newPeriod = { 
          id: newId, 
          name: periodName,
          is_active: respJson.period?.is_active || false
        };
        const updatedPeriods = editing 
          ? periods.map(period => String(period.id) === String(periodID) ? newPeriod : period)
          : [...periods, newPeriod];
        setPeriods(updatedPeriods);
        setFilteredPeriods(updatedPeriods);
        setMessage({ type: 'success', content: editing ? 'Period updated successfully!' : 'Period added successfully!' });
        setTimeout(() => {
          resetForm();
          setMessage({ type: '', content: '' });
        }, 2000);
      } else {
        console.error("Request failed:", response.status, respJson);
        setMessage({ type: 'error', content: respJson.error || `Failed to save period. Status: ${response.status}` });
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: 'error', content: 'Network error occurred' });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleDeletePeriod = async () => {
    if (!periodToDelete) return;
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`${API_URL}/periods/delete_period/${periodToDelete.id}`, {
        method: 'DELETE'
      });
      const respJson = await response.json();
      if (response.ok) {
        const updatedPeriods = periods.filter(period => period.id !== periodToDelete.id);
        setPeriods(updatedPeriods);
        setFilteredPeriods(updatedPeriods);
        setMessage({ type: 'success', content: 'Period deleted successfully!' });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', content: respJson.error || 'Failed to delete period' });
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: 'error', content: 'Network error occurred' });
    } finally {
      setIsDeleteLoading(false);
      setShowDeleteModal(false);
      setPeriodToDelete(null);
    }
  };

  const handleSetActivePeriod = async (period) => {
    try {
      const response = await fetch(`${API_URL}/periods/set_active_period/${period.id}`, {
        method: 'PUT'
      });
      const respJson = await response.json();
      if (response.ok) {
        // Update all periods to set the selected one as active and others as inactive
        const updatedPeriods = periods.map(p => ({
          ...p,
          is_active: p.id === period.id
        }));
        setPeriods(updatedPeriods);
        setFilteredPeriods(updatedPeriods);
        setMessage({ type: 'success', content: `${period.name} is now the active period!` });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', content: respJson.error || 'Failed to set active period' });
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: 'error', content: 'Network error occurred' });
    }
  };

  const handleCreateDefaultPeriods = async () => {
    try {
      const response = await fetch(`${API_URL}/periods/create_default_periods`, {
        method: 'POST'
      });
      const respJson = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', content: 'Default periods created successfully!' });
        // Refresh the periods list
        fetchInitialData();
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', content: respJson.error || 'Failed to create default periods' });
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: 'error', content: 'Network error occurred' });
    }
  };

  const resetForm = () => {
    setPeriodName('');
    setEditing(false);
    setPeriodID('');
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleEditPeriod = (period) => {
    setPeriodID(period.id);
    setPeriodName(period.name);
    setEditing(true);
    setShowEditModal(true);
  };

  const handleDeleteClick = (period) => {
    setPeriodToDelete(period);
    setShowDeleteModal(true);
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
                  Period Management
                </h1>
                
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                  Organize and manage academic periods across the institution
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
                    <h3 className="text-xl font-bold text-gray-800">Search Periods</h3>
                  </div>
                  
                  <div className="relative w-full" style={{ zIndex: 12 }}>
                    <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center min-h-[50px] w-full gap-2 hover:border-[#0065A8] transition-colors">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input 
                        ref={filterRef}
                        type="text"
                        value={periodFilter}
                        onChange={handlePeriodFilterChange}
                        placeholder="Search periods by name..."
                        className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {periods.length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateDefaultPeriods}
                      className="flex-1 max-w-[250px] sm:flex-none bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Create Default Periods
                    </motion.button>
                  )}
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
                    Add Period
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Periods Table Section - Enhanced with modern design */}
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
                          <th className="px-4 py-4 text-sm font-bold min-w-[300px]">Period Name</th>
                          <th className="px-4 py-4 text-sm font-bold min-w-[120px]">Status</th>
                          <th className="px-4 py-4 text-sm font-bold min-w-[120px] text-center">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Desktop table loading state */}
                        {(isLoadingPeriod || isFiltering) ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <motion.tr 
                              key={index} 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="animate-pulse border-b border-gray-100"
                            >
                              <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-48"></div></td>
                              <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full mx-auto w-20"></div></td>
                              <td className="px-4 py-4">
                                <div className="flex justify-center space-x-2">
                                  <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                                  <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : filteredPeriods.length > 0 ? (
                          filteredPeriods.map((period, index) => (
                            <motion.tr 
                              key={period.id} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                              className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                            >
                              <td className="px-4 py-4 text-sm text-gray-800 font-semibold">{period.name}</td>
                              <td className="px-4 py-4">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSetActivePeriod(period)}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                    period.is_active
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  {period.is_active ? 'Active' : 'Inactive'}
                                </motion.button>
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
                                      handleEditPeriod(period);
                                    }}
                                    title="Edit period"
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
                                      handleDeleteClick(period);
                                    }}
                                    title="Delete period"
                                  >
                                    <DeleteIcon className="w-5 h-5" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No periods found</h3>
                                <p className="text-gray-500 mb-4">
                                  {periods.length === 0 ? 'Create default periods to get started' : 'Try adjusting your search'}
                                </p>
                                {periods.length === 0 && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreateDefaultPeriods}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Create Default Periods
                                  </motion.button>
                                )}
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
        </>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold mb-4">
              {editing ? 'Edit Period' : 'Add New Period'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period Name *
                </label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter period name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isAddLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePeriod}
                disabled={isAddLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isAddLoading ? 'Saving...' : (editing ? 'Update' : 'Add')}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the period "{periodToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPeriodToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isDeleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePeriod}
                disabled={isDeleteLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
