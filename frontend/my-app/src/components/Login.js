import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "./icons/DarkLogo.png";

const Login = ({ onLoginSuccess,onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLoginSuccess = (data) => {
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    if (data.role === 'student') {
      localStorage.setItem('studentID', data.studentId);
    } else if (data.role === 'faculty') {
      localStorage.setItem('teacherID', data.teacherId);
    }
    onLoginSuccess(data);
    navigate('/'); // Redirect to Home instead of role-specific pages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5001/account/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(`Welcome ${data.firstName} ${data.lastName}`);
            handleLoginSuccess(data);
        } else {
            setMessage(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        setMessage('Login failed. Please try again later.');
    }
};


  return (
      <div className="w-full h-[80vh] flex justify-center items-center font-poppins">
        <form onSubmit={handleSubmit} className="flex flex-col w-[76%] max-w-md sm:max-w-lg md:max-w-xl mx-auto">
          <img src={logo} alt="Logo" className="h-[130px] w-[130px] mx-auto"/>
          <h2 className="text-center text-lg font-bold text-[#005B98]">Login</h2>
          <div class="relative z-0">
            <input className="block px-[2%] my-2 mt-3 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              type="email" id='Email' placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <label for="Email" class="absolute text-base px-2 peer-focus:px-0 text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Email</label>
          </div>
          <div class="relative z-0">
            <input className="block px-[2%] my-2 mt-3 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              type="password" id='Password' placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <label for="Password" class="absolute text-base px-2 peer-focus:px-0 text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Password</label>
          </div>
            <div className="h-[5%]">
              {message && <p className="text-center text-red-500 text-base">{message}</p>}
            </div>
          <button type="submit" className="bg-[#057DCD] text-white w-full h-[44.59px] rounded-lg my-2 mx-auto shadow-md hover:bg-[#54BEFF]">
            Login
          </button>
          <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
            <p className="text-center font-light text-[0.9rem] mx-auto my-2 text-opacity-50">
              Don't have an account? <button onClick={(e) => {e.preventDefault(); onSwitchToSignup();}} 
              className="text-[#005B98] focus:outline-none hover:underline">Sign up</button>
            </p>
          </div>
        </form>
      </div>
  );
};

export default Login;
