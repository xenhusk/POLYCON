import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Signup = () => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [formData, setFormData] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    birthday: '',
    program: '',
    sex: '',
    year_section: '',
    department: '',
    role: 'student'  // Default role set to student
  });

  useEffect(() => {
    if (formData.department) {
      setFilteredPrograms([]);
    }
    // Fetch available departments from the backend
    const fetchDepartments = async () => {
      try {
        const departmentsRes = await fetch('http://localhost:5001/account/departments');
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [formData.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      ...(name === 'department' ? { program: '' } : {}),  // Reset program selection if department changes
    }));
  
    if (name === 'department') {
      fetchPrograms(value);
    }
  };
  
  const fetchPrograms = async (departmentID) => {
    try {
      const programsRes = await fetch(`http://localhost:5001/account/programs?departmentID=${departmentID}`);
      const programsData = await programsRes.json();
      setFilteredPrograms(programsData);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };
  

  const handleNext = () => {
    setStep(step + 1);
  };

  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5001/account/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            navigate('/login');  // Redirect to login page after successful signup
        } else {
            alert('Signup failed. Please try again.');
        }
    } catch (error) {
        alert('Something went wrong!');
    }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        {step === 1 ? (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Registration Form</h2>
            <input className="w-full p-2 mb-3 border rounded" type="text" name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} required />
            <input className="w-full p-2 mb-3 border rounded" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input className="w-full p-2 mb-3 border rounded" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            <input className="w-full p-2 mb-3 border rounded" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input className="w-full p-2 mb-3 border rounded" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={handleNext}>Next</button>
            <p>Already have an account? <a href="/">Login</a></p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Personal Information</h2>
            <input className="w-full p-2 mb-3 border rounded" type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
            <input className="w-full p-2 mb-3 border rounded" type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input className="w-full p-2 mb-3 border rounded" type="date" name="birthday" value={formData.birthday} onChange={handleChange} required />
            <select className="w-full p-2 mb-3 border rounded" name="department" value={formData.department} onChange={handleChange} required>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentID} value={dept.departmentID}>{dept.departmentName}</option>
              ))}
            </select>
            {formData.department && (
              <select
              className="w-full p-2 mb-3 border rounded"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              disabled={!formData.department}
            >
              <option value="">Select Program</option>
              {filteredPrograms.map((prog) => (
                <option key={prog.programID} value={prog.programID}>{prog.programName}</option>
              ))}
            </select>
            
            )}
            <input className="w-full p-2 mb-3 border rounded" type="text" name="year_section" placeholder="Year & Section" value={formData.year_section} onChange={handleChange} required />
            <select className="w-full p-2 mb-3 border rounded" name="sex" value={formData.sex} onChange={handleChange} required>
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={handleSubmit}>Sign Up</button>
            <p>Already have an account? <a href="/">Login</a></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;