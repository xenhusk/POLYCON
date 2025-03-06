import React, { useState } from 'react';
import logo from "./icons/DarkLogo.png";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ResetClicked, setResetClicked] = useState(false);
  const [BackClicked, setBackClicked] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Check email domain
    if (!email.endsWith('@wnu.sti.edu.ph')) {
      setMessage({ 
        type: 'error', 
        content: 'Please use your STI WNU email address (@wnu.sti.edu.ph)' 
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/account/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          content: 'Password reset link sent to your email.' 
        });
      } else {
        const errorMsg = data.error ? data.error.toLowerCase() : "";
        if (errorMsg.includes("not found") || errorMsg.includes("no account")) {
          setMessage({ 
            type: 'error', 
            content: 'No account found with this email address.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            content: data.error || 'Failed to send reset link.' 
          });
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: 'Network error. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[100%] h-full flex justify-center items-center font-poppins">
      <form onSubmit={handleResetPassword} className="flex flex-col w-[90%] md:w-[80%] lg:w-[76%] mx-auto p-4">
        <img src={logo} alt="Logo" className="h-[130px] w-[130px] mx-auto"/>
        <h2 className="text-center text-base md:text-lg font-bold text-[#005B98]">Reset Password</h2>
        <p className="text-center text-sm md:text-base text-gray-600 mt-2 mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <div className="relative z-0 my-1">
          <input 
            className="block px-1.5 my-2.5 mt-3 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 border-[#005B98] appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            type="email" 
            name="email" 
            id="Email" 
            placeholder=" " 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <label htmlFor="Email" className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
            Email
          </label>
        </div>

        {message && (
          <p className={`text-center text-sm md:text-base mt-2 ${
            message.type === 'success' ? 'text-green-600' : 'text-red-500'
          }`}>
            {message.content}
          </p>
        )}

        <button 
          onClick={() => {
            setResetClicked(true);
            setTimeout(() => setResetClicked(false), 150);
          }}
          type="submit" 
          disabled={isLoading}
          className={`bg-[#057DCD] text-white w-full h-[44.59px] rounded-lg my-2 mx-auto shadow-md hover:bg-[#54BEFF] transition-all duration-150 ${ResetClicked ? "scale-90" : "scale-100"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Sending..." : "Reset Password"}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setBackClicked(true);
            setTimeout(() => {
              setBackClicked(false);
              setTimeout(() => onClose(), 500);
            }, 200);
          }}
          className={`text-[#005B98] text-sm md:text-base hover:underline mt-2 transition-all duration-150 ${BackClicked ? "scale-90" : "scale-100"}`}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;