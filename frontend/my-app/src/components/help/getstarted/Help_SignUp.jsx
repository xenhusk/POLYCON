import React, { useContext } from "react";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const helpContent = {
  main: {
    title: "Creating and Verifying Your POLYCON Account",
    subtitle:
      "Follow this guide to set up your account and gain access to the POLYCON consultation booking platform.",
  },
  sections: [
    {
      id: "registration_overview",
      title: "Registration Overview",
      content: (
        <>
          <p className="text-gray-700 mb-6">
            POLYCON uses a secure, multi-step registration process to ensure
            that only authorized students and staff can access the consultation
            booking platform.
          </p>
          <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 relative">
              <span className="absolute top-0 right-0 bg-[#0056a6] text-white text-xs px-2 py-1 rounded-bl-md">
                Step 1
              </span>
              <h3 className="font-medium text-[#0056a6] mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">
                Create your account with institutional email.
              </p>
            </div>
            <div className="hidden md:flex items-center text-gray-400">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 relative">
              <span className="absolute top-0 right-0 bg-[#0056a6] text-white text-xs px-2 py-1 rounded-bl-md">
                Step 2
              </span>
              <h3 className="font-medium text-[#0056a6] mb-2">Verify Email</h3>
              <p className="text-sm text-gray-600">
                Confirm your identity via email link.
              </p>
            </div>
            <div className="hidden md:flex items-center text-gray-400">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 relative">
              <span className="absolute top-0 right-0 bg-[#0056a6] text-white text-xs px-2 py-1 rounded-bl-md">
                Step 3
              </span>
              <h3 className="font-medium text-[#0056a6] mb-2">Access System</h3>
              <p className="text-sm text-gray-600">
                Book consultations and access features.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-[#0056a6] p-4 rounded-r">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> Registration is only available to
              students and staff with valid institutional email addresses
              (@wnu.sti.edu.ph). Your account will be linked to your
              institutional profile automatically.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "registration_steps",
      title: "Step-by-Step Registration Process",
      content: (
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
              1
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Access the Registration Page
              </h3>
              <p className="text-gray-600 mb-4">
                Click the "Sign Up" link on the login page or navigate directly
                to the registration URL provided by your institution.
              </p>
              <div className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
                <div className="text-center p-3">
                  <div className="flex justify-between items-center border-b pb-3 mb-3">
                    <div className="flex items-center">
                      <span className="ml-2 font-medium text-[#0056a6]">
                        POLYCON
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Login / Register</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Already have an account?
                    <span className="text-[#0078e7] hover:underline ml-1">
                      Sign in
                    </span>
                  </p>
                  <button className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white px-6 py-2 rounded-md hover:shadow-md transition-all duration-200 cursor-not-allowed">
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
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Enter Your Personal Information
              </h3>
              <p className="text-gray-600 mb-4">
                Fill out the registration form with your personal details. All
                fields marked with an asterisk (*) are required.
              </p>
              <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-[#0056a6]">Personal Details</h4>
                </div>
                <div className="p-4 bg-white">
                  <div className="space-y-4 max-w-md">
                    <input
                      type="text"
                      disabled
                      placeholder="Full Name*"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none bg-gray-50"
                    />
                    <input
                      type="email"
                      disabled
                      placeholder="Institutional Email*"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none bg-gray-50"
                    />
                    <input
                      type="text"
                      disabled
                      placeholder="Student/Staff ID*"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none bg-gray-50"
                    />
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
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Set Your Password
              </h3>
              <p className="text-gray-600 mb-4">
                Create a secure password that meets our security requirements.
                Your password must:
              </p>
              <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-[#0056a6]">
                    Password Requirements
                  </h4>
                </div>
                <div className="p-4 bg-white">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      </span>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      </span>
                      Include one uppercase letter
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      </span>
                      Include one number
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      </span>
                      Include one special character
                    </li>
                  </ul>
                  <div className="space-y-4 max-w-md">
                    <input
                      type="password"
                      disabled
                      placeholder="Create Password*"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none bg-gray-50"
                      value="••••••••"
                    />
                    <input
                      type="password"
                      disabled
                      placeholder="Confirm Password*"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none bg-gray-50"
                      value="••••••••"
                    />
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
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Academic Information
              </h3>
              <p className="text-gray-600 mb-4">
                You need to provide your academic information to ensure you are
                matched with the right consultants.
              </p>
              <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-[#0056a6]">
                    Department & Program
                  </h4>
                </div>
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <div className="relative">
                        <select
                          disabled
                          className="w-full px-4 py-2 border rounded-md appearance-none bg-gray-50"
                        >
                          <option>College of Computer Studies</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program
                      </label>
                      <div className="relative">
                        <select
                          disabled
                          className="w-full px-4 py-2 border rounded-md appearance-none bg-gray-50"
                        >
                          <option>BS Information Technology</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year & Section
                    </label>
                    <input
                      type="text"
                      disabled
                      value="3A"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none bg-gray-50"
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
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Submit and Verify Email
              </h3>
              <p className="text-gray-600 mb-4">
                After completing the registration form, click the Submit button
                and you'll receive a verification email at your institutional
                address.
              </p>
              <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-[#0056a6]">
                    Verification Email Status
                  </h4>
                </div>
                <div className="p-4 bg-white">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <p className="text-gray-700 font-medium">
                        Verification Email Sent
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      A verification link has been sent to your email address.
                      Please check your inbox and click the link to activate
                      your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "email_verification_process",
      title: "Email Verification Process",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Email verification ensures that you have access to your
            institutional email account and helps protect your POLYCON account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-[#0056a6]">1. Receive Email</h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Check your email for a message with the subject "Verify Your
                  POLYCON Account". This contains your verification link.
                </p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-[#0056a6]">2. Click Link</h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Click the "Verify My Account" button in the email to confirm
                  your identity and activate your account.
                </p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-[#0056a6]">
                  3. Confirmation
                </h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  After clicking the link, you'll see a confirmation screen
                  indicating that your email has been verified.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800">
              Verification Troubleshooting
            </h3>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside pl-2">
              <li>Check your spam or junk folder</li>
              <li>Verify you entered the correct email address</li>
              <li>Use the "Resend verification email" option</li>
              <li>Contact support if problems persist</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "account_activation",
      title: "Account Activation Confirmation",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            After completing verification, you'll receive a confirmation that
            your account is active:
          </p>
          <div className="border border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-green-800">
                Account Successfully Verified
              </h3>
            </div>
            <div className="p-5 bg-white">
              <p className="text-gray-700 mb-4">
                Congratulations! Your POLYCON account has been verified and
                activated. You now have full access to the platform features.
              </p>
              <button className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white px-6 py-3 rounded-md font-medium hover:shadow-md transition-all duration-200 cursor-not-allowed">
                Continue to Dashboard
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
            <p className="text-sm text-blue-700">
              <strong>Account Status:</strong> Your account status will show as
              "Verified" on your profile.
            </p>
          </div>
        </div>
      ),
    },
  ],
};

const Help_Signup = () => {
  const { searchQuery } = useContext(HelpContext);

  const filteredSections = helpContent.sections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8 px-4"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0056a6] to-[#00a3ff] rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {helpContent.main.title}
        </h1>
        <p className="text-blue-50 text-sm sm:text-base">
          {helpContent.main.subtitle}
        </p>
      </div>

      {/* Filtered Sections */}
      {filteredSections.length > 0 ? (
        filteredSections.map((section) => (
          <div
            key={section.id}
            id={section.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-[#0056a6] mb-4">
              {section.title}
            </h2>
            {section.content}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg py-8">
          No results found for "{searchQuery}".
        </p>
      )}
    </motion.div>
  );
};

export default Help_Signup;
