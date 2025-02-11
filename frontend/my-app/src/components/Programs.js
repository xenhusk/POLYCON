import React, { useEffect, useState } from 'react';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programName, setProgramName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    const response = await fetch('http://localhost:5001/program/get_programs');
    const data = await response.json();
    setPrograms(data || []);
    setFilteredPrograms(data || []);
  };

  const fetchDepartments = async () => {
    const response = await fetch('http://localhost:5001/program/get_departments');
    const deptData = await response.json();
    setDepartments(deptData.map(dept => ({ id: dept.id, name: dept.name || dept.departmentName })));  // Assuming your department objects have a 'name' or 'departmentName' field
};


  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    const filtered = programs.filter(prog => prog.departmentID === e.target.value);
    setFilteredPrograms(filtered);
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
      fetchPrograms();
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
      });

      if (response.ok) {
        alert('Program deleted successfully');
        setPrograms(programs.filter(program => program.id !== programId));
        setFilteredPrograms(filteredPrograms.filter(program => program.id !== programId));
      } else {
        alert('Failed to delete program');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const resetForm = () => {
    setProgramName('');
    setSelectedDepartment('');
    setEditing(false);
  };

  return (
    <div className="max-w-9xl mx-auto p-6 bg-white shadow-lg rounded-lg relative">
      <h1 className="text-2xl font-bold text-center">Programs</h1>
      <table className="min-w-full bg-white border border-gray-300 text-center mt-4">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Program Name</th>
            <th className="py-2 px-4 border-b">Department</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredPrograms) && filteredPrograms.map((program) => (
            <tr key={program.id} className="text-center">
              <td className="py-2 px-4 border-b">{program.id}</td>
              <td className="py-2 px-4 border-b">{program.programName}</td>
              <td className="py-2 px-4 border-b">{departments.find(dept => dept.id === program.departmentID)?.name || 'Unknown'}</td>
              <td className="py-2 px-4 border-b">
                <button onClick={() => handleEdit(program)} className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2">Edit</button>
                <button onClick={() => handleDelete(program.id)} className="bg-red-500 text-white px-2 py-1 rounded-lg">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <input 
          type="text" 
          placeholder="Program Name" 
          value={programName} 
          onChange={(e) => setProgramName(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-60" 
        />
        <select value={selectedDepartment} onChange={handleDepartmentChange} className="border border-gray-300 rounded-lg px-3 py-2 w-54 text-black">
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>  // Ensure you use 'dept.name'
          ))}
        </select>
        <button 
          onClick={handleAddProgram} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {editing ? 'UPDATE' : 'ADD'}
        </button>
      </div>
    </div>
  );
}
