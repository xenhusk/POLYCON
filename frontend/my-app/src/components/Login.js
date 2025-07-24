import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import logo from "./icons/DarkLogo.png";
import { storeUserAuth } from "../utils/authUtils";
import { fetchAndStoreEnrollmentStatus } from "../utils/enrollmentUtils";
import ForgotPassword from './ForgotPassword';
import API_URL from '../apiConfig';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [LoginClicked, setLoginClicked] = useState(false);
  const [SignupClicked, setSignupClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoginClicked(true);
    setIsLoading(true); // Set loading to true when login starts
  
    // Check email domain first
    if (!(email.endsWith('@wnu.sti.edu.ph') || email.endsWith('@gmail.com'))) {
      setMessage('Email must end with @wnu.sti.edu.ph or @gmail.com');
      setLoginClicked(false);
      setIsLoading(false); // Reset loading state
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login response data:", data); // Add this debug log

        // Store complete user info including name
        const userInfo = {
          email: email,
          teacherId: data.teacherId || data.userId || data.id,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`.trim()  // Add this
        };
        
        console.log("About to store userInfo:", userInfo);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        
        // Verify storage immediately
        const storedInfo = localStorage.getItem("userInfo");
        console.log("Verification - stored userInfo:", storedInfo);
        const parsedInfo = JSON.parse(storedInfo);
        console.log("Parsed userInfo:", parsedInfo);

        // Block unverified student login
        if (data.role === 'student' && data.is_verified === false) {
          setMessage('Please verify your email before logging in.');
          setIsLoading(false);
          return;
        }
        // Rest of the existing login code...
        localStorage.setItem("userEmail", email);
        storeUserAuth(data, data.role);
  
        if (data.role === 'student') {
          const studentId = data.studentId || data.userId || data.id;
          if (studentId) {
            await fetchAndStoreEnrollmentStatus(studentId);
          }
        }
  
        setTimeout(() => {
          console.log("Verification - localStorage values after login:", {
            userEmail: localStorage.getItem("userEmail"),
            userId: localStorage.getItem("userId"),
            role: localStorage.getItem("userRole"),
            isAuthenticated: localStorage.getItem("isAuthenticated"),
            isEnrolled: localStorage.getItem("isEnrolled")
          });
        }, 100);
  
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }

        // Add a 1-second delay then refresh the page to ensure credentials are properly stored
        setTimeout(() => {
          console.log("Refreshing page to ensure user credentials are properly loaded...");
          window.location.reload();
        }, 1000);

        switch (data.role) {
          case "admin":
            navigate("/homeadmin");
            break;
          case "faculty":
            navigate("/dashboard");
            break;
          case "student":
            navigate("/dashboard");
            break;
          default:
            navigate("/dashboard");
            break;
        }
      } else {
        const errorMsg = data.error ? data.error.toLowerCase() : "";
        if (errorMsg.includes("email") || errorMsg.includes("not found") || errorMsg.includes("not registered")) {
          setMessage("No email found on our database.");
        } else if (errorMsg.includes("password") || errorMsg.includes("incorrect")) {
          setMessage("The password is incorrect. Forgot Password?");
        } else {
          setMessage(data.error || "Login failed. Please try again.");
        }
        setIsLoading(false); // Reset loading state on error
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Network error. Please check your connection and try again.");
      setIsLoading(false); // Reset loading state on error
    } finally {
      setLoginClicked(false);
      // Note: Don't reset isLoading here as we want it to remain true during navigation
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center font-poppins">
      {showForgotPassword ? (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      ) : (
        <div className="w-full p-6">
          <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-center mb-6">
            <img src={logo} alt="Logo" className="h-[80px] w-[80px] md:h-[100px] md:w-[100px] mx-auto mb-4"/>
            <h2 className="text-xl md:text-2xl font-bold text-[#057DCD] mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to your POLYCON account</p>
          </div>
          <div className="mb-4">
            <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900"
              type="email" 
              name='email' 
              id='Email' 
              placeholder="Enter your email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="mb-6 relative">
            <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input 
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900"
              type={showPassword ? "text" : "password"} 
              name='password' 
              id='Password' 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            {password && (
              <button
                type="button"
                className="absolute right-4 top-[38px] text-gray-500 hover:text-[#057DCD] transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOutlined size={20} /> : <EyeInvisibleOutlined size={20} />}
              </button>
            )}
          </div>
          {message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm text-center">{message}</p>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (!isLoading) {
                setLoginClicked(true); 
                setTimeout(() => setLoginClicked(false), 150);
              }
            }}
            disabled={isLoading}
            type="submit" 
            className={`w-full bg-[#057DCD] text-white py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-[#046bb8] shadow-lg hover:shadow-xl flex items-center justify-center
              ${LoginClicked ? "scale-95" : "scale-100"}
              ${isLoading ? "cursor-not-allowed opacity-90" : ""}
            `}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
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
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
          
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={(e) => { 
                e.preventDefault();
                setShowForgotPassword(true);
              }} 
              className="text-[#057DCD] text-sm hover:text-[#046bb8] hover:underline transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={(e) => { 
                  setSignupClicked(true);
                  setTimeout(() => { 
                    setSignupClicked(false); 
                    onSwitchToSignup();
                  }, 150);
                }} 
                className={`text-[#057DCD] font-semibold hover:text-[#046bb8] hover:underline transition-all duration-200 ${SignupClicked ? "scale-95" : "scale-100"}`}
              > 
                Sign up
              </button>
            </p>
          </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
