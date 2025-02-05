import React, { useState, useEffect } from 'react';
import logo from "./icons/DarkLogo.png";

const Signup = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [formData, setFormData] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    program: '',
    sex: '',
    year_section: '',
    department: '',
    role: 'student'  // Default role set to student
  });
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@wnu\.sti\.edu\.ph$/;
    if (!emailPattern.test(formData.email)) {
      setErrorMessage('Email must end with @wnu.sti.edu.ph');
      return;
    }

    try {
        const response = await fetch('http://localhost:5001/account/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json(); // This can throw if the response is not JSON, which should be handled.

        if (response.ok) {
            alert(data.message);
            onSwitchToLogin();  // Switch to login modal after successful signup
        } else {
            // It's possible to get here with a non-200 status but still have JSON parsed correctly.
            setErrorMessage(data.error || 'Signup failed. Please try again.');
        }
    } catch (error) {
        // This could be due to network issues, or JSON parsing issues, or server sending non-JSON response
        if (error instanceof SyntaxError) {
            setErrorMessage('There was a problem processing your request.'); // Assuming it's a JSON parse error
        } else {
            setErrorMessage('Something went wrong! Please try again later.');
        }
    }
};

  return (
    <div className="h-[600px] w-[100%] flex justify-center items-center">
      <div className="flex flex-col items-center w-full">
        {step === 1 ? (
          <div className="w-full max-w-[75.5%]">
            <img src={logo} alt="Logo" className="h-[130px] w-[33%] mx-auto"/>
            <h2 className="text-center text-lg font-bold text-[#005B98]">Registration Form</h2>
            <div className='flex justify-between gap-4'>
            <input className="border-[#005B98] border-b-2 p-2 w-[45%] h-[44.59px] my-2 focus:outline-none" 
              type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              
              <input className="border-[#005B98] border-b-2 p-2 w-[45%] h-[44.59px] my-2 focus:outline-none" 
              type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            </div>

            <input className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none" 
            type="text" name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} required />
            
            <input className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none" 
            type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            
            <input className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none"
            type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            
            <button className="bg-[#057DCD] text-white w-[100%] h-[44.59px] rounded-lg my-2 mx-auto hover:bg-[#54BEFF]" 
            onClick={handleNext}>Next</button>
            <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
              <p className="text-center font-light text-[0.7rem] mx-auto my-2 text-opacity-50">
                Don't have an account? <button onClick={onSwitchToLogin} className="text-[#005B98] focus:outline-none">Login</button>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center items-center">
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-[75%]">
                <img src={logo} alt="Logo" className="h-[130px] w-[30%] mx-auto"/>
                <h2 className="text-center text-lg font-bold text-[#005B98]">Personal Information</h2>
                <select className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none" 
                name="department" value={formData.department} onChange={handleChange} required>
                  <option value="" className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none">
                    Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentID} value={dept.departmentID}>{dept.departmentName}</option>
                  ))}
                </select>
                {formData.department && (
                  <select
                  className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none" name="program" value={formData.program} onChange={handleChange} required disabled={!formData.department}>
                  <option value="">Select Program</option>
                  {filteredPrograms.map((prog) => (
                    <option key={prog.programID} value={prog.programID}>{prog.programName}</option>
                  ))}
                </select>
                
                )}
                <input className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none" 
                type="text" name="year_section" placeholder="Year & Section" value={formData.year_section} onChange={handleChange} required />
                
                <select className="border-[#005B98] border-b-2 p-2 w-[100%] h-[44.59px] my-2 mx-auto focus:outline-none"
                name="sex" value={formData.sex} onChange={handleChange} required>
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errorMessage && <p className="text-center text-red-500 text-lg">{errorMessage}</p>}
                <button className="bg-[#057DCD] text-white w-[450px] h-[44.59px] rounded-lg my-2 mx-auto hover:bg-[#54BEFF]" 
                onClick={handleSubmit}>Sign Up</button>
                <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
                  <p className="text-center font-light text-[0.7rem] mx-auto my-2 text-opacity-50">
                    Don't have an account? <button onClick={onSwitchToLogin} className="text-[#005B98] focus:outline-none">Login</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  </div>
  );
};

export default Signup;