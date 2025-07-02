import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import logo from "./icons/DarkLogo.png";
import { storeUserAuth } from "../utils/authUtils";
import { fetchAndStoreEnrollmentStatus } from "../utils/enrollmentUtils";
import ForgotPassword from './ForgotPassword';

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
      const response = await fetch("http://localhost:5001/account/login", {
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
    <div className="w-[100%] h-full flex justify-center items-center font-poppins">
      {showForgotPassword ? (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col w-[90%] md:w-[80%] lg:w-[76%] mx-auto p-4">
          <img src={logo} alt="Logo" className="h-[100px] w-[100px] md:h-[130px] md:w-[130px] mx-auto"/>
          <h2 className="text-center text-base md:text-lg font-bold text-[#005B98]">Login</h2>
          <div className="relative z-0 my-1">
            <input 
              className="block px-1.5 my-2.5 mt-3 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              type="email" 
              name='email' 
              id='Email' 
              placeholder=" " 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <label htmlFor="Email" className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Email
            </label>
          </div>
          <div className="relative z-0 my-1">
            <input 
              className="block px-1.5 my-2.5 mt-3 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              type={showPassword ? "text" : "password"} 
              name='password' 
              id='Password' 
              placeholder=" " 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <label htmlFor="Password" className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-[-1] peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Password
            </label>
            {password && (
              <span
                className="absolute right-[3%] top-2.5 md:top-3 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOutlined size={20} /> : <EyeInvisibleOutlined size={20} />}
              </span>
            )}
          </div>
          {message && <p className="text-center text-red-500 text-base md:text-[0.9rem]">{message}</p>}
          <button 
            onClick={() => {
              if (!isLoading) {
                setLoginClicked(true); 
                setTimeout(() => setLoginClicked(false), 150);
              }
            }}
            disabled={isLoading}
            type="submit" 
            className={`bg-[#057DCD] text-white w-full h-[44.59px] rounded-lg my-2 mx-auto shadow-md hover:bg-[#54BEFF] flex items-center justify-center
              ${LoginClicked ? "scale-90" : "scale-100"}
              ${isLoading ? "cursor-not-allowed opacity-90" : ""}
            `}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                <span className="ml-2">Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
          <p className="text-center font-light text-[0.8rem] md:text-[0.9rem] mx-auto my-2 text-opacity-50">
            <button 
              onClick={(e) => { 
                e.preventDefault();
                setShowForgotPassword(true);
              }} 
              className="text-[#005B98] focus:outline-none hover:underline"
            >
              Forgot your password?
            </button>
          </p>
          <div className="border-t-2 border-[#212223] w-[90%] my-2 mx-auto border-opacity-50">
            <p className="text-center font-light text-[0.8rem] md:text-[0.9rem] mx-auto my-2 text-opacity-50">
              Don't have an account? 
              <button 
                onClick={(e) => { 
                  setSignupClicked(true);
                  setTimeout(() => { 
                    setSignupClicked(true); 
                    setTimeout(() => e.preventDefault(), onSwitchToSignup(), 500);
                  }, 200);
                }} 
                className={`text-[#005B98] ml-1 focus:outline-none hover:underline ${SignupClicked ? "scale-90" : "scale-100"}`}
              > 
                Sign up
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
