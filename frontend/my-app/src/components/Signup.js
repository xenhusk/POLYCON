import React, { useState, useEffect } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import logo from "./icons/DarkLogo.png";

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
  });

  useEffect(() => {
    if (formData.department) {
      setFilteredPrograms([]);
    }
    // Fetch available departments from the backend
    const fetchDepartments = async () => {
      try {
        const departmentsRes = await fetch(
          "http://localhost:5001/account/departments"
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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        `http://localhost:5001/account/programs?departmentID=${departmentID}`
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

    // Step 1 validations (always validate for handleNext)
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.idNumber) errors.idNumber = "School ID Number is required";
    if (!emailPattern.test(formData.email))
      errors.email = "Valid STI WNU email is required";
    if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmNewPassword)
      errors.confirmNewPassword = "Passwords don't match";

    // Only validate step 2 fields if we're on step 2
    if (step === 2) {
      if (!formData.department) errors.department = "Department is required";
      if (!formData.program) errors.program = "Program is required";
      if (!formData.year_section)
        errors.year_section = "Year & Section is required";
      if (!formData.sex) errors.sex = "Gender is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSignupClicked(true);
    setIsLoading(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch("http://localhost:5001/account/signup", {
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
        setErrorMessage(
          "Registration successful! Please check your email to verify your account."
        );
        setIsLoading(false);
        // Optionally, switch to login after a delay
        // setTimeout(() => onSwitchToLogin(), 3000);
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
    <div className="h-full w-full flex justify-center items-center font-poppins">
      <div className="flex flex-col justify-center items-center w-full p-1">
        {step === 1 ? (
          <div
            className={`w-[90%] md:[80%] lg:w-[76%] mx-auto ${
              step === 1 ? "slide-right" : "slide-left"
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              className="h-[100px] w-[100px] md:h-[130px] md:w-[130px] mx-auto"
            />
            <h2 className="text-center text-sm md:text-base lg:text-lg font-bold text-[#005B98] mb-2 md:my-2">
              Registration Form
            </h2>

            <div className="flex justify-between gap-4">
              {/* First Name */}
              <div className="relative z-0 w-full">
                <input
                  className={`block py-0.5 px-1.5 mt-2 mb-1 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                    fieldErrors.firstName
                      ? "border-red-500"
                      : "border-[#005B98]"
                  } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                  type="text"
                  name="firstName"
                  placeholder=" "
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <label
                  htmlFor="firstName"
                  className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                  First Name
                </label>
                {renderFieldError("firstName")}
              </div>

              {/* Last Name */}
              <div className="relative z-0 w-full">
                <input
                  className={`block py-0.5 px-1.5 mt-2 mb-1 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                    fieldErrors.lastName ? "border-red-500" : "border-[#005B98]"
                  } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                  type="text"
                  name="lastName"
                  placeholder=" "
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <label
                  htmlFor="lastName"
                  className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                  Last Name
                </label>
                {renderFieldError("lastName")}
              </div>
            </div>

            {/* ID Number */}
            <div className="relative z-0">
              <input
                className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                  fieldErrors.idNumber ? "border-red-500" : "border-[#005B98]"
                } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                type="text"
                name="idNumber"
                placeholder=" "
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="idNumber"
                className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >
                ID Number
              </label>
              {renderFieldError("idNumber")}
            </div>

            {/* Email */}
            <div className="relative z-0">
              <input
                className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                  fieldErrors.email ? "border-red-500" : "border-[#005B98]"
                } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                type="text"
                id="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="email"
                className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >
                Email
              </label>
              {renderFieldError("email")}
            </div>

            {/* Password */}
            <div className="relative z-0">
              <input
                className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                  fieldErrors.password ? "border-red-500" : "border-[#005B98]"
                } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                type={showPassword ? "text" : "password"}
                id="Password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="Password"
                className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >
                Password
              </label>
              {/* Show/Hide Icon */}
              {formData.password && (
                <span
                  className="absolute right-[3%] top-1.5 md:top-2.5 cursor-pointer text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOutlined size={20} />
                  ) : (
                    <EyeInvisibleOutlined size={20} />
                  )}
                </span>
              )}
              {renderFieldError("password")}
            </div>

            {/* Confirm Password */}
            <div className="relative z-0">
              <input
                className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                  fieldErrors.confirmNewPassword
                    ? "border-red-500"
                    : "border-[#005B98]"
                } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                type={showConfirmPassword ? "text" : "password"}
                id="ConfirmPassword"
                name="confirmNewPassword"
                placeholder=" "
                value={formData.confirmNewPassword}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="ConfirmPassword"
                className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >
                Confirm New Password
              </label>
              {/* Show/Hide Icon */}
              {formData.confirmNewPassword &&
                formData.confirmNewPassword.length > 0 && (
                  <span
                    className="absolute right-[3%] top-1.5 md:top-2.5 cursor-pointer text-gray-600 hover:text-gray-800"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOutlined size={20} />
                    ) : (
                      <EyeInvisibleOutlined size={20} />
                    )}
                  </span>
                )}
              {renderFieldError("confirmNewPassword")}
            </div>

            <button
              className={`bg-[#057DCD] text-white w-[100%] h-[44.59px] rounded-lg my-2 mx-auto transition-all ease-in  hover:bg-[#54BEFF] animate-modal-slide
              ${NextClicked ? "scale-90" : "scale-100"}`}
              onClick={() => {
                setNextClicked(true);
                setTimeout(() => {
                  setNextClicked(false);
                  setTimeout(() => handleNext(), 500);
                }, 200);
              }}
            >
              Next
            </button>

            <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
              <p className="text-center font-light text-[0.8rem] md:text-[0.9rem] mx-auto my-2 text-opacity-50">
                Don't have an account?
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
                  className={`text-[#005B98] ml-1 focus:outline-none hover:underline 
                    ${loginClicked ? "scale-90" : "scale-100"}`}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`w-full flex justify-center items-center ${
              step === 2 ? "slide-left" : "slide-right"
            }`}
          >
            <div className="flex flex-col items-center w-full animate-modal-fade">
              {/* Back Button */}
              {errorMessage && (
                <div className="absolute top-7 left-5 md:left-7 z-50">
                  <button
                    className={`text-gray-500 hover:text-[#000000] transition-all ease-in ${
                      BackClicked ? "scale-90" : "scale-100"
                    }`}
                    onClick={() => {
                      setBackClicked(true);
                      setTimeout(() => setBackClicked(false), 150);
                      handleBack();
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4"
                        d="m15 19-7-7 7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div className="w-[90%] md:w-[80%] lg:w-[76%] mx-auto animate-modal-slideL">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-[100px] w-[100px] md:h-[130px] md:w-[130px] mx-auto"
                />
                <h2 className="text-center text-lg font-bold text-[#005B98]">
                  Personal Information
                </h2>

                {/* Department */}
                <div className="relative z-0">
                  <select
                    className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                      fieldErrors.department
                        ? "border-red-500"
                        : "border-[#005B98]"
                    } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                    name="department"
                    id="Department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="" hidden>
                      Select Department
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="Department"
                    className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                  >
                    Department
                  </label>
                  {renderFieldError("department")}
                </div>

                {/* Program */}
                {formData.department && (
                  <div className="relative z-0">
                    <select
                      className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                        fieldErrors.program
                          ? "border-red-500"
                          : "border-[#005B98]"
                      } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                      name="program"
                      id="Program"
                      value={formData.program}
                      onChange={handleChange}
                      required
                      disabled={!formData.department}
                    >
                      <option value="" hidden>
                        Select Program
                      </option>

                      {filteredPrograms.map((prog) => (
                        <option key={prog.programID} value={prog.programID}>
                          {prog.programName}
                        </option>
                      ))}
                    </select>
                    <label
                      htmlFor="Program"
                      className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                    >
                      Program
                    </label>
                    {renderFieldError("program")}
                  </div>
                )}

                {/* Year & Section */}
                <div className="relative z-0">
                  <input
                    className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                      fieldErrors.year_section
                        ? "border-red-500"
                        : "border-[#005B98]"
                    } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                    type="text"
                    name="year_section"
                    placeholder=" "
                    value={formData.year_section}
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="year_section"
                    className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                  >
                    Year & Section
                  </label>
                  {renderFieldError("year_section")}
                </div>

                {/* Gender */}
                <div className="relative z-0">
                  <select
                    className={`block py-1 px-1.5 mt-3.5 mb-1.5 mx-auto w-full text-sm md:text-base text-gray-900 bg-transparent border-0 border-b-2 ${
                      fieldErrors.sex ? "border-red-500" : "border-[#005B98]"
                    } appearance-none dark:text-[#000000] dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                    name="sex"
                    id="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="" hidden>
                      Select Sex
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <label
                    htmlFor="sex"
                    className="absolute text-sm md:text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                  >
                    Gender
                  </label>
                  {renderFieldError("sex")}
                </div>

                {/* General error message */}
                {errorMessage && (
                  <p className="text-center text-red-500 text-[0.8rem] md:text-[0.9rem]">
                    {errorMessage}
                  </p>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className={`bg-[#057DCD] text-white w-[100%] h-[44.59px] rounded-lg my-3 mx-auto transition-all ease-in hover:bg-[#54BEFF] flex items-center justify-center
                    ${signupClicked ? "scale-90" : "scale-100"}
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={handleSubmit}
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
                      <span className="ml-2">Signing up...</span>
                    </>
                  ) : (
                    "Signup"
                  )}
                </button>

                <div className="border-t-2 border-[#005B98] w-[90%] my-2 mx-auto border-opacity-50">
                  <p className="text-center font-light text-[0.8rem] md:text-[0.9rem] mx-auto my-2 text-opacity-50">
                    Don't have an account?
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
                      className={`text-[#005B98] ml-1 focus:outline-none hover:underline 
                      ${loginClicked ? "scale-90" : "scale-100"}`}
                    >
                      Login
                    </button>
                  </p>
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
