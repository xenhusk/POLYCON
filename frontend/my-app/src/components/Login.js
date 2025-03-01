import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import logo from "./icons/DarkLogo.png";
import { storeUserAuth } from "../utils/authUtils";
import { fetchAndStoreEnrollmentStatus } from "../utils/enrollmentUtils";

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [LoginClicked, setLoginClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoginClicked(true);

    try {
      console.log("Sending login request to:", "http://localhost:5001/account/login");
      
      const response = await fetch("http://localhost:5001/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);
      
      const data = await response.json();
      console.log("Login response data:", data);

      if (response.ok) {
        console.log("Login successful:", data);
        
        // Explicitly set userEmail in localStorage - CRITICAL for sidebar
        localStorage.setItem("userEmail", email);
        
        // Store authentication data
        storeUserAuth(data, data.role);
        
        // IMPORTANT: Immediately fetch enrollment status for students
        if (data.role === 'student') {
          const studentId = data.studentId || data.userId || data.id;
          if (studentId) {
            // Fetch and store enrollment status
            await fetchAndStoreEnrollmentStatus(studentId);
          }
        }
        
        // Verify localStorage values after auth storage
        setTimeout(() => {
          console.log("Verification - localStorage values after login:", {
            userEmail: localStorage.getItem("userEmail"),
            userId: localStorage.getItem("userId"),
            role: localStorage.getItem("userRole"),
            isAuthenticated: localStorage.getItem("isAuthenticated"),
            isEnrolled: localStorage.getItem("isEnrolled") // Check if enrollment status is set
          });
        }, 100);

        // Call the onLoginSuccess prop if it exists
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
        
        // Navigate based on role
        switch (data.role) {
          case "admin":
            // Admin-specific navigation path
            navigate("/homeadmin");
            break;
            
          case "faculty":
            // Faculty-specific dashboard could be added here if needed
            navigate("/dashboard");
            break;
            
          case "student":
            // Student-specific dashboard could be added here if needed
            navigate("/dashboard");
            break;
            
          default:
            // Default fallback
            navigate("/dashboard");
            break;
        }
      } else {
        setMessage(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(`Network error: ${error.message}. Please try again.`);
    } finally {
      setLoginClicked(false);
    }
  };

  return (
      <div className="w-[100%] h-[80vh] flex justify-center items-center font-poppins">
        <form onSubmit={handleLogin} className="flex flex-col w-[76%] max-w-md sm:max-w-lg md:max-w-xl mx-auto">
          <img src={logo} alt="Logo" className="h-[130px] w-[130px] mx-auto"/>
          <h2 className="text-center text-lg font-bold text-[#005B98]">Login</h2>
          <div className="relative z-0 my-1">
            <input className="block px-1.5 my-2.5 mt-3 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              type="email" name='email' id='Email' placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <label htmlFor="Email" className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Email</label>
          </div>
          <div className="relative z-0 my-1">
            <input className="block px-1.5 my-2.5 mt-3 mx-auto w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              type={showPassword ? "text" : "password"} name='password' id='Password' placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <label htmlFor="Password" className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-[-1] peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
            Password</label>
            {/* Show/Hide Icon */}
            {password && (
              <span
                className="absolute right-[3%] top-3 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOutlined size={20} /> : <EyeInvisibleOutlined size={20} />}
              </span>
            )}
          </div>
            {message && <p className="text-center text-red-500 text-[0.9rem]">{message}</p>}
          <button 
            onClick={() => { setLoginClicked(true); setTimeout(() => setLoginClicked(false), 150)}}
            type="submit" className={`bg-[#057DCD] text-white w-full h-[44.59px] rounded-lg my-2 mx-auto shadow-md hover:bg-[#54BEFF]
            ${LoginClicked ? "scale-90" : "scale-100"}`}>
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
