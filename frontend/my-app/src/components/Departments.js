import React, { useEffect, useState, useRef } from 'react';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import './transitions.css';

export default function Departments() {
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
    setIsLoadingDepartment(true);  // Use the setter function here
    try {
      const cachedDepartments = localStorage.getItem('departments');
  
      if (cachedDepartments) {
        const departmentsData = JSON.parse(cachedDepartments);
        console.log("Cached Departments:", departmentsData); // Debug log
        setDepartments(departmentsData);
        setFilteredDepartments(departmentsData);
      } else {
        const response = await fetch('http://localhost:5001/department/get_departments');
        const departmentsData = await response.json();
        console.log("Fetched Departments:", departmentsData); // Debug log
  
        setDepartments(departmentsData);
        setFilteredDepartments(departmentsData);
        localStorage.setItem('departments', JSON.stringify(departmentsData));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoadingDepartment(false);  // Use the setter function here too
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
        ? `http://localhost:5001/department/edit_department/${departmentID}` 
        : `http://localhost:5001/department/add_department`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentName })
      });

      if (response.ok) {
        const newDepartment = { 
          id: editing ? departmentID : (await response.json()).id, 
          name: departmentName 
        };

        const updatedDepartments = editing 
          ? departments.map(dept => dept.id === departmentID ? newDepartment : dept)
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
        setMessage({ type: 'error', content: 'Failed to save department' });
      }
    } catch (error) {
      console.error('Error saving department:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEdit = (department) => {
    setDepartmentID(department.id);
    setDepartmentName(department.name);
    setEditing(true);
  };

  const handleDelete = (departmentId) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/department/delete_department/${departmentToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedDepartments = departments.filter(department => department.id !== departmentToDelete);
        setDepartments(updatedDepartments);
        setFilteredDepartments(updatedDepartments);
        localStorage.setItem('departments', JSON.stringify(updatedDepartments));
        setMessage({ type: 'success', content: 'Department deleted successfully!' });
        setShowDeleteModal(false);
        setDepartmentToDelete(null);
      } else {
        setMessage({ type: 'error', content: 'Failed to delete department' });
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setDepartmentID('');
    setDepartmentName('');
    setEditing(false);
  };

  return (
    <div className="items-center mx-auto p-6 bg-white fade-in">
      {/* Message display */}
      {message.content && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.content}
        </div>
      )}

      <h2 className="text-3xl mt-10 font-bold text-center text-[#0065A8] pb-5 fade-in delay-100">Departments</h2>

      <div className="flex items-center justify-center space-x-2 w-full mt-4 fade-in delay-200">
        <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
          <input 
            type="text"
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            placeholder="Search by Department Name"
            className="border-none focus:ring-0 outline-none w-[100%]"
          />
        </div>
        <button
          className={`bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition 
            ${SearchClicked ? "scale-90" : "scale-100"}`}
          onClick={() => {
            setSearchClicked(true);
            setTimeout(() => setSearchClicked(false), 300);
            applyFilters(departmentFilter);}}
        >
          Search
        </button>
      </div>

      <div className="flex justify-center w-full fade-in delay-300">
        <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[90%] mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center table-fixed">
              {/* Fixed Table Header */}
              <thead className="bg-[#057DCD] text-white top-0 z-10">
                <tr className="border-b">
                  <th className="py-3 ">ID</th>
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
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
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
                ) : filteredDepartments.length > 0 ? (
                    filteredDepartments.map((department) => (
                      <tr key={department.id} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                        <td className="px-4 py-3">{department.id}</td>
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

      <div className="flex justify-center w-full">
        <div className="relative mt-6 shadow-md rounded-lg p-1 bg-white">
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {/* Department Name */}
            <input 
              type="text" 
              placeholder="Department Name" 
              value={departmentName} 
              onChange={(e) => setDepartmentName(e.target.value)} 
              className="rounded-lg px-3 py-2 w-80 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" 
            />

            {/* Submit and Cancel Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  setAddClicked(true);
                  setTimeout(() => setAddClicked(false), 300);
                  handleSaveDepartment();}}
                disabled={isAddLoading}
                className={`px-8 py-2 rounded-lg text-white ${
                  editing ? 'bg-[#057DCD] hover:bg-[#54BEFF]' : 'bg-[#057DCD] hover:bg-[#54BEFF]'
                } ${isAddLoading ? 'opacity-50 cursor-not-allowed' : ''}
                 ${AddClicked ? "scale-90" : "scale-100"}  
                flex items-center space-x-2`}
              >
                {isAddLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{editing ? 'Updating...' : 'Adding...'}</span>
                  </>
                ) : (
                  <span>{editing ? 'UPDATE' : 'ADD'}</span>
                )}
              </button>
              {editing && (
                <button 
                  onClick={() => {
                    setAddClicked(true);
                    setTimeout(() => setAddClicked(false), 300);
                    resetForm();}}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  CANCEL
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this department? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCancelClicked(true); 
                  setTimeout(() => { setCancelClicked(false); setShowDeleteModal(false); 
                    setTimeout(() => setDepartmentToDelete(null), 
                    500);
                  }, 200);
                }}
                disabled={isDeleteLoading}
                className={`px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors
                  ${CancelClicked ? "scale-90" : "scale-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteClicked(true); 
                  setTimeout(() => { setDeleteClicked(false);
                    setTimeout(() => confirmDelete(), 
                    500);
                  }, 200);
                }}
                disabled={isDeleteLoading}
                className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors
                  ${DeleteClicked ? "scale-90" : "scale-100"}
                  ${isDeleteLoading ? 'opacity-50 cursor-not-allowed' : ''} 
                  flex items-center space-x-2`}
              >
                {isDeleteLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
