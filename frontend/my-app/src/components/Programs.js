import React, { useEffect, useState } from 'react';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programName, setProgramName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [editing, setEditing] = useState(false);
  const [programFilter, setProgramFilter] = useState(''); // Program filter input

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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
        setDepartments(departmentsData.map(dept => ({ id: dept.id, name: dept.name || dept.departmentName })));

        localStorage.setItem('programs', JSON.stringify(programsData));
        localStorage.setItem('departments', JSON.stringify(departmentsData));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
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
      alert('All fields are required');
      return;
    }

    // Generate new program ID
    const newProgramID = `P${String(programs.length + 1).padStart(2, '0')}`;

    const response = await fetch('http://localhost:5001/program/add_program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newProgramID, programName, departmentID: selectedDepartment })
    });

    if (response.ok) {
      alert('Program added successfully');
      const newProgram = { id: newProgramID, programName, departmentID: selectedDepartment };
      const updatedPrograms = [...programs, newProgram];
      setPrograms(updatedPrograms);
      setFilteredPrograms(updatedPrograms);
      localStorage.setItem('programs', JSON.stringify(updatedPrograms));
      resetForm();
    } else {
      alert('Failed to add program');
    }
  };

  const handleEdit = program => {
    setProgramName(program.programName);
    setSelectedDepartment(program.departmentID);
    setEditing(true);
  };

  const handleDelete = async (programId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this program?");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`http://localhost:5001/program/delete_program/${programId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        alert('Program deleted successfully');
        setPrograms(programs.filter(program => program.id !== programId));
        setFilteredPrograms(filteredPrograms.filter(program => program.id !== programId));
        localStorage.setItem('programs', JSON.stringify(programs.filter(program => program.id !== programId)));
      } else {
        const errorMessage = await response.json();
        alert(`Failed to delete program: ${errorMessage.error}`);
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('An error occurred while deleting the program.');
    }
  };

  const resetForm = () => {
    setProgramName('');
    setSelectedDepartment('');
    setEditing(false);
  };

  const applyFilters = () => {
    let filtered = programs;

    // Filter by program name
    if (programFilter) {
      filtered = filtered.filter((program) =>
        program.programName.toLowerCase().includes(programFilter.toLowerCase())
      );
    }

    setFilteredPrograms(filtered);
  };

  const handleProgramFilterChange = (e) => {
    const input = e.target.value;
    setProgramFilter(input);
    applyFilters();
  };

  return (
    <div className="max-w-9xl mx-auto p-6 bg-white">
      <div className="max-w-9xl mx-auto p-4 bg-white mt-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Programs</h2>
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2 w-full">
            <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
              <input 
                type="text"
                value={programFilter}
                onChange={handleProgramFilterChange}
                placeholder="Search by Program Name"
                className="border-none focus:ring-0 outline-none w-[100%]"
              />
            </div>
            <button 
              onClick={applyFilters} 
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-4 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-center">
              <thead className="bg-[#057DCD] text-white">
                <tr className="border-b">
                  <th className="px-4 py-3 w-[150px] min-w-[120px]">ID</th>
                  <th className="px-4 py-3 w-[200px] min-w-[180px]">Program Name</th>
                  <th className="px-4 py-3 w-[200px] min-w-[180px]">Department</th>
                  <th className="px-4 py-3 pr-4 text-center">Actions</th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="max-h-80 overflow-y-scroll">
            <table className="w-full bg-white text-center">
              <tbody>
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => {
                    const department = departments.find(dept => dept.id === program.departmentID || dept.departmentID === program.departmentID);
                    return (
                      <tr key={program.id} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                        <td className="px-4 py-3 w-[150px] min-w-[120px]">{program.id}</td>
                        <td className="px-4 py-3 w-[200px] min-w-[180px]">{program.programName}</td>
                        <td className="px-4 py-3 w-[200px] min-w-[180px]">{department ? department.name || department.departmentName : 'Unknown'}</td>
                        <td className="px-4 py-3 flex justify-center space-x-3 align-middle">
                          <button onClick={() => handleEdit(program)} className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(program.id)} className="text-gray-500 hover:text-gray-700">
                            <DeleteIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No programs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 mr-20 ml-20 shadow-md rounded-lg p-2 bg-white">
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
                <option key={dept.id} value={dept.id}>{dept.name || dept.departmentName}</option>
              ))}
            </select>
            <button 
              onClick={handleAddProgram} 
              className={`px-4 py-2 rounded-lg text-white shadow-md ${editing ? 'bg-yellow-500' : 'bg-blue-500 hover:bg-blue-600 transition duration-300'}`}
            >
              {editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button 
                onClick={resetForm} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-md transition duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
