import React, { useEffect, useState, useRef } from 'react';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [departmentID, setDepartmentID] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [editing, setEditing] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const filterRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const input = e.target.value;
    setDepartmentFilter(input);
    applyFilters(input);
  };

  const applyFilters = (input) => {
    let filtered = departments;

    // Filter by department name
    if (input) {
      filtered = filtered.filter((department) =>
        department.name.toLowerCase().includes(input.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleSaveDepartment = async () => {
    if (!departmentName) {
      alert('Department name is required');
      return;
    }
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
        alert(editing ? 'Department updated successfully' : 'Department added successfully');
  
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
        resetForm();
      } else {
        alert('Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department) => {
    setDepartmentID(department.id);
    setDepartmentName(department.name);
    setEditing(true);
  };

  const handleDelete = async (departmentID) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this department?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/department/delete_department/${departmentID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Department deleted successfully');
        const updatedDepartments = departments.filter(department => department.id !== departmentID);
        setDepartments(updatedDepartments);
        setFilteredDepartments(updatedDepartments);
        localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      } else {
        alert('Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const resetForm = () => {
    setDepartmentID('');
    setDepartmentName('');
    setEditing(false);
  };

  return (
    <div className=" items-center mx-auto p-6 bg-white">
      <h2 className="text-2xl mt-10 font-bold text-center text-gray-800">Departments</h2>

      <div className="flex items-center justify-center space-x-2 w-full mt-4">
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
          onClick={() => applyFilters(departmentFilter)} 
          className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      <div className="flex justify-center w-full">
        <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[40%] mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center table-fixed">
              {/* Fixed Table Header */}
              <thead className="bg-[#057DCD] text-white top-0 z-10">
                <tr className="border-b">
                  <th className="py-3 ">ID</th>
                  <th className=" py-3  ">Department Name</th>
                  <th className=" py-3  text-center">Actions</th>
                </tr>
              </thead>
            </table>
            
            {/* Scrollable Table Body */}
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full bg-white text-center table-fixed">
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                        Loading, please wait...
                      </td>
                    </tr>
                  ) : filteredDepartments.length > 0 ? (
                    filteredDepartments.map((department) => (
                      <tr key={department.id} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                        <td className="px-4 py-3">{department.id}</td>
                        <td className="px-4 py-3">{department.name}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => handleEdit(department)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(department.id)}
                              className="text-gray-500 hover:text-gray-700"
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
              className="rounded-lg px-3 py-2 w-60 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" 
            />

            {/* Submit and Cancel Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSaveDepartment} 
                className={`px-4 py-2 rounded-lg ${editing ? 'bg-yellow-500 text-white' : 'bg-[#057DCD] text-white hover:bg-blue-500'}`}
              >
                {editing ? 'UPDATE' : 'ADD'}
              </button>
              {editing && (
                <button 
                  onClick={resetForm} 
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  CANCEL
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
