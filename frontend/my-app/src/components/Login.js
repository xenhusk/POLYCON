import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "./icons/DarkLogo.png";

const Login = ({ onLoginSuccess }) => {
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
      <div className="w-full h-[80vh] flex justify-center items-center">
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
          <img src={logo} alt="Logo" className="h-[130px] w-[130px] mx-auto"/>
          <h2 className="text-center text-lg font-bold text-[#005B98]">Login</h2>
          <input
            className="border-[#005B98] border-b-2 p-2 w-[76%] h-[44.59px] my-2 mx-auto focus:outline-none"
            type="email"
            placeholder="sample@wnu.sti.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required/>
          <input
            className="border-[#005B98] border-b-2 p-2 w-[76%] h-[44.59px] my-2 mx-auto focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required/>
            <div className="h-[5%]">
              {message && <p className="text-center text-red-500 text-base">{message}</p>}
            </div>
          <button
            type="submit"
            className="bg-[#057DCD] text-white w-[76%] h-[44.59px] rounded-lg my-2 mx-auto shadow-md hover:bg-[#54BEFF]">
            Login
          </button>
          <div className="border-t-2 border-[#005B98] w-[70%] my-2 mx-auto border-opacity-50">
            <p className="text-center font-light text-[0.9rem] mx-auto my-2 text-opacity-50">
              Don't have an account? <button 
                onClick={() => navigate('/signup')} 
                className="text-[#005B98] focus:outline-none"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
  );
};

export default Login;
