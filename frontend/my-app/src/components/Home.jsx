import React, { useState } from "react";
import logo from "./logo2.png";
import heroImage from "./icons/hero.image.jpg";
import aboutUs from "./icons/about.jpg";
import Login from "./Login";
import Signup from "./Signup";

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  const handleSignupClick = () => setShowSignupModal(true);
  const closeModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Navbar */}
      <nav className="bg-[#057DCD] p-5 flex justify-between items-center shadow-md rounded-r-full px-8 mt-6 mr-20">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Polycon Logo" className="h-12" />
        </div>
        <div className="flex items-center space-x-7">
          <a href="#about" className="text-white text-lg hover:underline">
            About
          </a>
          <a href="#contact" className="text-white text-lg hover:underline">
            Contact
          </a>
          <button
            className="bg-white text-[#057DCD] px-6 py-2 rounded-full text-lg font-semibold shadow-md hover:bg-[#54BEFF] hover:text-white"
            onClick={handleLoginClick}
          >
            Login
          </button>
          <button
            className="bg-white text-[#057DCD] px-6 py-2 rounded-full text-lg font-semibold shadow-md hover:bg-[#54BEFF] hover:text-white"
            onClick={handleSignupClick}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[400px] w-[95%] mx-auto flex flex-col md:flex-row justify-between items-center p-10 bg-[#057DCD] text-white rounded-3xl shadow-lg relative mt-10">
        {/* Left Side: Text Content */}
        <div className="flex-1 p-[1rem]">
          <h1 className="text-5xl font-extrabold leading-tight">
            POLYCON: CONSULTATION SYSTEM
          </h1>
          <h2 className="mt-2 text-lg">
            Our consultation system simplifies the process of booking
            appointments, whether for individual consultations or group
            sessions.
          </h2>
          <h4 className="mt-3 text-sm">
            Designed to enhance convenience and efficiency, it ensures seamless
            scheduling, real-time updates, and a hassle-free experience for both
            teachers and students. With user-friendly features and an intuitive
            interface, our system makes managing consultations effortless.
          </h4>
        </div>

        {/* Right Side: Overlapping Image */}
        <div className="relative flex-1 flex justify-end">
          <img
            src={heroImage}
            alt="Consultation"
            className="rounded-xl shadow-lg max-w-sm md:max-w-md lg:max-w-lg -bottom-32 md:-bottom-20 right-0 h-auto md:h-[400px] object-cover"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="text-center mt-10">
        <h1 className="text-4xl font-bold text-[#057DCD] text-center md:text-center">
          About
        </h1>
      </section>
      <section
        id="about"
        className="w-[100%] mx-auto flex flex-col md:flex-row justify-between items-center p-10 bg-white relative mt-10 min-h-[450px]"
      >
        {/* Left Section - Image */}
        <div className="relative flex-1 flex justify-start">
          {/* Blue Background */}
          <div className="absolute -top-6 -left-6 w-[105%] h-[105%] bg-[#057DCD] rounded-2xl z-0"></div>

          {/* Image */}
          <img
            src={aboutUs}
            alt="About Polycon"
            className="relative rounded-2xl shadow-lg w-full max-w-sm md:max-w-md lg:max-w-lg h-auto md:h-[400px] object-cover z-10"
          />
        </div>

        {/* Right Section - Text Content */}
        <div className="flex-1 text-left p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            POLYCON (Consultation System)
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed">
            We are a group of passionate individuals dedicated to creating
            innovative solutions that address real-world challenges. POLYCON is
            the result of our collective effort to design a system that
            simplifies processes and enhances communication.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            The team behind POLYCON includes{" "}
            <b>
              David Paul Desuyo, Kurt Zhynkent Canja, Clark Jim Gabiota, and
              Kyrell Santillan.
            </b>
            Together, as the **Develorant group**, we are 3rd-year Bachelor of
            Science in Computer Science students at **STI West Negros
            University**. POLYCON reflects our belief in the potential of
            technology to bridge gaps and improve lives. Thank you for
            supporting our work!
          </p>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="bg-[#057DCD] text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Info */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold mb-6">Contact</h2>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Visit Us</h3>
                <p className="text-lg">
                  Visit us in person at our department (CICT), Service Bldg.
                </p>
                <div className="flex items-start space-x-2">
                  <span>📍</span>
                  <p className="font-medium">
                    L N Agustin Dr, Bacolod, 6100 Negros Occidental
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <form className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
              <h3 className="text-[#057DCD] text-2xl font-bold">
                Get in touch with us!
              </h3>
              <p className="text-gray-600">Tell us about you.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black"
                />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black"
              />

              <textarea
                placeholder="Leave a message"
                rows="4"
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-[#057DCD] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#0464a7] transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[#034C8C] text-white mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Middle Column - Development Info (Moved to Left) */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <img src={logo} alt="Polycon Logo" className="h-16" />
              <p className="text-lg font-medium text-center md:text-left">
                We are still in development
              </p>
              <p className="text-sm">Polycon, 2024</p>
            </div>

            {/* Copyright Section (Centered on mobile) */}
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm mb-4">
                © 2024 Polycon Inc. All rights reserved.
              </p>
            </div>

            {/* Right Column - Legal Links */}
            <div className="flex flex-col items-center md:items-end space-y-2">
              <h4 className="font-bold text-lg">Legal</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-center md:text-right">
                <a href="#" className="hover:underline text-sm">
                  Terms of Service
                </a>
                <a href="#" className="hover:underline text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="hover:underline text-sm">
                  Cookies Policy
                </a>
                <a href="#" className="hover:underline text-sm">
                  Data Processing
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>
            <Login onLoginSuccess={closeModal} onSwitchToSignup={switchToSignup} />
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>
            <Signup onSwitchToLogin={switchToLogin} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
