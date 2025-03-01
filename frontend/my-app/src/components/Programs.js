import React, { useEffect, useState } from 'react';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import './transitions.css';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programName, setProgramName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [editing, setEditing] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);//preloader
  const [programFilter, setProgramFilter] = useState(''); // Program filter input
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false); // Loading state for filtering
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
      const cachedPrograms = localStorage.getItem('programs');
      const cachedDepartments = localStorage.getItem('departments');

      if (cachedPrograms && cachedDepartments) {
        const programsData = JSON.parse(cachedPrograms);
        const departmentsData = JSON.parse(cachedDepartments);

        setPrograms(programsData);
        setFilteredPrograms(programsData);
        setDepartments(departmentsData);
      } else {
        const [programsResponse, departmentsResponse] = await Promise.all([
          fetch('http://localhost:5001/program/get_programs'),
          fetch('http://localhost:5001/program/get_departments')
        ]);

        const programsData = await programsResponse.json();
        const departmentsData = await departmentsResponse.json();

        setPrograms(programsData || []);
        setFilteredPrograms(programsData || []);
        setDepartments(
          departmentsData.map(dept => ({
            id: dept.id,
            name: dept.name || dept.departmentName
          }))
        );

        localStorage.setItem('programs', JSON.stringify(programsData));
        localStorage.setItem('departments', JSON.stringify(departmentsData));
      }
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
      const newProgramID = `P${String(programs.length + 1).padStart(2, '0')}`;
      const response = await fetch('http://localhost:5001/program/add_program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newProgramID, programName, departmentID: selectedDepartment })
      });

      if (response.ok) {
        const newProgram = { id: newProgramID, programName, departmentID: selectedDepartment };
        const updatedPrograms = [...programs, newProgram];
        setPrograms(updatedPrograms);
        setFilteredPrograms(updatedPrograms);
        localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        setMessage({ type: 'success', content: 'Program added successfully!' });
        setTimeout(() => {
          resetForm();
          setMessage({ type: '', content: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', content: 'Failed to add program' });
      }
    } catch (error) {
      console.error('Error adding program:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEdit = (program) => {
    setProgramName(program.programName);
    setSelectedDepartment(program.departmentID);
    setEditing(true);
  };

  const handleDelete = (programId) => {
    setProgramToDelete(programId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/program/delete_program/${programToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const updatedPrograms = programs.filter(program => program.id !== programToDelete);
        setPrograms(updatedPrograms);
        setFilteredPrograms(updatedPrograms);
        localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        setMessage({ type: 'success', content: 'Program deleted successfully!' });
        setShowDeleteModal(false);
        setProgramToDelete(null);
      } else {
        const errorMessage = await response.json();
        setMessage({ type: 'error', content: errorMessage.error || 'Failed to delete program' });
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setProgramName('');
    setSelectedDepartment('');
    setEditing(false);
  };

  const applyFilters = () => {
    setIsFiltering(true);

    setTimeout(() => {
      let filtered = programs;

      // Filter by program name
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

  return (
    <div className="mx-auto p-6 bg-white fade-in">
      {/* Message display */}
      {message.content && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.content}
        </div>
      )}

      <div className="mx-auto p-4 bg-white mt-6">
        <h2 className="text-3xl font-bold text-center text-[#0065A8] pb-5 mb-4 fade-in delay-100">Programs</h2>
        <div className="mt-4 fade-in delay-200">
          <div className="flex items-center justify-center space-x-2 w-full">
            <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
              <input 
                type="text"
                value={programFilter}
                onChange={handleProgramFilterChange}
                placeholder="Search by Program Name"
                className="border-none focus:ring-0 outline-none w-full"
              />
            </div>
            <button 
              className={`bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition 
                ${SearchClicked ? "scale-90" : "scale-100"}`}
              onClick={() => {
                setSearchClicked(true);
                setTimeout(() => setSearchClicked(false), 300);
                applyFilters();}}
            >
              Search
            </button>
          </div>
        </div>

        {/* Table Container with 90% width */}
        <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[90%] mx-auto fade-in delay-300">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center table-fixed">
              <thead className="bg-[#057DCD] text-white sticky top-0 z-10">
                <tr className="border-b align-middle">
                  <th className="px-4 py-3">ID</th>
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
                // 🚀 Loading Skeleton with Pulse Animation
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b h-[50px] align-middle">
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                    </td>
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
                    const department = departments.find(
                      (dept) =>
                        dept.id === program.departmentID ||
                        dept.departmentID === program.departmentID
                    );
                    return (
                      <tr key={program.id} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                        <td className="px-4 py-3">{program.id}</td>
                        <td className="px-4 py-3">{program.programName}</td>
                        <td className="px-4 py-3">
                          {department ? (department.name || department.departmentName) : 'Unknown'}
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

        <div className="mt-6 mx-auto w-[50%] shadow-md rounded-lg p-1 bg-white">
          <div className="flex items-center justify-between space-x-4">
            <input 
              type="text" 
              placeholder="Program Name" 
              value={programName} 
              onChange={(e) => setProgramName(e.target.value)} 
              className="rounded-lg px-4 py-2 w-full outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
            />
            <select 
              value={selectedDepartment} 
              onChange={handleDepartmentChange} 
              className="rounded-lg py-2 w-[200px] focus:ring focus:ring-blue-300 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name || dept.departmentName}
                </option>
              ))}
            </select>
            <button 
              onClick={() => {
                setAddClicked(true);
                setTimeout(() => setAddClicked(false), 300);
                handleAddProgram();}}
              disabled={isAddLoading}
              className={`px-8 py-2 rounded-lg text-white shadow-md ${
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
                <span>{editing ? 'Update' : 'ADD'}</span>
              )}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditClicked(true);
                  setTimeout(() => setEditClicked(false), 300);
                  resetForm();}}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-md transition duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this program? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
              onClick={() => {
                setCancelClicked(true); 
                setTimeout(() => { setCancelClicked(false); setShowDeleteModal(false); 
                  setTimeout(() => setProgramToDelete(null), 
                  500);
                }, 200);
              }}
                disabled={isDeleteLoading}
                className={`px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors 
                  ${CancelClicked ? 'scale-90' : 'scale-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditClicked(true);
                  setTimeout(() => setEditClicked(false), 300);
                  confirmDelete();}}
                disabled={isDeleteLoading}
                className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors
                  ${DeleteClicked ? 'scale-90' : 'scale-100'}
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
