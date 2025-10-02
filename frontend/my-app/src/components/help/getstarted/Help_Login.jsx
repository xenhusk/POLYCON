import React, { useContext } from "react";
import {
    FaUser,
    FaLock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaInfoCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { HelpContext } from "../HelpContext";

const helpContent = {
    main: {
        title: "Logging In to Your POLYCON Account",
        subtitle: "Follow these steps to securely access your POLYCON dashboard.",
    },
    sections: [
        {
            id: "login_steps",
            title: "Step-by-Step Login Guide",
            content: (
                <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 shadow-md">
                            1
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Go to the Login Page
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Visit the official POLYCON login page provided by your
                                institution.
                            </p>
                            <div className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
                                <div className="flex items-center mb-2">
                                    <FaInfoCircle className="text-[#0056a6] mr-2" />
                                    <span className="font-medium text-[#0056a6]">
                                        POLYCON Login
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    disabled
                                    placeholder="Institutional Email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 bg-gray-50 text-gray-700 placeholder-gray-400"
                                />
                                <input
                                    type="password"
                                    disabled
                                    placeholder="Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400"
                                />
                                <button className="w-full mt-4 bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white py-2 rounded-md font-medium shadow hover:shadow-lg transition-all duration-200 cursor-not-allowed">
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 shadow-md">
                            2
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Enter Your Credentials
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Use your institutional email (
                                <span className="font-mono text-[#0056a6]">
                                    yourname@wnu.sti.edu.ph
                                </span>
                                ) and your password. Make sure your credentials are correct.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-md p-4 bg-blue-50">
                                    <p className="text-xs text-gray-700 mb-1 font-semibold">
                                        Accepted Email Format
                                    </p>
                                    <span className="inline-block bg-white px-2 py-1 rounded text-[#0056a6] font-mono text-xs border border-gray-300">
                                        student123@wnu.sti.edu.ph
                                    </span>
                                </div>
                                <div className="border border-gray-200 rounded-md p-4 bg-red-50">
                                    <p className="text-xs text-gray-700 mb-1 font-semibold">
                                        Not Accepted
                                    </p>
                                    <span className="inline-block bg-white px-2 py-1 rounded text-red-600 font-mono text-xs border border-gray-300">
                                        student123@gmail.com
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-[#0056a6] to-[#0078e7] text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 shadow-md">
                            3
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Access Your Dashboard
                            </h3>
                            <p className="text-gray-600 mb-4">
                                After successful login, you will be redirected to your POLYCON
                                dashboard where you can book consultations, view appointments,
                                and manage your account.
                            </p>
                            <div className="border border-gray-200 rounded-lg shadow-sm p-4 bg-green-50 flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2" />
                                <span className="text-green-700 font-medium">
                                    Login Successful!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "troubleshooting",
            title: "Troubleshooting Login Issues",
            content: (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 pl-2">
                    <li>
                        Make sure you are using your official institutional email address.
                    </li>
                    <li>
                        Check that your password is correct and that Caps Lock is off.
                    </li>
                    <li>
                        If you forgot your password, use the{" "}
                        <span className="font-medium text-[#0056a6]">Forgot Password</span>{" "}
                        link on the login page to reset it.
                    </li>
                    <li>
                        If you have not verified your email, check your inbox (and spam
                        folder) for the verification link.
                    </li>
                    <li>
                        If you are still unable to login, contact your institution’s IT
                        support or POLYCON administrator.
                    </li>
                </ul>
            ),
        },
        {
            id: "security_reminder",
            title: "Security Reminder",
            content: (
                <p className="text-sm text-gray-600">
                    For your security, always log out after using POLYCON, especially on shared devices.
                </p>
            ),
        },
    ],
};

const Help_Login = () => {
    const { searchQuery } = useContext(HelpContext);

    const filteredSections = helpContent.sections.filter((section) => {
        const titleMatch = section.title.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch =
            typeof section.content === 'string'
                ? section.content.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
        return titleMatch || contentMatch;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
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

            {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                    <div
                        key={section.id}
                        id={section.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
                    >
                        <div className="flex items-center mb-6">
                            {section.id === 'login_steps' && (
                                <div className="bg-[#0056a6] p-2 rounded-full mr-3">
                                    <FaUser className="text-white text-xl" />
                                </div>
                            )}
                            {section.id === 'troubleshooting' && (
                                <div className="bg-yellow-500 p-2 rounded-full mr-3">
                                    <FaExclamationTriangle className="text-white text-xl" />
                                </div>
                            )}
                            {section.id === 'security_reminder' && (
                                <div className="bg-[#0056a6] p-2 rounded-full mr-3">
                                    <FaLock className="text-white text-xl" />
                                </div>
                            )}
                            <h2 className="text-xl font-semibold text-[#0056a6]">
                                {section.title}
                            </h2>
                        </div>
                        {section.content}
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 text-lg py-8">
                    <p>No results found for "{searchQuery}".</p>
                </div>
            )}
        </motion.div>
    );
};

export default Help_Login;