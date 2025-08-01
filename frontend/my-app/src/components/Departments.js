import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
    <div className="w-full min-h-screen items-center bg-white fade-in">
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
          {/* Message display */}
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

          <h2 className="text-3xl mt-10 font-bold text-center text-[#0065A8] pb-5 fade-in delay-100">Departments</h2>

          <div className="flex items-center justify-between space-x-4 w-[90%] mt-4 mx-auto fade-in delay-200">
            {/* Add Department Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-[#057DCD] text-white rounded-lg hover:bg-[#54BEFF] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
            >
              Add Department
            </button>

            {/* Search Section */}
            <div className="flex items-center space-x-2">
              <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
                <input 
                  type="text"
                  value={departmentFilter}
                  onChange={handleDepartmentFilterChange}
                  placeholder="Search by Department Name"
                  className="border-none focus:ring-0 outline-none w-[100%]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center w-full fade-in delay-300">
            <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[90%] mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full bg-white text-center table-fixed">
                  {/* Fixed Table Header */}
                  <thead className="bg-[#057DCD] text-white top-0 z-10">
                    <tr className="border-b">
                      {/* <th className="py-3 ">ID</th> */}
                      <th className=" py-3  ">Department Name</th>
                      <th className="pr-5">Actions</th>
                    </tr>
                  </thead>
                </table>
                
                {/* Scrollable Table Body */}
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full bg-white text-center table-fixed">
                    <tbody>
                    {(isLoadingDepartment || isFiltering) ? (
                      // 🚀 Loading Skeleton with Pulse Animation
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse border-b h-[50px] align-middle">
                          {/* <td className="px-4 py-3">
                            <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                          </td> */}
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
                    ) : filteredDepartments.length > 0 ? (
                        filteredDepartments.map((department) => (
                          <tr key={department.id} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                            {/* <td className="px-4 py-3">{department.id}</td> */}
                            <td className="px-4 py-3">{department.name}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-3">
                                <button
                                  className={`text-gray-500 hover:text-gray-700 ${
                                    EditClicked ? "scale-90" : "scale-100"}`}
                                  onClick={() => {
                                    setEditClicked(true);
                                    setTimeout(() => setEditClicked(false), 300);
                                    handleEdit(department);}}
                                >
                                  <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                  className={`text-gray-500 hover:text-gray-700 ${
                                    DeleteClicked ? "scale-90" : "scale-100"}`}
                                  onClick={() => { setDeleteClicked(true);
                                    setTimeout(() => setDeleteClicked(false), 300);
                                    handleDelete(department.id);
                                    }}
                                >
                                  <DeleteIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                            No departments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                    Add New Department
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
                <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                  <h2 className="text-lg font-semibold text-white">
                    Edit Department
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
