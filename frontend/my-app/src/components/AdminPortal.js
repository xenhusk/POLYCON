import React, { useEffect, useState } from 'react';

export default function AdminPortal() {
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [userList, setUserList] = useState([]);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchAllUsers();
    fetchDepartments();
  }, []);

  const fetchAllUsers = async () => {
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

  const handleAddUser = async () => {
    // Send form data to backend for user creation
    const response = await fetch('http://localhost:5001/account/add_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNumber, firstName, lastName, email, role, department }),
    });

    if (response.ok) {
      alert('User added successfully');
      fetchAllUsers();
    } else {
      alert('Failed to add user');
    }
  };

  const handleEditClick = (user) => {
    setEditUser({ ...user });
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Admin Portal</h2>
      <div className="mb-4">
        <input
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
        />
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
        />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
        >
          <option value="">Select Role</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
        </select>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.departmentID} value={dept.departmentID}>
              {dept.departmentName}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddUser}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add User
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">All Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID Number</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Department</th>
              <th className="py-2 px-4 border-b">Controls</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((u) => (
              <tr key={u.ID}>
                <td className="py-2 px-4 border-b">{u.ID}</td>
                <td className="py-2 px-4 border-b">{u.firstName} {u.lastName}</td>
                <td className="py-2 px-4 border-b">{u.email}</td>
                <td className="py-2 px-4 border-b">{u.role}</td>
                <td className="py-2 px-4 border-b">{u.department}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEditClick(u)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.ID)}
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Edit User</h3>
          <input
            placeholder="ID Number"
            value={editUser.idNumber || editUser.ID}
            onChange={(e) => setEditUser({...editUser, idNumber: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          />
          <input
            placeholder="First Name"
            value={editUser.firstName}
            onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          />
          <input
            placeholder="Last Name"
            value={editUser.lastName}
            onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          />
          <input
            placeholder="Email"
            value={editUser.email}
            onChange={(e) => setEditUser({...editUser, email: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          />
          <select
            value={editUser.role}
            onChange={(e) => setEditUser({...editUser, role: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          >
            <option value="">Select Role</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={editUser.department}
            onChange={(e) => setEditUser({...editUser, department: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.departmentID} value={dept.departmentID}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateUser}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditUser(null)}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}