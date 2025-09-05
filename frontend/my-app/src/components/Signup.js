import React, { useState, useEffect } from "react";
import API_URL from '../apiConfig';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import logo from "./icons/DarkLogo.png";
import TermsModal from "./TermsModal";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    idNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmNewPassword: "",
    program: "",
    sex: "",
    year_section: "",
    department: "",
    role: "student", // Default role set to student
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    email: "",
    password: "",
    confirmNewPassword: "",
    department: "",
    program: "",
    year_section: "",
    sex: "",
    termsAccepted: "",
  });

  useEffect(() => {
    if (formData.department) {
      setFilteredPrograms([]);
    }
    // Fetch available departments from the backend
    const fetchDepartments = async () => {
      try {
        const departmentsRes = await fetch(
          `${API_URL}/account/departments`
        );
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, [formData.department]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Determine the new value based on the input type
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "department" && { program: "" }),
    }));

    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general error message
    if (errorMessage) setErrorMessage("");

    if (name === "department") fetchPrograms(value);
  };

  const fetchPrograms = async (departmentID) => {
    try {
      const programsRes = await fetch(
        `${API_URL}/account/programs?departmentID=${departmentID}`
      );
      const programsData = await programsRes.json();
      setFilteredPrograms(programsData);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    // Clear errors when going back
    setErrorMessage("");
    setFieldErrors({});
  };

  const validateForm = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@wnu\.sti\.edu\.ph$/;
    const errors = {};

    // Step 1 validations (Personal Information)
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.idNumber) errors.idNumber = "School ID Number is required";
    if (!formData.sex) errors.sex = "Gender is required";

    // Only validate step 2 fields if we're on step 2 (Account & Academic)
    if (step === 2) {
      if (!emailPattern.test(formData.email))
        errors.email = "Valid STI WNU email is required";
      if (formData.password.length < 6)
        errors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmNewPassword)
        errors.confirmNewPassword = "Passwords don't match";
      if (!formData.department) errors.department = "Department is required";
      if (!formData.program) errors.program = "Program is required";
      if (!formData.year_section)
        errors.year_section = "Year & Section is required";
      if (!formData.termsAccepted)
        errors.termsAccepted = "You must agree to the Terms and Conditions.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/account/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idNumber: formData.idNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          program: formData.program,
          sex: formData.sex,
          year_section: formData.year_section,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "✅ Registration successful! Check your email for the verification link."
        );
        setIsLoading(false);
        
        // Save email for potential resend verification
        localStorage.setItem('pendingVerificationEmail', formData.email);
        
        // Redirect to verification page after a short delay
        setTimeout(() => {
          window.location.href = '/verify-email';
        }, 2000);
      } else {
        setErrorMessage(data.error || "Signup failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
      setIsLoading(false);
    } finally {
      setSignupClicked(false);
    }
  };

  // Helper function to render field error
  const renderFieldError = (fieldName) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <p className="text-[0.65rem] md:text-xs text-red-500">
        {fieldErrors[fieldName]}
      </p>
    );
  };

  return (
    <div className="w-full min-h-full flex justify-center items-start font-poppins py-6">
      <div className="w-full px-6 pb-6">
        {/* Step 1: Personal Information */}
        {step === 1 ? (
          <div className="space-y-3 mt-2">
            <div className="text-center mb-4">
              <img
                src={logo}
                alt="Logo"
                className="h-[60px] w-[60px] mx-auto mb-3"
              />
              <h2 className="text-lg font-bold text-[#057DCD] mb-1">
                Personal Information
              </h2>
              <p className="text-gray-600 text-xs">Tell us about yourself - Step 1 of 2</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm ${
                    fieldErrors.firstName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {renderFieldError("firstName")}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm ${
                    fieldErrors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {renderFieldError("lastName")}
              </div>
            </div>

            {/* ID Number */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ID Number
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm ${
                  fieldErrors.idNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                type="text"
                name="idNumber"
                placeholder="Enter your ID number"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
              {renderFieldError("idNumber")}
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 bg-white text-sm ${
                  fieldErrors.sex
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                name="sex"
                id="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select your gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {renderFieldError("sex")}
            </div>

            <button
              className={`w-full bg-[#057DCD] text-white py-2.5 rounded-lg font-semibold transition-all duration-200 hover:bg-[#046bc2] focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:ring-offset-2 text-sm ${
                NextClicked ? "scale-95" : "scale-100"
              }`}
              onClick={() => {
                setNextClicked(true);
                setTimeout(() => {
                  setNextClicked(false);
                  setTimeout(() => handleNext(), 500);
                }, 200);
              }}
            >
              Continue to Account Setup
            </button>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-center text-xs text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={(e) => {
                    setLoginClicked(true);
                    setTimeout(() => {
                      setLoginClicked(false);
                      setTimeout(
                        () => e.preventDefault(),
                        onSwitchToLogin(),
                        500
                      );
                    }, 150);
                  }}
                  className={`text-[#057DCD] font-semibold hover:text-[#046bc2] focus:outline-none hover:underline transition-all duration-200 ${
                    loginClicked ? "scale-95" : "scale-100"
                  }`}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        ) : (
          // Step 2: Account & Academic Details
          <div
            className={`w-full flex justify-center items-start ${
              step === 2 ? "slide-left" : "slide-right"
            }`}
          >
            <div className="flex flex-col items-center w-full animate-modal-fade">

              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-[60px] w-[60px] mx-auto mb-3"
                  />
                  <h2 className="text-lg font-bold text-[#057DCD] mb-1">
                    Account & Academic Details
                  </h2>
                  <p className="text-gray-600 text-xs">Create your account - Step 2 of 2</p>
                </div>

                {/* Department and Year & Section - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  {/* Department */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 bg-white text-sm ${
                        fieldErrors.department
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      name="department"
                      id="Department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select your department
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {renderFieldError("department")}
                  </div>

                  {/* Year & Section */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Year & Section
                    </label>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm ${
                        fieldErrors.year_section
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      type="text"
                      name="year_section"
                      placeholder="e.g., 3A"
                      value={formData.year_section}
                      onChange={handleChange}
                      required
                    />
                    {renderFieldError("year_section")}
                  </div>
                </div>

                {/* Program */}
                {formData.department && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Program
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 bg-white text-sm ${
                        fieldErrors.program
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      name="program"
                      id="Program"
                      value={formData.program}
                      onChange={handleChange}
                      required
                      disabled={!formData.department}
                    >
                      <option value="" disabled>
                        Select your program
                      </option>

                      {filteredPrograms.map((prog) => (
                        <option key={prog.programID} value={prog.programID}>
                          {prog.programName}
                        </option>
                      ))}
                    </select>
                    {renderFieldError("program")}
                  </div>
                )}

                {/* Email */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm ${
                      fieldErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {renderFieldError("email")}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm pr-10 ${
                        fieldErrors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      type={showPassword ? "text" : "password"}
                      id="Password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {/* Show/Hide Icon */}
                    {formData.password && (
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOutlined size={18} />
                        ) : (
                          <EyeInvisibleOutlined size={18} />
                        )}
                      </span>
                    )}
                  </div>
                  {renderFieldError("password")}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-transparent transition-all duration-200 text-gray-900 text-sm pr-10 ${
                        fieldErrors.confirmNewPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      type={showConfirmPassword ? "text" : "password"}
                      id="ConfirmPassword"
                      name="confirmNewPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      required
                    />
                    {/* Show/Hide Icon */}
                    {formData.confirmNewPassword &&
                      formData.confirmNewPassword.length > 0 && (
                        <span
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOutlined size={18} />
                          ) : (
                            <EyeInvisibleOutlined size={18} />
                          )}
                        </span>
                      )}
                  </div>
                  {renderFieldError("confirmNewPassword")}
                </div>                {/* General error message */}
                {successMessage && (
                  <p className="text-center text-green-500 text-sm font-medium mb-4">
                    {successMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-center text-red-500 text-sm font-medium mb-4">
                    {errorMessage}
                  </p>
                )}

                <label className={`my-4 mx-auto flex justify-center items-center text-sm md:text-sx text-gray-600 ${fieldErrors.termsAccepted ? 'text-red-500' : ''}`}>
                  <input
                    className="mr-2 w-4 h-4 border-gray-300 peer"
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                  />
                  <span className="leading-5">
                    I have read and agree to the
                    <button
                      type="button"
                      className="ml-1 text-[#057DCD] border-b-2 border-transparent hover:border-[#057DCD] transition-colors focus:outline-none"
                      onClick={() => setShowTerms(true)}
                    >
                      Terms and Conditions
                    </button>.
                  </span>
                </label>
                {renderFieldError("termsAccepted")}
                <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 ${
                      BackClicked ? "scale-95" : "scale-100"
                    }`}
                  >
                    Back
                  </button>
                  
                  <button
                    disabled={isLoading}
                    type="submit"
                    className={`flex-1 bg-[#057DCD] text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-[#046bc2] focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:ring-offset-2 flex items-center justify-center ${
                      signupClicked ? "scale-95" : "scale-100"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white mr-2"
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
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
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
