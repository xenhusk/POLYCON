import React, { useState, useEffect } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import logo from "./icons/DarkLogo.png";

const Signup = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [NextClicked, setNextClicked] = useState(false);
  const [signupClicked, setSignupClicked] = useState(false);
  const [loginClicked, setLoginClicked] = useState(false);
  const [BackClicked, setBackClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmNewPassword: '',
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
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'department' && { program: '' })
    }));
  
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage('');
    
    if (name === 'department') fetchPrograms(value);
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
    if (!handleSubmit()) return;
    setStep(step + 1);
    setErrorMessage('');
  };

  const handleBack = () => {
    setStep(step - 1);
    // Clear error when going back
    setErrorMessage(''); 
  };
  

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@wnu\.sti\.edu\.ph$/;
    const errors = [];

    // Validation checks
    if (!formData.firstName) errors.push("First name is required");
    if (!formData.lastName) errors.push("Last name is required");
    if (!formData.idNumber) errors.push("ID number is required");
    if (!emailPattern.test(formData.email)) errors.push("Valid WNU email is required");
    if (formData.password.length < 6) errors.push("Password must be at least 6 characters");
    if (formData.password !== formData.confirmNewPassword) errors.push("Passwords don't match");
    if (!formData.department) errors.push("Department is required");
    if (!formData.program) errors.push("Program is required");
    if (!formData.year_section) errors.push("Year & Section is required");
    if (!formData.sex) errors.push("Gender is required");

    if (errors.length > 0) {
        setErrorMessage(errors.join(", "));
        return false;
    }

    try {
        const response = await fetch('http://localhost:5001/account/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idNumber: formData.idNumber,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                program: formData.program,
                sex: formData.sex,
                year_section: formData.year_section,
                department: formData.department,
                role: formData.role
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful!');
            onSwitchToLogin(); // Switch to login after successful registration
        } else {
            setErrorMessage(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        setErrorMessage('Registration failed. Please try again.');
    }

    return true;
};

  return (
    <div className="h-[80vh] w-full flex justify-center items-center font-poppins">
      <div className="flex flex-col justify-center items-center w-full">
        {step === 1 ? (
          <div className={`w-[76%] mx-auto ${step === 1 ? 'slide-right' : 'slide-left'}`}>
            <img src={logo} alt="Logo" className="h-[130px] w-[130px] mx-auto"/>
            <h2 className="text-center text-lg font-bold text-[#005B98] my-2">Registration Form</h2>
            <div className='flex justify-between gap-4'>
              <div className="relative z-0">
                <input className="block py-1 px-1.5 my-2 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  
                  type="text" name="firstName" placeholder=" " value={formData.firstName} onChange={handleChange} required />
                <label for="firstName" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                  First Name</label>
              </div>

              <div className="relative z-0">
                <input className="block py-1 px-1.5 my-2 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" 
                  type="text" name="lastName" placeholder=" " value={formData.lastName} onChange={handleChange} required />
                <label for="lastName" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                  Last Name</label>
              </div>
            </div>

            <div className="relative z-0">
              <input className="block py-1.5 px-1.5 my-2.5 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" 
                type="text" name="idNumber" placeholder=" " value={formData.idNumber} onChange={handleChange} required />
              <label for="IDNumber" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                ID Number</label>
            </div>

            <div className="relative z-0">
              <input className="block py-1.5 px-1.5 my-2.5 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                type="text" id="email" name="email" placeholder=" " value={formData.email} onChange={handleChange} required />
              <label for="Email" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                Email</label>
            </div>

            <div className="relative z-0">
              <input className="block py-1.5 px-1.5 my-2 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                type={showPassword ? "text" : "password"} id="Password" name="password" placeholder=" " value={formData.password} onChange={handleChange} required />
              <label for="Password" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                Password</label>
              {/* Show/Hide Icon */}
              {formData.password && (
                <span
                  className="absolute right-[3%] top-4 cursor-pointer text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOutlined size={20} /> : <EyeInvisibleOutlined size={20} />}
                </span>
              )}
            </div>

            <div className="relative z-0">
              <input className="block py-1.5 px-1.5 my-2 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                type={showConfirmPassword ? "text" : "password"} id="ConfirmPassword" name="confirmNewPassword" placeholder=" " value={formData.confirmNewPassword} onChange={handleChange} required />
              <label for="ConfirmPassword" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                Confirm New Password</label>
              {/* Show/Hide Icon */}
              {formData.password && (
                <span
                  className="absolute right-[3%] top-4 cursor-pointer text-gray-600 hover:text-gray-800"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOutlined size={20} /> : <EyeInvisibleOutlined size={20} />}
                </span>
              )}
            </div>

            {/* error handling */}
            {errorMessage && <p className="text-center text-red-500 text-[0.9rem]">{errorMessage}</p>}
            
            <button 
              className={`bg-[#057DCD] text-white w-[100%] h-[44.59px] rounded-lg my-2 mx-auto transition-all ease-in  hover:bg-[#54BEFF] animate-modal-slide
              ${NextClicked ? "scale-90" : "scale-100"}`} 
              onClick={ ()=>{ setNextClicked(true); setTimeout(()=> setNextClicked(false), 150); handleNext();}}>
                Next</button>
            <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
              <p className="text-center font-light text-[0.9rem] mx-auto my-2 text-opacity-50">
                Don't have an account? <button onClick={(e) => {setLoginClicked(true); setTimeout(()=> setLoginClicked(false), 150);e.preventDefault();onSwitchToLogin();}} 
                  className={`text-[#005B98] focus:outline-none hover:underline ${loginClicked ? "scale-75" : "scale-100"}`}>
                    Login</button>
              </p>
            </div>
          </div>
        ) : (
          <div className={`w-full flex justify-center items-center ${step === 2 ? 'slide-left' : 'slide-right'}`}>
            <div className="flex flex-col items-center w-full animate-modal-fade">
              {errorMessage && (
                <div className='absolute top-3 left-7 z-50'>
                  <button 
                    className={`text-gray-500 hover:text-[#000000] transition-all ease-in ${BackClicked ? "scale-90" : "scale-100"}`} 
                    onClick={() => { setBackClicked(true); setTimeout(() => setBackClicked(false), 150); handleBack(); }}>
                      
                    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="m15 19-7-7 7-7"/>
                    </svg>
                  </button>
                </div>
              )}
              <div className="w-full max-w-[75%] mx-auto animate-modal-slideL">
                <img src={logo} alt="Logo" className="h-[130px] w-[130px] mx-auto"/>
                <h2 className="text-center text-lg font-bold text-[#005B98]">Personal Information</h2>
                <div class="relative z-0">
                  <select className="block py-1.5 px-1.5 my-2 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    name="department" id="Department" value={formData.department} onChange={handleChange} required>
                    <option value="" hidden>Select Department</option>

                  {departments.map((dept) => (

                    <option key={dept.departmentID} value={dept.departmentID}>{dept.departmentName}</option>
                  
                  ))}
                  </select>
                  <label for="Department" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                    Department</label>
                </div>

                {formData.department && (
                  <div class="relative z-0">
                    <select className="block py-1.5 px-1.5 my-2 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      name="program" id="Program" value={formData.program} onChange={handleChange} required disabled={!formData.department}>
                    <option value="" hidden>Select Program</option>

                    {filteredPrograms.map((prog) => (

                    <option key={prog.programID} value={prog.programID}>{prog.programName}</option>

                  ))}
                    </select>
                    <label for="Program" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                      Program</label>
                  </div>
                )}

                <div class="relative z-0">
                  <input className="block py-1.5 px-1.5 my-2 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    type="text" name="year_section" placeholder=" " value={formData.year_section} onChange={handleChange} required />
                  <label for="year_section" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                    Year & Section</label>
                </div>

                <div class="relative z-0">
                  <select className="block py-1.5 px-1.5 my-2 mt-4 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    name="sex" id='sex' value={formData.sex} onChange={handleChange} required>
                    <option value="" hidden>Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <label for="sex" class="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                    Gender</label>
                </div>

                {/* error handling */}
                {errorMessage && <p className="text-center text-red-500 text-[0.9rem]">{errorMessage}</p>}
                
                <button 
                  className={`bg-[#057DCD] text-white w-[100%] h-[44.59px] rounded-lg my-2 mx-auto transition-all ease-in hover:bg-[#54BEFF]
                    ${signupClicked ? "scale-90" : "scale-100"}`} 
                  onClick={()=>{ setSignupClicked(true); setTimeout(()=> setSignupClicked(false), 150); handleSubmit();}}>Sign Up</button>
                <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
                  <p className="text-center font-light text-[0.9rem] mx-auto my-2 text-opacity-50">
                    Don't have an account? <button onClick={(e) => { setLoginClicked(true); setTimeout(()=> setLoginClicked(false), 200); e.preventDefault();onSwitchToLogin();}} 
                  className={`text-[#005B98] focus:outline-none hover:underline ${loginClicked ? "scale-75" : "scale-100"}`}>
                    Login</button>
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