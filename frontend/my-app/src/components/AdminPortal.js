import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as EditIcon } from "./icons/Edit.svg";
import { ReactComponent as DeleteIcon } from "./icons/delete.svg";
import './transitions.css';  // Add this import

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
  const [modalClosing, setModalClosing] = useState(false);
  const [showStudentFields, setShowStudentFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Try to get data from cache first
      const cachedUsers = localStorage.getItem('users');
      const cachedDepartments = localStorage.getItem('departments');

      if (cachedUsers && cachedDepartments) {
        const usersData = JSON.parse(cachedUsers);
        const departmentsData = JSON.parse(cachedDepartments);

        setUserList(usersData);
        setDepartments(departmentsData);
      } else {
        // If no cache, fetch from server
        const [usersResponse, departmentsResponse] = await Promise.all([
          fetch('http://localhost:5001/account/get_all_users'),
          fetch('http://localhost:5001/account/departments')
        ]);

        const usersData = await usersResponse.json();
        const departmentsData = await departmentsResponse.json();

        setUserList(Array.isArray(usersData) ? usersData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

        // Cache the fetched data
        localStorage.setItem('users', JSON.stringify(usersData));
        localStorage.setItem('departments', JSON.stringify(departmentsData));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setUserList([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/account/get_all_users');
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserList(data);
        localStorage.setItem('users', JSON.stringify(data));
      } else {
        setUserList([]);
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
      localStorage.setItem('departments', JSON.stringify(data));
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
    setIsEditLoading(false);
    try {
        let departmentId = '';
        if (user.department && typeof user.department === 'string') {
            if (user.department.includes('departments/')) {
                departmentId = user.department.split('/')[1];
            } else {
                const matchingDept = departments.find(dept => dept.departmentName === user.department);
                departmentId = matchingDept ? matchingDept.departmentID : '';
            }
        }

        setEditUser({
            idNumber: user.ID,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            department: departmentId,
            program: user.program || '',
            sex: user.sex || '',
            yearSection: user.year_section || ''
        });

        if (user.role === 'student' && departmentId) {
            await fetchPrograms(departmentId);
        }
    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        setIsEditLoading(false);
        setModalClosing(false);
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
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/account/delete_user?idNumber=${idNumber}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('User archived successfully');
        fetchAllUsers();
      } else {
        alert('Failed to archive user');
      }
    } catch (error) {
      console.error('Error archiving user:', error);
    } finally {
      setIsDeleteLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    
    if (selectedRole === "student") {
      setShowStudentFields(true);
    } else {
      setShowStudentFields(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 items-center fade-in">
      <header className="w-full max-w-[95%] bg-white mt-10 rounded-br-[0.8rem] rounded-bl-[0.8rem] flex justify-center items-center mb-2 fade-in delay-100">
        <h2 className="text-3xl font-bold text-center pb-5 text-[#005B98]">Manage Users</h2>
      </header>

      <div className="flex justify-center items-start mb-2 mt-8 h-[60vh] fade-in delay-200">
        <div className="w-[90%] max-h-[65vh] overflow-hidden rounded-lg shadow-lg bg-white">
          <div className="overflow-x-auto">
            <div className="relative">
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

              <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="py-2 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-20 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-28 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-40 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6 pl-10">
                            <div className="flex justify-center h-[7vh]items-center">
                              <div className="h-5 w-20 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-2 px-6 pl-10">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-28 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-2 pl-6">
                            <div className="flex justify-center h-[7vh] items-center space-x-3">
                              <div className="h-6 w-6 bg-gray-300 rounded"></div>
                              <div className="h-6 w-6 bg-gray-300 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      userList.map((u) => (
                        <tr key={u.ID} className="border-b hover:bg-[#DBF1FF] transition-all duration-100 ease-in-out">
                          <td className="py-2 px-6 overflow-hidden text-center">{u.ID}</td>
                          <td className="py-2 px-6 overflow-hidden text-center">{u.firstName} {u.lastName}</td>
                          <td className="py-2 px-6 overflow-hidden text-center">{u.email}</td>
                          <td className="py-2 px-6 pl-10 overflow-hidden text-center">{u.role}</td>
                          <td className="py-2 px-6 pl-10 overflow-hidden text-center">{u.department}</td>
                          <td className="py-2 pl-6 overflow-hidden text-center">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                className={`text-gray-500 hover:text-gray-700 ${
                                  EditClicked ? "scale-90" : "scale-100"}`}
                                onClick={() => {
                                  setEditClicked(true);
                                  setTimeout(() => setEditClicked(false), 300);
                                  handleEditClick(u);}}>
                                <EditIcon className="w-5 h-5" />
                              </button>
                              <button
                                className={`text-gray-500 hover:text-gray-700 ${
                                  DeleteClicked ? "scale-90" : "scale-100"}`}
                                onClick={() => {
                                  setDeleteClicked(true);
                                  setTimeout(() => {
                                    setDeleteClicked(false);
                                    setUserToDelete(u.ID);
                                    setShowDeleteModal(true);
                                  }, 300);
                                }}>
                                <DeleteIcon className="w-5 h-5" />
                              </button>
                            </div>
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }, 300);
                }}
                disabled={isDeleteLoading}
                className={`px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors ${CancelClicked ? "scale-90" : "scale-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteClicked(true);
                  setTimeout(() => {
                    setDeleteClicked(false);
                    handleDeleteUser(userToDelete);
                  }, 300);
                }}
                disabled={isDeleteLoading}
                className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors ${DeleteClicked ? "scale-90" : "scale-100"} ${isDeleteLoading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center space-x-2`}
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

      <div className="flex justify-center items-center fade-in delay-300">
        <div className="w-[90%] h-[10vh]">
          <div className="flex flex-row bg-white shadow-md p-1 rounded-lg justify-between items-center">
            <input
              placeholder="ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-[12%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
            />
            <input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[12%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
            />
            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[12%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[20%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
            />
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-[12%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
            >
              <option value="">Select Role</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-[13%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentID} value={dept.departmentID}>
                  {dept.departmentName}
                </option>
              ))}
            </select>

            <div className={`flex p-0 w-auto justify-center transition-all duration-500 ease-in-out transform ${
                showStudentFields ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}>
              {role === 'student' && department && (
                <>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-[40%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1" 
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
                  className="w-[40%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  placeholder="Year & Section"
                  value={yearSection}
                  onChange={(e) => setYearSection(e.target.value)}
                  className="w-[40%] bg-transparent border-2 border-white outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 rounded-lg px-2 py-2 m-1"
                />
                </>
              )}
            </div>
            <button
              className={`bg-[#057DCD] text-white w-[12%] px-2 py-2 m-1 text-lg rounded-lg transition-all duration-100 ease-in delay-50 hover:bg-blue-600 hover:text-white 
                ${AddClicked ? "scale-90" : "scale-100"}`}
              onClick={() =>{ setAddClicked(true); setTimeout(() => setAddClicked(false), 300); handleAddUser(); }}>
              ADD USER
            </button>
          </div>
        </div>
      </div>

      {editUser && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
            modalClosing ? "opacity-0" : "opacity-100"
          }`}>

            <div className='bg-[#0065A8] w-[85%] md:w-[50%] px-6 py-4 flex relative items-center top-0 right-0 left-0 rounded-t-lg'>
                <h3 className="text-xl font-semibold text-white">Edit User</h3>
            </div>

          <div
            className={`bg-white w-[85%] md:w-[50%] h-[70vh] p-6 rounded-br-lg rounded-bl-lg shadow-lg relative overflow-y-auto transform transition-all duration-500
            }`}>

            <div className='p-4'>
              <label htmlFor="IdNumber" className='block text-sm font-medium text-gray-700 mb-1'> ID Number</label>
              <input
                id="IdNumber"
                placeholder="ID Number"
                value={editUser.idNumber || editUser.ID}
                onChange={(e) => setEditUser({ ...editUser, idNumber: e.target.value })}
                className="w-full h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
              />

              <label htmlFor="FirstName" className='block text-sm font-medium text-gray-700 mb-1'> First Name</label>
              <input
                id="FirstName" placeholder=" "
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
              />

              <label htmlFor="LastName" className='block text-sm font-medium text-gray-700 mb-1'> Last Name</label>
              <input
                id="LastName" placeholder=" "
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
              />

              <label htmlFor="Email" className='block text-sm font-medium text-gray-700 mb-1'> Email</label>
              <input
                id="Email"
                placeholder="Email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
              />

              <label htmlFor="Role" className='block text-sm font-medium text-gray-700 mb-1'> Role</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-2 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
              >
                <option value="">Select Role</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>

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
                className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
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
                  <label htmlFor="Program" className='block text-sm font-medium text-gray-700 mb-1'> Program</label>
                  <select
                    value={editUser.program}
                    onChange={(e) => setEditUser({ ...editUser, program: e.target.value })}
                    className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.programID} value={prog.programID}>
                        {prog.programName}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="Sex" className='block text-sm font-medium text-gray-700 mb-1'> Gender</label>
                  <select
                    value={editUser.sex}
                    onChange={(e) => setEditUser({ ...editUser, sex: e.target.value })}
                    className="w-full min-h-[45px] items-center mb-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  <label htmlFor="YearSection" className='block text-sm font-medium text-gray-700 mb-1'> Year & Section</label>
                  <input
                    placeholder="Year & Section"
                    value={editUser.yearSection || editUser.year_section}
                    onChange={(e) => setEditUser({ ...editUser, yearSection: e.target.value })}
                    className="w-full min-h-[45px] items-center mb-2 gap-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:border-[#0065A8] peer appearance-none"
                  />
                </>
              )}
              <div className="py-2 flex justify-end space-x-4 bg-white rounded-b-lg">
                <button
                  className={`bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors
                    ${ SaveClicked ? "scale-90" : "scale-100"}
                    ${isEditLoading ? "opacity-50 cursor-not-allowed" : ""} 
                  `}
                  disabled={isEditLoading}
                  onClick={() => {
                    setSaveClicked(true); setTimeout(() => {setSaveClicked(false); setModalClosing(true); setTimeout(() => {handleUpdateUser(); setEditUser(null);
                      }, 500);
                    }, 200);
                  }}>
                  {isEditLoading ? (
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
                    <span>Saving...</span>
                      </>
                    ) : (
                    <span>Save Changes</span>
                  )}
                </button>

                <button
                  className={`bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors
                     ${ CancelClicked ? "scale-90" : "scale-100"
                  }`}
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
        </div>
      )}
    </div>
  );
}