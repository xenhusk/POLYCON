import React from "react";
import { useNavigate } from "react-router-dom";
import PolyconLogo from "./icons/Polycon.svg";

const AdminHelp = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 mb-8">
      <div className="flex items-center mb-6">
        <PolyconLogo style={{ height: 48, marginRight: 16 }} />
        <h1 className="text-3xl font-bold text-[#0065A8]">Polycon Admin Help</h1>
      </div>
      <p className="mb-4 text-gray-700">
        Welcome, <span className="font-semibold">Admin</span>! This guide will help you manage users, courses, departments, programs, semesters, and consultations in Polycon. Below are step-by-step instructions and tips for each admin feature.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-[#057DCD]">1. User Management</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>View, search, add, edit, or delete users (students, teachers, admins).</li>
        <li>Use the <span className="font-mono">Add User</span> button to create a new user. Fill in all required fields. For students, select department, program, and year/section.</li>
        <li>Edit or delete users using the corresponding buttons in the user list.</li>
        <li>Use the search bar to quickly find users by name, ID, or email.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-[#057DCD]">2. Courses, Departments, and Programs</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Manage <b>Courses</b>: Add, edit, delete, and filter courses. Assign courses to departments and programs.</li>
        <li>Manage <b>Departments</b>: Add, edit, delete, and filter departments. Each department can have multiple programs.</li>
        <li>Manage <b>Programs</b>: Add, edit, delete, and filter programs. Programs are linked to departments.</li>
        <li>Use the filter and search features to quickly find and manage items.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-[#057DCD]">3. Semester Management</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Start or end a semester. Set the school year and semester (1st/2nd).</li>
        <li>Activate teachers for the new semester. Use the search and filter to find teachers by department.</li>
        <li>End a semester when all activities are complete. Confirm before ending, as this action is important.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-[#057DCD]">4. Consultations & Leaderboard</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>View teacher consultation stats and leaderboard.</li>
        <li>Filter by semester, school year, or department. Search for teachers by name.</li>
        <li>Click a teacher to view detailed consultation sessions.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-[#057DCD]">5. General Tips</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>For security, always <b>logout</b> when finished (top right corner).</li>
        <li>On mobile/tablet, some admin features may be limited. For full access, use a desktop or laptop.</li>
        <li>If you encounter issues, try refreshing the page or logging out and back in.</li>
        <li>Contact your system administrator for further help.</li>
      </ul>

      <div className="mt-8 flex flex-col gap-2">
        <button
          className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition"
          onClick={() => navigate("/admin")}
        >
          Go to Admin Portal
        </button>
        <button
          className="bg-gray-200 text-[#057DCD] px-6 py-2 rounded-lg shadow-md hover:bg-gray-300 transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default AdminHelp;
