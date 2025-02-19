import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPortal() {
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
  const [AddClicked, setAddClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);
  const [SaveClicked, setSaveClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [CloseClicked, setCloseClicked] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [showStudentFields, setShowStudentFields] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (department && role === 'student') {
      fetchPrograms(department);
    } else {
      setPrograms([]);
    }
  }, [department, role]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/account/get_all_users');
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserList(data);
      } else {
        setUserList([]);
        console.error('Unexpected response format:', data);
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
      const response = await fetch('http://localhost:5001/account/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPrograms = async (departmentID) => {
    try {
      const response = await fetch(`http://localhost:5001/account/programs?departmentID=${departmentID}`);
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleAddUser = async () => {
    const password = role === 'student' ? `student${idNumber}` : `faculty${idNumber}`;

    const userData = {
      idNumber,
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      ...(role === 'student' && { program, sex, year_section: yearSection })
    };

    try {
      const response = await fetch('http://localhost:5001/account/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${data.message} Verification email sent to the user.`);
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
      } else {
        alert(data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleEditClick = async (user) => {
    setModalClosing(false);
    setEditUser({
      idNumber: user.ID,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      program: user.program || '',
      sex: user.sex || '',
      yearSection: user.year_section || ''
    });

    if (user.role === 'student' && user.department) {
      await fetchPrograms(user.department);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch('http://localhost:5001/account/update_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });
      if (response.ok) {
        alert('User updated successfully');
        setEditUser(null);
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
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (idNumber) => {
    try {
      const response = await fetch(`http://localhost:5001/account/delete_user?idNumber=${idNumber}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('User deleted successfully');
        fetchAllUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    
    // Animate when "student" is selected
    if (selectedRole === "student") {
      setShowStudentFields(true);
    } else {
      setShowStudentFields(false);
    }
  };

  return (
    <div className="w-full min-h-screen items-center">
      <header className="w-full max-w-[95%] bg-white rounded-br-[0.8rem] rounded-bl-[0.8rem] flex justify-center items-center mb-2">
        <h2 className="text-2xl font-bold text-center py-8 text-[#005B98]">Manage Users</h2>
      </header>

      <div className="flex justify-center items-start mb-3 h-[65vh]">
        <div className="w-[90%] max-h-[65vh] overflow-hidden rounded-lg shadow-lg bg-white">
          <div className="overflow-x-auto">
            <div className="relative">
              {/* Table wrapper to control scrolling */}
              <table className="w-full table-fixed items-center justify-center">
                <thead className="sticky top-0 bg-[#057DCD] text-white shadow-md z-10 mr-2">
                  <tr>
                    <th className="py-3 px-6 overflow-hidden border-b">ID Number</th>
                    <th className="py-3 px-6 overflow-hidden border-b">Name</th>
                    <th className="py-3 px-6 overflow-hidden border-b">Email</th>
                    <th className="py-3 px-6 overflow-hidden border-b">Role</th>
                    <th className="py-3 px-6 overflow-hidden border-b">Department</th>
                    <th className="py-3 px-6 overflow-hidden border-b">Controls</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable tbody */}
              <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <tbody>
                    {loading ? (
                      // 🚀 Show skeleton loader when loading
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="py-2 px-6 text-center">
                            <div className="flex justify-center h-[8vh] items-center">
                              <div className="h-5 w-20 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6 text-center">
                            <div className="flex justify-center h-[8vh] items-center">
                              <div className="h-5 w-28 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6 text-center">
                            <div className="flex justify-center items-center">
                              <div className="h-5 w-40 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6 pl-10 text-center">
                            <div className="flex justify-center items-center">
                              <div className="h-5 w-20 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6 pl-10 text-center">
                            <div className="flex justify-center items-center">
                              <div className="h-5 w-28 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="py-2 pl-6 text-center">
                            <div className="flex justify-center items-center space-x-2">
                              <div className="h-8 w-16 bg-gray-300 rounded"></div>
                              <div className="h-8 w-16 bg-gray-300 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // 🚀 Show actual data when loaded
                      userList.map((u) => (
                        <tr key={u.ID} className="border-b hover:bg-[#DBF1FF] transition-all duration-100 ease-in-out">
                          <td className="py-2 px-6 overflow-hidden text-center">{u.ID}</td>
                          <td className="py-2 px-6 overflow-hidden text-center">{u.firstName} {u.lastName}</td>
                          <td className="py-2 px-6 overflow-hidden text-center">{u.email}</td>
                          <td className="py-2 px-6 pl-10 overflow-hidden text-center">{u.role}</td>
                          <td className="py-2 px-6 pl-10 overflow-hidden text-center">{u.department}</td>
                          <td className="py-2 pl-6 overflow-hidden text-center">
                            <button className="bg-[#FFC107] text-black px-2 py-2 m-1 text-sm rounded-lg hover:bg-[#FFA000]">
                              Edit
                            </button>
                            <button className="bg-[#E53935] text-white px-2 py-2 m-1 text-sm rounded-lg hover:bg-[#D32F2F]">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mb-2">
        <div className="w-[90%] h-[10vh]">
          <div className="flex flex-row bg-white shadow-md p-1 rounded-lg justify-between items-center">
            <input
              placeholder="ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-[12%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
            />
            <input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[12%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
            />
            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[12%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[20%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
            />
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-[12%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
            >
              <option value="">Select Role</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-[13%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentID} value={dept.departmentID}>
                  {dept.departmentName}
                </option>
              ))}
            </select>

            {/* Store Student Fields */}
            <div className={`flex p-0 w-auto justify-center transition-all duration-500 ease-in-out transform ${
                showStudentFields ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}>
              {role === 'student' && department && (
                <>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-[40%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1" 
                >
                  <option value="">Select Program</option>
                  {programs.map((prog) => (
                    <option key={prog.programID} value={prog.programID}>
                      {prog.programName}
                    </option>
                  ))}
                </select>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-[40%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  placeholder="Year & Section"
                  value={yearSection}
                  onChange={(e) => setYearSection(e.target.value)}
                  className="w-[40%] bg-transparent border-2 border-white appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#54BEFF] peer rounded-lg px-2 py-2 m-1"
                />
                </>
              )}
            </div>
            <button
              className={`bg-[#057DCD] text-white w-[12%] px-2 py-2 m-1 text-lg rounded-lg transition-all duration-100 ease-in delay-50 hover:bg-[#54BEFF] hover:text-white 
                ${AddClicked ? "scale-90" : "scale-100"}`}
              onClick={() =>{ setAddClicked(true); setTimeout(() => setAddClicked(false), 300); handleAddUser(); }}>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${
            modalClosing ? "opacity-0" : "opacity-100"
          }`}>

          <div
            className={`bg-white w-[85%] md:w-[40%] h-[70vh] p-6 rounded-lg shadow-lg relative overflow-y-auto transform transition-all duration-500 ${
              modalClosing ? "scale-90 opacity-0" : "scale-100 opacity-100"
            }`}>

            {/* Modal Title */}
            <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Edit User</h3>

            {/* Close Button (Now Animates Before Closing) */}
            <button
              className={`text-gray-600 top-3 right-3 sticky transition-all duration-200 ease-in-out hover:text-gray-900 ${
                CloseClicked ? "scale-90" : "scale-100"
              }`}
              // Close Modal & Delay Edit User State Reset
              onClick={() => {
                setCloseClicked(true);
                setTimeout(() => {
                  setCloseClicked(false);
                  setModalClosing(true);
                  setTimeout(() => setEditUser(null), 500); 
                }, 200);
              }}>
              ✖
            </button>

            {/* Edit User Form */}
            <label htmlFor="IdNumber" className='block text-sm font-medium text-gray-700 mb-1'> ID Number</label>
            <input
              id="IdNumber"
              placeholder="ID Number"
              value={editUser.idNumber || editUser.ID}
              onChange={(e) => setEditUser({ ...editUser, idNumber: e.target.value })}
              className="w-full h-[45px] items-center border-2 border-[#0065A8] rounded-lg mb-1 px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF] appearance-none"
            />

            <label htmlFor="FirstName" className='block text-sm font-medium text-gray-700 mb-1'> First Name</label>
            <input
              id="FirstName" placeholder=" "
              value={editUser.firstName}
              onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
              className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
            />

            <label htmlFor="LastName" className='block text-sm font-medium text-gray-700 mb-1'> Last Name</label>
            <input
              id="LastName" placeholder=" "
              value={editUser.lastName}
              onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
              className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
            />

            <label htmlFor="Email" className='block text-sm font-medium text-gray-700 mb-1'> Email</label>
            <input
              id="Email"
              placeholder="Email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
            />

            {/* Role Selection */}

            <label htmlFor="Role" className='block text-sm font-medium text-gray-700 mb-1'> Role</label>
            <select
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
            >
              <option value="">Select Role</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            {/* Department Selection */}
            <label htmlFor="Department" className='block text-sm font-medium text-gray-700 mb-1'> Department</label>
            <select
              value={editUser.department}
              onChange={async (e) => {
                const newDepartment = e.target.value;
                setEditUser({ ...editUser, department: newDepartment });
                if (editUser.role === "student") {
                  await fetchPrograms(newDepartment);
                }
              }}
              className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentID} value={dept.departmentID}>
                  {dept.departmentName}
                </option>
              ))}
            </select>

            {editUser.role === "student" && editUser.department && (
              <>
                {/* Program Selection (Visible only for Students) */}
                <label htmlFor="Program" className='block text-sm font-medium text-gray-700 mb-1'> Program</label>
                <select
                  value={editUser.program}
                  onChange={(e) => setEditUser({ ...editUser, program: e.target.value })}
                  className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
                >
                  <option value="">Select Program</option>
                  {programs.map((prog) => (
                    <option key={prog.programID} value={prog.programID}>
                      {prog.programName}
                    </option>
                  ))}
                </select>

                {/* Gender Selection */}
                <label htmlFor="Sex" className='block text-sm font-medium text-gray-700 mb-1'> Gender</label>
                <select
                  value={editUser.sex}
                  onChange={(e) => setEditUser({ ...editUser, sex: e.target.value })}
                  className="w-full min-h-[45px] flex flex-wrap items-center mb-1 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                {/* Year & Section Input */}
                <label htmlFor="YearSection" className='block text-sm font-medium text-gray-700 mb-1'> Year & Section</label>
                <input
                  placeholder="Year & Section"
                  value={editUser.yearSection || editUser.year_section}
                  onChange={(e) => setEditUser({ ...editUser, yearSection: e.target.value })}
                  className="w-full min-h-[45px] flex flex-wrap items-center mb-1 gap-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]"
                />
              </>
            )}
            {/* Buttons */}
            <div className="flex space-x-2">
              <button
                className={`bg-[#05cd76] text-white w-full px-2 py-2 mt-1 text-lg rounded-lg transition-all duration-200 ease-in-out hover:bg-[#30e08e] hover:text-white 
                  ${ SaveClicked ? "scale-90" : "scale-100"
                }`}
                // Save User & Delay Edit User State Reset
                onClick={() => {
                  setSaveClicked(true); setTimeout(() => {setSaveClicked(false); setModalClosing(true); setTimeout(() => {handleUpdateUser(); setEditUser(null);
                    }, 500);
                  }, 200);
                }}>
                Save
              </button>

              <button
                className={`bg-[#6b6b6b] text-black w-full px-2 py-2 mt-1 text-lg rounded-lg transition-all duration-200 ease-in-out hover:bg-[#8c8c8c] hover:text-black ${
                  CancelClicked ? "scale-90" : "scale-100"
                }`}
                // Cancel Edit & Delay Edit User State Reset
                onClick={() => {
                  setCancelClicked(true); setTimeout(() => { setCancelClicked(false); setModalClosing(true); setTimeout(() => setEditUser(null), 
                    500);
                  }, 200);
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}