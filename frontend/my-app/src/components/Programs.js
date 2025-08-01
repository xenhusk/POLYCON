import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as PolyconLogo } from './icons/Polycon.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import './transitions.css';
import API_URL from '../apiConfig';

export default function Programs() {
  // Detect mobile/tablet
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const userRole = localStorage.getItem('userRole');

  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programName, setProgramName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [programFilter, setProgramFilter] = useState('');
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
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
    setIsLoadingPrograms(true);
    try {
      const [programsResponse, departmentsResponse] = await Promise.all([
        fetch(`${API_URL}/program/get_programs`),
        fetch(`${API_URL}/program/get_departments`)
      ]);
      const programsData = await programsResponse.json();
      const departmentsData = await departmentsResponse.json();
      setPrograms(programsData || []);
      setFilteredPrograms(programsData || []);
      setDepartments(departmentsData || []);
      localStorage.setItem('programs', JSON.stringify(programsData));
      localStorage.setItem('departments', JSON.stringify(departmentsData));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const selectedDeptId = e.target.value;
    setSelectedDepartment(selectedDeptId);

    if (selectedDeptId) {
      const filtered = programs.filter(prog => prog.departmentID === selectedDeptId);
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programs);
    }
  };

  const handleAddProgram = async () => {
    if (!programName || !selectedDepartment) {
      setMessage({ type: 'error', content: 'All fields are required' });
      return;
    }
    setIsAddLoading(true);
    try {
      const response = await fetch(`${API_URL}/program/add_program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programName, departmentID: parseInt(selectedDepartment) })
      });
      if (response.ok) {
        await fetchInitialData();
        setMessage({ type: 'success', content: 'Program added successfully!' });
        resetForm();
      } else {
        const errorMessage = await response.json();
        setMessage({ type: 'error', content: errorMessage.error || 'Failed to add program' });
      }
    } catch (error) {
      console.error('Error adding program:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleUpdateProgram = async () => {
    if (!programName || !selectedDepartment || !editingProgramId) {
      setMessage({ type: 'error', content: 'All fields are required' });
      return;
    }
    setIsAddLoading(true);
    try {
      const response = await fetch(`${API_URL}/program/update_program/${editingProgramId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programName, departmentID: parseInt(selectedDepartment) })
      });
      if (response.ok) {
        await fetchInitialData();
        setMessage({ type: 'success', content: 'Program updated successfully!' });
        resetForm();
        setEditing(false);
        setEditingProgramId(null);
      } else {
        const errorMessage = await response.json();
        setMessage({ type: 'error', content: errorMessage.error || 'Failed to update program' });
      }
    } catch (error) {
      console.error('Error updating program:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEdit = (program) => {
    setProgramName(program.programName);
    setSelectedDepartment(program.departmentID);
    setEditing(true);
    setEditingProgramId(program.id);
    setShowEditModal(true);
  };

  const handleDelete = (programId) => {
    setProgramToDelete(programId);
    // Show confirmation toast instead of modal
    setMessage({
      type: 'warning',
      content: (
        <div className="flex items-center justify-between">
          <span>Are you sure you want to delete this program?</span>
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
                setProgramToDelete(null);
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
      const response = await fetch(`${API_URL}/program/delete_program/${programToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchInitialData();
        setMessage({ type: 'success', content: 'Program deleted successfully!' });
        setProgramToDelete(null);
        // Auto-hide message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      } else {
        const errorMessage = await response.json();
        setMessage({ type: 'error', content: errorMessage.error || 'Failed to delete program' });
        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setProgramName('');
    setSelectedDepartment('');
    setEditing(false);
    setEditingProgramId(null);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const applyFilters = () => {
    setIsFiltering(true);

    setTimeout(() => {
      let filtered = programs;

      if (programFilter) {
        filtered = filtered.filter((program) =>
          program.programName.toLowerCase().includes(programFilter.toLowerCase())
        );
      }
      setFilteredPrograms(filtered);
      setIsFiltering(false);
    }, 300); 
  };

  const handleProgramFilterChange = (e) => {
    const input = e.target.value;
    setProgramFilter(input);
    applyFilters();
  };

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
    <div className="mx-auto p-6 bg-white fade-in">
      {/* Polycon Logo at the top */}
      {message.content && (
        <div className={`fixed top-5 right-5 z-50 rounded-lg shadow-lg max-w-md p-4 
          ${message.type === 'success' ? 'bg-green-100 text-green-700' : 
            message.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-500' : 
            'bg-red-100 text-red-700'}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {typeof message.content === 'string' ? message.content : message.content}
            </div>
            {typeof message.content === 'string' && (
              <button
                onClick={() => setMessage({ type: '', content: '' })}
                className="ml-3 text-current hover:opacity-70"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto p-4 bg-white mt-6">
        <h2 className="text-3xl font-bold text-center text-[#0065A8] pb-5 mb-4 fade-in delay-100">Programs</h2>
        
        <div className="flex items-center justify-between space-x-4 w-[90%] mt-4 mx-auto fade-in delay-200">
          {/* Add Program Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-[#057DCD] text-white rounded-lg hover:bg-[#54BEFF] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
          >
            Add Program
          </button>

          {/* Search Section */}
          <div className="flex items-center space-x-2">
            <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
              <input 
                type="text"
                value={programFilter}
                onChange={handleProgramFilterChange}
                placeholder="Search by Program Name"
                className="border-none focus:ring-0 outline-none w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[90%] mx-auto fade-in delay-300">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center table-fixed">
              <thead className="bg-[#057DCD] text-white sticky top-0 z-10">
                <tr className="border-b align-middle">
                  {/* <th className="px-4 py-3">ID</th> */}
                  <th className="px-4 py-3">Program Name</th>
                  <th className="px-4 py-3 pl-2">Department</th>
                  <th className="pr-5">Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="max-h-80 overflow-y-scroll">
            <table className="w-full bg-white text-center table-fixed">
              <tbody>
              {(isLoadingPrograms || isFiltering) ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b h-[50px] align-middle">
                    {/* <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                    </td> */}
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => {
                    return (
                      <tr key={program.id} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                        {/* <td className="px-4 py-3">{program.id}</td> */}
                        <td className="px-4 py-3">{program.programName}</td>
                        <td className="px-4 py-3">
                          {program.departmentName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 flex justify-center space-x-3 align-middle">
                          <button
                          className={`text-gray-500 hover:text-gray-700 ${
                            EditClicked ? "scale-90" : "scale-100"}`}
                          onClick={() => {
                            setEditClicked(true);
                            setTimeout(() => setEditClicked(false), 300);
                            handleEdit(program);}}
                          >
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button
                            className={`text-gray-500 hover:text-gray-700 ${
                              DeleteClicked ? "scale-90" : "scale-100"}`}
                            onClick={() => { setDeleteClicked(true);
                              setTimeout(() => setDeleteClicked(false), 300);
                              handleDelete(program.id);
                              }}
                          >
                            <DeleteIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No programs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-white">
                Add New Program
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
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

            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* Program Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Program Name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name || dept.departmentName}
                    </option>
                  ))}
                </select>
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
                    handleAddProgram();
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
                  <span>Add Program</span>
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
            <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-white">
                Edit Program
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
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

            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Program Name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select a department</option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
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
                  handleUpdateProgram();
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
                  <span>Update Program</span>
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
    </div>
  );
}
