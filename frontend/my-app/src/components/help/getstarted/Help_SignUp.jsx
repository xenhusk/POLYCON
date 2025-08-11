import React from "react";
import { motion } from "framer-motion";
import { 
  FaUser, FaEnvelope, FaIdCard, FaCheckCircle, 
  FaExclamationTriangle, FaLock, FaGraduationCap,
  FaBuilding, FaBook, FaShieldAlt 
} from "react-icons/fa";

const Help_Signup = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#0056a6] to-[#00a3ff] rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Creating and Verifying Your POLYCON Account
          </h1>
          <p className="text-blue-50 text-sm sm:text-base">
            Follow this guide to set up your account and gain access to the POLYCON consultation booking platform
          </p>
        </div>

        {/* Registration Overview with enhanced visuals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#0056a6] p-2 rounded-full mr-3">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-[#0056a6]">
              Registration Overview
            </h2>
          </div>
          
          <p className="text-gray-700 mb-6 pl-10">
            POLYCON uses a secure, multi-step registration process to ensure that only authorized students and staff can access the consultation booking platform.
          </p>
          
          {/* Process visualization */}
          <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
            <div className="flex-1 bg-gradient-to-br from-[#e6f3ff] to-[#f5f9ff] p-4 rounded-lg border border-blue-100 relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-[#0056a6] text-white text-xs px-2 py-1 rounded-bl-md">Step 1</span>
              <h3 className="font-medium text-[#0056a6] mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">Create your account with institutional email</p>
              <FaUser className="absolute bottom-2 right-2 text-blue-200 text-3xl opacity-30" />
            </div>
            
            <div className="hidden md:flex items-center text-[#0056a6]">→</div>
            
            <div className="flex-1 bg-gradient-to-br from-[#e6f3ff] to-[#f5f9ff] p-4 rounded-lg border border-blue-100 relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-[#0056a6] text-white text-xs px-2 py-1 rounded-bl-md">Step 2</span>
              <h3 className="font-medium text-[#0056a6] mb-2">Verify Email</h3>
              <p className="text-sm text-gray-600">Confirm your identity via email link</p>
              <FaEnvelope className="absolute bottom-2 right-2 text-blue-200 text-3xl opacity-30" />
            </div>
            
            <div className="hidden md:flex items-center text-[#0056a6]">→</div>
            
            <div className="flex-1 bg-gradient-to-br from-[#e6f3ff] to-[#f5f9ff] p-4 rounded-lg border border-blue-100 relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-[#0056a6] text-white text-xs px-2 py-1 rounded-bl-md">Step 3</span>
              <h3 className="font-medium text-[#0056a6] mb-2">Access System</h3>
              <p className="text-sm text-gray-600">Book consultations and access features</p>
              <FaCheckCircle className="absolute bottom-2 right-2 text-blue-200 text-3xl opacity-30" />
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-[#0056a6] p-4 rounded-r">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> Registration is only available to students and staff with valid institutional email addresses (@wnu.sti.edu.ph). Your account will be linked to your institutional profile automatically.
            </p>
          </div>
        </div>

        {/* Step-by-Step Registration Process with enhanced design */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8" id="registration_steps">
          <div className="flex items-center mb-6">
            <div className="bg-[#0056a6] p-2 rounded-full mr-3">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-[#0056a6]">
              Step-by-Step Registration Process
            </h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-4 relative">
              <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                1
              </div>
              <div className="relative">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Access the Registration Page</h3>
                <p className="text-gray-600 mb-4">
                  Click the "Sign Up" link on the login page or navigate directly to the registration URL provided by your institution.
                </p>
                
                <div className="border rounded-lg shadow-sm p-4 bg-gradient-to-b from-white to-gray-50">
                  <div className="text-center p-3">
                    <div className="flex justify-between items-center border-b pb-3 mb-3">
                      <div className="flex items-center">
                        <div className="bg-[#0056a6] p-1 rounded-full">
                          <div className="h-6 w-6 bg-white rounded-full"></div>
                        </div>
                        <span className="ml-2 font-medium text-[#0056a6]">POLYCON</span>
                      </div>
                      <div className="text-xs text-gray-500">Login / Register</div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Already have an account? 
                      <span className="text-[#0078e7] hover:underline ml-1">Sign in</span>
                    </p>
                    <button className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white px-6 py-2 rounded-md hover:shadow-md transition-all duration-200">
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Personal Information */}
            <div className="flex items-start space-x-4" id="personal-info">
              <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                2
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Enter Your Personal Information</h3>
                <p className="text-gray-600 mb-4">
                  Fill out the registration form with your personal details. All fields marked with an asterisk (*) are required.
                </p>
                
                <div className="border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                    <div className="flex items-center">
                      <FaUser className="text-[#0056a6] mr-2" />
                      <h4 className="font-medium text-[#0056a6]">Personal Details</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="space-y-4 max-w-md">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          disabled
                          placeholder="Full Name*"
                          className="pl-10 w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          disabled
                          placeholder="Institutional Email*"
                          className="pl-10 w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaIdCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          disabled
                          placeholder="Student/Staff ID*"
                          className="pl-10 w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 - Password */}
            <div className="flex items-start space-x-4" id="password-step">
              <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                3
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Set Your Password</h3>
                <p className="text-gray-600 mb-4">
                  Create a secure password that meets our security requirements. Your password must:
                </p>
                
                <div className="border rounded-lg shadow-sm overflow-hidden mb-4">
                  <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                    <div className="flex items-center">
                      <FaLock className="text-[#0056a6] mr-2" />
                      <h4 className="font-medium text-[#0056a6]">Password Requirements</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        At least 8 characters long
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        Include one uppercase letter
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        Include one number
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        Include one special character
                      </li>
                    </ul>
                    
                    <div className="space-y-4 max-w-md">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          disabled
                          placeholder="Create Password*"
                          className="pl-10 w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                          value="••••••••"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          disabled
                          placeholder="Confirm Password*"
                          className="pl-10 w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                          value="••••••••"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Password strength:</p>
                        <div className="h-2 bg-gradient-to-r from-green-300 to-green-500 rounded-full w-full"></div>
                        <p className="text-xs text-gray-500 mt-1 text-right">Strong</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 - Academic Information */}
            <div className="flex items-start space-x-4" id="academic-info">
              <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                4
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Academic Information</h3>
                <p className="text-gray-600 mb-4">
                  You need to provide your academic information to ensure you are matched with the right consultants.
                </p>
                
                <div className="border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                    <div className="flex items-center">
                      <FaBuilding className="text-[#0056a6] mr-2" />
                      <h4 className="font-medium text-[#0056a6]">Department & Program</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <div className="relative">
                          <select 
                            disabled
                            className="w-full px-4 py-2 border rounded-md appearance-none bg-white"
                          >
                            <option>College of Computer Studies</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                        <div className="relative">
                          <select 
                            disabled
                            className="w-full px-4 py-2 border rounded-md appearance-none bg-white"
                          >
                            <option>BS Information Technology</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year & Section</label>
                      <input 
                        type="text" 
                        disabled
                        value="3A"
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                        placeholder="e.g., 3A"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 - Email Verification */}
            <div className="flex items-start space-x-4" id="email-verification">
              <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                5
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Submit and Verify Email</h3>
                <p className="text-gray-600 mb-4">
                  After completing the registration form, click the Submit button and you'll receive a verification email at your institutional address.
                </p>
                
                <div className="border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                    <div className="flex items-center">
                      <FaEnvelope className="text-[#0056a6] mr-2" />
                      <h4 className="font-medium text-[#0056a6]">Verification Email Status</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50">
                    <div className="bg-white p-3 rounded-md border border-blue-100 mb-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <FaEnvelope className="text-[#0056a6]" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Verification Email Sent</p>
                          <p className="text-xs text-gray-500">to student123@wnu.sti.edu.ph</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        A verification link has been sent to your email address. Please check your inbox and click the link to activate your account.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Valid for 24 hours</span>
                        <button className="text-sm text-[#0056a6] hover:text-[#0078e7] hover:underline">Resend email</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Process with enhanced design */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8" id="email_verification">
          <div className="flex items-center mb-6">
            <div className="bg-[#0056a6] p-2 rounded-full mr-3">
              <FaEnvelope className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-[#0056a6]">
              Email Verification Process
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-gray-700">
              Email verification ensures that you have access to your institutional email account and helps protect your POLYCON account.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#0056a6] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">1</div>
                      <h4 className="font-medium text-[#0056a6]">Receive Email</h4>
                    </div>
                    <FaCheckCircle className="text-green-500" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="border border-gray-200 rounded p-3 bg-gray-50 flex items-center mb-3">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 bg-[#0056a6] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        P
                      </div>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">Verify Your POLYCON Account</p>
                      <p className="text-gray-500">From: notifications@polycon.edu</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Check your email for a message with the subject "Verify Your POLYCON Account". This contains your verification link.
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#0056a6] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">2</div>
                      <h4 className="font-medium text-[#0056a6]">Click Link</h4>
                    </div>
                    <FaCheckCircle className="text-green-500" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="border border-gray-200 rounded p-3 bg-gray-50 mb-3">
                    <div className="text-center py-2">
                      <button className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white text-sm px-4 py-2 rounded-md">
                        Verify My Account
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click the "Verify My Account" button in the email to confirm your identity and activate your account.
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-[#e6f3ff] to-[#f0f7ff] px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#0056a6] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">3</div>
                      <h4 className="font-medium text-[#0056a6]">Confirmation</h4>
                    </div>
                    <FaCheckCircle className="text-green-500" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="border border-gray-200 rounded p-3 bg-green-50 mb-3">
                    <div className="flex items-center text-center justify-center py-2">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="text-green-700 font-medium">Email Verified!</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    After clicking the link, you'll see a confirmation screen indicating that your email has been verified.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-[#fffbeb] to-[#fff8e1] p-4 rounded-md border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Verification Troubleshooting
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    If you don't receive the verification email within 15 minutes:
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside pl-2">
                    <li>Check your spam or junk folder</li>
                    <li>Verify you entered the correct email address</li>
                    <li>Use the "Resend verification email" option</li>
                    <li>Contact support if problems persist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Activation Confirmation with enhanced design */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" id="account_activation">
          <div className="flex items-center mb-6">
            <div className="bg-[#0056a6] p-2 rounded-full mr-3">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-[#0056a6]">
              Account Activation Confirmation
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-gray-700">
              After completing verification, you'll receive a confirmation that your account is active:
            </p>

            <div className="border rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 border-b">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full p-2 mr-3">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-800">
                      Account Successfully Verified
                    </h3>
                    <p className="text-sm text-green-600">Your account is now ready to use</p>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-xs text-gray-500">student123@wnu.sti.edu.ph</p>
                    </div>
                    <div className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <FaCheckCircle className="mr-1 text-green-500" />
                      Verified
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Congratulations! Your POLYCON account has been verified and activated. You now have full access to the platform features.
                  </p>
                </div>
                <button className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white px-6 py-3 rounded-md font-medium hover:shadow-md transition-all duration-200">
                  Continue to Dashboard
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Account Status:</strong> Your account status will show as "Verified" on your profile. A green verification badge will appear next to your name throughout the platform.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700">
              You'll also receive a welcome email with additional information about getting started with POLYCON, including links to helpful resources and guides.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Help_Signup;