import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "./icons/DarkLogo.png";

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
            localStorage.setItem('userEmail', email);
            onLoginSuccess({ email });

            if (data.role === 'student') {
                navigate('/booking-student', { state: { studentID: data.studentId } });
            } else if (data.role === 'faculty') {
                navigate('/booking-teacher', { state: { teacherID: data.teacherId } });
            } else if (data.role === 'admin') {
                navigate('/admin');
            } else {
                setMessage('Unauthorized role.');
            }
        } else {
            setMessage(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        setMessage('Login failed. Please try again later.');
    }
};


  return (
      <div className="w-full h-[80vh] flex justify-center items-center">
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md sm:max-w-lg md:max-w-xl">
          <img src={logo} alt="Logo" className="h-[130px] w-[25%] mx-auto"/>
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
              {message && <p className="text-center text-red-500 text-lg">{message}</p>}
            </div>
          <button
            type="submit"
            className="bg-[#057DCD] text-white w-[76%] h-[44.59px] rounded-lg my-2 mx-auto shadow-md hover:bg-[#54BEFF]">
            Login
          </button>
          <div className="border-t-2 border-[#005B98] w-[70%] my-2 mx-auto border-opacity-50">
            <p className="text-center font-light text-[14px] mx-auto my-2 text-opacity-50">
              Don't have an account? <button onClick={onSwitchToSignup} className="text-[#005B98] focus:outline-none">Sign up</button>
            </p>
          </div>
        </form>
      </div>
  );
};

export default Login;
