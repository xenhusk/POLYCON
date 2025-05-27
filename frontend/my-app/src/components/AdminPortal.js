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
  const [showAddModal, setShowAddModal] = useState(false);

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
    // Use the same payload as Signup, but set password to default
    const userData = {
      idNumber,
      firstName,
      lastName,
      email,
      password: 'password123', // Default password for new users
      role: role || 'student',
      department: department || undefined,
      program: program || undefined,
      sex: sex || undefined,
      year_section: yearSection || undefined,
    };

    // Remove empty/undefined fields
    Object.keys(userData).forEach(key => (userData[key] === undefined || userData[key] === '') && delete userData[key]);

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
        // Find the department ID based on department name
        let departmentId = null;
        if (user.department && departments.length > 0) {
            const deptObj = departments.find(d => d.name === user.department);
            if (deptObj) {
                departmentId = deptObj.id;
            }
        }

        setEditUser({
            id: user.ID,
            id_number: user.idNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            department: departmentId, // Use the numeric ID
            program: user.programID || user.program || '',
            sex: user.sex || '',
            yearSection: user.year_section || ''
        });

        // Fetch programs if department is set
        if (departmentId) {
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
    const updateData = {
      id: editUser.id,
      id_number: editUser.id_number,
      firstName: editUser.firstName,
      lastName: editUser.lastName,
      email: editUser.email,
      role: editUser.role,
      department: editUser.department, // This will now be the numeric ID
      program: editUser.program,
      sex: editUser.sex,
      year_section: editUser.yearSection
    };

    try {
      const response = await fetch('http://localhost:5001/account/update_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        alert('User updated successfully');
        setEditUser(null);
        fetchAllUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/account/delete_user?id=${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the archived user from the table immediately
        setUserList(prevList => prevList.filter(user => user.ID !== userId));
        alert('User archived successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to archive user');
      }
    } catch (error) {
      console.error('Error archiving user:', error);
      alert('Error archiving user. Please try again.');
    } finally {
      setIsDeleteLoading(false);
      setShowDeleteModal(false);
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

  // When department changes in Add User modal, fetch programs just like Signup
  useEffect(() => {
    if (department) {
      fetchPrograms(department);
      setProgram(""); // Reset program when department changes
    } else {
      setPrograms([]);
      setProgram("");
    }
  }, [department]);

  return (
    <div className="w-full min-h-screen p-6 items-center fade-in">
      <header className="w-full bg-white mt-10 flex justify-center  items-center mb-2 fade-in delay-100">
        <h2 className="text-3xl items-center font-bold text-center pb-5 text-[#005B98]">Manage Users</h2>
      </header>      
      <div className="flex justify-center items-start mb-2 h-[60vh] fade-in delay-200">
        <div className="w-[90%]">
          <div className="max-h-[65vh]">
            <div className="w-full flex justify-center mb-4 mt-4 ">
              <button
                className="px-6 py-2 bg-[#057DCD] text-white rounded-lg hover:bg-[#54BEFF] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                onClick={() => setShowAddModal(true)}
              >
                Add User
              </button>
            </div>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <div className="relative">
                <table className="w-full table-fixed">
                  <thead className="bg-[#057DCD] text-white">
                    <tr>
                      <th className="py-4 px-6 font-poppins text-base font-semibold tracking-wider text-center">ID Number</th>
                      <th className="py-4 px-6 font-poppins text-base font-semibold tracking-wider text-center">Name</th>
                      <th className="py-4 px-6 font-poppins text-base font-semibold tracking-wider text-center">Email</th>
                      <th className="py-4 px-6 font-poppins text-base font-semibold tracking-wider text-center">Role</th>
                      <th className="py-4 px-6 font-poppins text-base font-semibold tracking-wider text-center">Department</th>
                      <th className="py-4 px-6 font-poppins text-base font-semibold tracking-wider text-center">Controls</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full table-fixed">
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse bg-white">
                          <td className="py-4 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-20 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-28 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-40 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center h-[7vh] items-center ">
                              <div className="h-5 w-20 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center h-[7vh] items-center">
                              <div className="h-5 w-28 bg-gray-200 rounded mx-auto"></div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center h-[7vh] items-center space-x-3">
                              <div className="h-6 w-6 bg-gray-300 rounded"></div>
                              <div className="h-6 w-6 bg-gray-300 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      userList.map((u) => { 
                        let departmentDisplay = u.department;
                        if (departmentDisplay && departments.length > 0) {
                          let deptObj = departments.find(d => 
                            d.id === u.department ||
                            d.name === u.department ||
                            d.departmentID === u.department ||
                            d.departmentName === u.department
                          );
                          if (deptObj) {
                            departmentDisplay = deptObj.name || deptObj.departmentName;
                          }
                        }
                        return (
                          <tr key={u.ID} className="border-b bg-white hover:bg-[#DBF1FF] transition-all duration-200">
                            <td className="py-4 px-6 font-poppins text-base text-black text-center">{u.idNumber}</td>
                            <td className="py-4 px-6 font-poppins text-base text-black text-center">{u.firstName} {u.lastName}</td>
                            <td className="py-4 px-6 font-poppins text-base text-black text-center overflow-hidden">{u.email}</td>
                            <td className="py-4 px-6 font-poppins text-base text-black text-center capitalize">{u.role}</td>
                            <td className="py-4 px-6 font-poppins text-base text-black text-center">{departmentDisplay}</td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center space-x-4">
                                <button
                                  className={`text-blue-600 hover:text-blue-800 transition-all duration-200 ${
                                    EditClicked ? "scale-90" : "scale-100"
                                  }`}
                                  onClick={() => {
                                    setEditClicked(true);
                                    setTimeout(() => setEditClicked(false), 300);
                                    handleEditClick(u);
                                  }}
                                >
                                  <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                  className={`text-red-600 hover:text-red-800 transition-all duration-200 ${
                                    DeleteClicked ? "scale-90" : "scale-100"
                                  }`}
                                  onClick={() => {
                                    setDeleteClicked(true);
                                    setTimeout(() => {
                                      setDeleteClicked(false);
                                      setUserToDelete(u.ID);
                                      setShowDeleteModal(true);
                                    }, 300);
                                  }}
                                >
                                  <DeleteIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
              Are you sure you want to delete this user? You can restore them later if needed.
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
                    <span>Archiving...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[40rem] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#0065A8] p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Add New User</h3>
              <button
                onClick={() => {
                  setModalClosing(true);
                  setTimeout(() => {
                    setShowAddModal(false);
                    setModalClosing(false);
                  }, 300);
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

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Role</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={department}
                  onChange={async (e) => {
                    setDepartment(e.target.value);
                    setProgram("");
                    await fetchPrograms(e.target.value);
                  }}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              {/* Program (show if department is selected and role is student) */}
              {role === 'student' && department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.programID} value={prog.programID}>{prog.programName}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Sex (show if role is student) */}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              )}
              {/* Year & Section (show if role is student) */}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year & Section</label>
                  <input
                    type="text"
                    placeholder='e.g. 1A'
                    value={yearSection}
                    onChange={(e) => setYearSection(e.target.value)}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  />
                </div>
              )}
            </div>

            <div className="px-8 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <button
                className={`bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors ${
                  AddClicked ? "scale-90" : "scale-100"
                }`}
                onClick={() => {
                  setAddClicked(true);
                  setTimeout(() => {
                    setAddClicked(false);
                    handleAddUser();
                    setShowAddModal(false);
                  }, 300);
                }}
              >
                Add User
              </button>
              <button
                className={`bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors ${
                  CancelClicked ? "scale-90" : "scale-100"
                }`}
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setShowAddModal(false);
                  }, 300);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}      {editUser && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${
            modalClosing ? "opacity-0" : "opacity-100"
          }`}>
          <div className="bg-white rounded-xl shadow-2xl w-[40rem] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#0065A8] p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Edit User</h3>
              <button
                onClick={() => {
                  setModalClosing(true);
                  setTimeout(() => {
                    setEditUser(null);
                    setModalClosing(false);
                  }, 300);
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

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={editUser.id_number}
                  onChange={(e) => setEditUser({ ...editUser, id_number: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={editUser.department || ''}
                  onChange={async (e) => {
                    const newDepartment = e.target.value;
                    setEditUser({ ...editUser, department: newDepartment, program: '' });
                    if (newDepartment) {
                        await fetchPrograms(newDepartment);
                    }
                  }}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Program (only show for students) */}
              {editUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={editUser.program}
                    onChange={(e) => setEditUser({ ...editUser, program: e.target.value })}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.programID} value={prog.programID}>
                        {prog.programName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Gender (only show for students) */}
              {editUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={editUser.sex}
                    onChange={(e) => setEditUser({ ...editUser, sex: e.target.value })}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              )}
              {/* Year and Section (only show for students) */}
              {editUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year & Section</label>
                  <input
                    type="text"
                    value={editUser.yearSection}
                    onChange={(e) => setEditUser({ ...editUser, yearSection: e.target.value })}
                    placeholder="e.g. 4A"
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  />
                </div>
              )}
            </div>

            <div className="px-8 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <button
                className={`bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors ${
                  SaveClicked ? "scale-90" : "scale-100"
                } ${isEditLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isEditLoading}
                onClick={() => {
                  setSaveClicked(true);
                  setTimeout(() => {
                    setSaveClicked(false);
                    setModalClosing(true);
                    setTimeout(() => {
                      handleUpdateUser();
                      setEditUser(null);
                    }, 500);
                  }, 200);
                }}
              >
                {isEditLoading ? (
                  <div className="flex items-center space-x-2">
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
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors ${
                  CancelClicked ? "scale-90" : "scale-100"
                }`}
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setModalClosing(true);
                    setTimeout(() => setEditUser(null), 500);
                  }, 200);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}