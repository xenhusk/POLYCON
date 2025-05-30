import React, { useState, useEffect } from "react";
import logo from "../components/icons/logo2.png";
import Consult1 from "../components/icons/Consult1.jpg";
import Consult3 from "../components/icons/consult3.webp";
import Consult2 from "../components/icons/consultation.webp";
import Image1 from "../components/icons/ImageAbout.jpg";
import Image2 from "../components/icons/ImageAbout1.jpg";
import Image3 from "../components/icons/ImageAbout2.jpg";
import Login from "../components/Login";
import Signup from "../components/Signup";

const Home = () => {
  const [animateSection, setAnimateSection] = useState(null);
  const [XClicked, setXClicked] = useState(null);

  // New handler for section navigation
  const handleSectionNavigation = (sectionId) => {
    setAnimateSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      // Reset animation after completion
      setTimeout(() => setAnimateSection(null), 1000);
    }
  };

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setErrorMessage("");
  };
  const handleSignupClick = () => {
    setShowSignupModal(true);
    setErrorMessage("");
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setErrorMessage("");
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
    setErrorMessage("");
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
    setErrorMessage("");
  };

  const handleLoginError = (message) => {
    setErrorMessage(message);
  };

  const handleSignupError = (message) => {
    setErrorMessage(message);
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      <Nav
        handleLoginClick={handleLoginClick}
        handleSignupClick={handleSignupClick}
        handleSectionNavigation={handleSectionNavigation}
      />
      <Body />

      {/* About */}
      <About animateSection={animateSection} />

      {/* Contact */}
      <section
        id="Contact"
        className={`flex flex-col lg:flex-row w-full justify-between items-center ${
          animateSection === "Contact" ? "animate-gentle" : ""
        }`}
      >
        <div className="w-full h-[50rem] sm:h-[50rem] md:h-[40rem] lg:h-[43rem] p-2 relative overflow-hidden bg-[#057DCD]">
          <h1 className="w-[90%] md:w-[95%] lg:w-[92%] font-bold text-[40px] text-[#ffffff] my-[1rem] mx-auto">
            Contact
          </h1>
          <div className="absolute right-0 left-0 flex flex-col md:flex-row justify-between lg:px-5 text-[#ffffff]">
            {/* Visit Us */}
            <div className="w-full md:w-[49%] min-h-[8rem] flex flex-col items-center mt-5 p-2">
              <h3 className="font-semibold text-lg w-[86%] mx-auto">
                Visit Us
              </h3>
              <p className="font-light text-base w-[86%] mx-auto">
                Visit us in person at our Department (CICT), Service Bldg.
              </p>
              <p className="font-medium text-base w-[86%] mx-auto">
                <span>📍</span>L N Agustin Dr, Bacolod, 6100 Negros Occidental
              </p>
            </div>
            {/* Contact Form */}
            <form className="flex flex-col w-full md:w-[46%] mx-auto mt-4 mb-2 lg:mt-0">
              <h3 className="font-semibold text-base lg:text-lg w-[70%] md:w-full lg:w-[70%] mx-auto">
                Get in touch with us!
              </h3>
              <p className="font-light text-sm lg:text-base w-[70%] md:w-full lg:w-[70%] mx-auto">
                Tell us about you.
              </p>
              <div className="flex flex-col sm:flex-row mx-auto w-[70%] md:w-full lg:w-[70%] gap-2 my-2">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full md:w-[50%] h-[6vh] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full md:w-[50%] h-[6vh] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-[70%] md:w-full lg:w-[70%] h-[6vh] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black my-2 mx-auto"
              />
              <textarea
                placeholder="Leave a message"
                rows="4"
                className="w-[70%] md:w-full lg:w-[70%] h-[15vh] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black my-2 mx-auto"
              ></textarea>
              <button
                type="submit"
                className="w-[70%] md:w-full lg:w-[70%] h-[6vh] bg-[#ffffff] text-[#057DCD] rounded-[10px] text-lg font-semibold transition-all duration-800 ease-in-out delay-150 hover:bg-[#0464a7] hover:text-[#ffffff] my-2 mx-auto"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="flex flex-col w-full justify-between items-center">
        <div className="w-full min-h-[15rem] sm:min-h-[16rem] md:min-h-[13.5rem] lg:min-h-[15.5rem] relative overflow-hidden bg-[#005B98]">
          {/* Main Content Container */}
          <div className="w-full min-h-[11rem] md:w-[93%] md:min-h-[10rem] lg:min-h-[12rem] px-4 md:px-0 absolute right-0 left-0 mx-auto flex flex-col md:flex-row md:justify-between items-center lg:items-end text-white">
            {/* Logo & Development Info */}
            <div className="w-full md:w-[50%] lg:w-[45%] flex flex-col items-center md:items-start justify-end pt-4 md:pt-0 lg:pt-4">
              <img
                src={logo}
                alt="Logo"
                className="h-[100px] w-[100px] md:h-[85px] md:w-[85px] lg:h-[98px] lg:w-[98px]"
              />
              <div className="text-start md:text-left mt-4 md:mt-4 hidden md:block">
                <h3 className="font-medium text-base md:text-lg">
                  We are still development
                </h3>
                <p className="font-light text-xs md:text-sm mt-1">
                  Polycon, 2024
                </p>
              </div>
            </div>

            {/* Legal Links - Hidden on Mobile */}
            <div className="hidden md:flex flex-col md:w-[45%] lg:w-[40%] items-end justify-end pl-14 md:pt-14 lg:pt-0">
              <h3 className="font-medium text-base lg:text-lg mb-4 md:mr-48 lg:mr-56">
                Legal
              </h3>
              <div className="flex flex-col items-start space-y-3">
                <div className="flex gap-6 font-light text-sm lg:text-base">
                  <p className="hover:text-gray-200 cursor-pointer">
                    Terms of Service
                  </p>
                  <p className="hover:text-gray-200 cursor-pointer">
                    Cookies Policy
                  </p>
                </div>
                <div className="flex gap-8 font-light text-sm lg:text-base">
                  <p className="hover:text-gray-200 cursor-pointer">
                    Privacy Policy
                  </p>
                  <p className="hover:text-gray-200 cursor-pointer">
                    Data Processing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="w-[95%] absolute bottom-0 left-1/2 transform -translate-x-1/2 border-t border-white/30 flex justify-center items-center">
            <div className="w-[98%] mx-auto py-4 px-2 lg:px-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Copyright */}
                <p className="text-xs md:text-sm font-light text-white text-left">
                  © 2024 Polycon Inc. All rights reserved.
                </p>

                {/* Social Icons */}
                <div className="flex justify-center md:justify-end gap-6">
                  <ul className="flex items-center gap-6">
                    {/* Social Icons with hover effects */}
                    <li>
                      <svg
                        className="w-5 h-5 text-white hover:text-gray-200 transition-colors cursor-pointer"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </li>
                    <li>
                      <svg
                        className="w-5 h-5 text-white hover:text-gray-200 transition-colors cursor-pointer"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </li>
                    <li>
                      <svg
                        className="w-5 h-5 text-white hover:text-gray-200 transition-colors cursor-pointer"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-50">
        <button
          className="w-12 h-12 bg-[#057DCD] hover:bg-[#54BEFF] text-white text-3xl font-bold 
            rounded-full shadow-lg hover:shadow-xl 
            transform hover:scale-110
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            border-2 border-white
            animate-bounce hover:animate-none"
        >
          <span>?</span>
        </button>
      </div>

      {/* Modals */}
      {showLoginModal || showSignupModal ? (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center animate-modal-fade z-50"
          onClick={closeModal}
        >
          <div
            className={`bg-white p-2 rounded-[20px] shadow-lg w-[90%] h-[88vh] md:w-[65%] md:h-[90vh] lg:w-[50%] lg:h-[94vh] relative overflow-hidden
            ${
              showLoginModal || showSignupModal ? "modal-enter" : "modal-exit"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className={`absolute top-8 right-7 z-50`}
              onClick={(e) => {
                setXClicked(true);
                setTimeout(() => {
                  setXClicked(false);
                  setTimeout(() => e.preventDefault(), closeModal(), 500);
                }, 200);
              }}
            >
              <svg
                className="w-6 h-6 text-gray-500 hover:text-[#000000]"
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
                  d="M6 18 17.94 6M18 18 6.06 6"
                />
              </svg>
            </button>

            {/* Login/Signup content */}
            <div
              className={`relative h-full ${
                showSignupModal ? "slide-left" : ""
              }`}
            >
              {showLoginModal && (
                <div
                  className={`absolute w-full h-full justify-center items-center ${
                    showSignupModal ? "-translate-x-full" : "translate-x-0"
                  } transition-transform duration-300`}
                >
                  <Login
                    onLoginSuccess={closeModal}
                    onSwitchToSignup={switchToSignup}
                    onError={handleLoginError}
                  />
                </div>
              )}

              {showSignupModal && (
                <div
                  className={`absolute w-full h-full ${
                    showLoginModal ? "translate-x-full" : "translate-x-0"
                  } transition-transform duration-300`}
                >
                  <Signup
                    onSwitchToLogin={switchToLogin}
                    onError={handleSignupError}
                  />
                </div>
              )}
            </div>

            {/* Error message display */}
            {errorMessage && (
              <p className="text-red-500 mt-4 text-center fade-in">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Nav = ({
  handleLoginClick,
  handleSignupClick,
  handleSectionNavigation,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [SignUpClicked, setSignUpClicked] = useState(false);
  const [LoginClicked, setLoginClicked] = useState(false);
  const [ContactClicked, setContactClicked] = useState(false);
  const [AboutClicked, setAboutClicked] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="flex w-full justify-between items-center my-3">
      <div
        className={`w-[36.5%] sm:w-[30%] md:w-[90%] h-[15vh] lg:h-[18.5vh] relative transition-all duration-300`}
      >
        <div
          className="rounded-br-[30px] md:rounded-br-[45px] lg:rounded-br-[60px] 
                       rounded-tr-[30px] md:rounded-tr-[45px] lg:rounded-tr-[60px] 
                       absolute bottom-0 right-0 left-0 
                       flex justify-between items-center 
                       h-[12vh] lg:h-[15vh] w-full 
                       bg-[#057DCD] px-2.5 md:px-6 lg:px-8"
        >
          {/* Logo */}
          <a href="#Body" className="flex-shrink-0">
            <img
              src={logo}
              alt="Logo"
              className="h-[80px] w-[80px] md:h-[100px] md:w-[100px] lg:h-[130px] lg:w-[130px] 
                          object-contain transition-all duration-300"
            />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-white transition-transform duration-700 delay-300 ease-in-out" // Increased duration from 200 to 500
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              )}
            </svg>
          </button>

          {/* Desktop/Tablet Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <ul className="flex items-center gap-4 lg:gap-[25px]">
              <li>
                <button
                  onClick={() => {
                    setContactClicked(true);
                    setTimeout(() => setContactClicked(false), 200);
                    handleSectionNavigation("Contact");
                  }}
                  className={`text-base lg:text-xl text-white font-medium focus:outline-none relative group 
                           ${ContactClicked ? "scale-75" : "scale-100"}`}
                >
                  Contact
                  <span
                    className="block absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 
                                 ease-in-out group-hover:w-full"
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setAboutClicked(true);
                    setTimeout(() => setAboutClicked(false), 200);
                    handleSectionNavigation("About");
                  }}
                  className={`text-base lg:text-xl text-white font-medium focus:outline-none relative group 
                           ${AboutClicked ? "scale-75" : "scale-100"}`}
                >
                  About
                  <span
                    className="block absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 
                                 ease-in-out group-hover:w-full"
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setLoginClicked(true);
                    setTimeout(() => setLoginClicked(false), 300);
                    handleLoginClick();
                  }}
                  className={`bg-white text-base lg:text-xl text-[#057DCD] w-[6rem] lg:w-[8rem] h-[45px] lg:h-[55px] 
                           rounded-[50px] font-semibold transition-all duration-100 ease-in delay-50 
                           hover:bg-[#54BEFF] hover:text-white ${
                             LoginClicked ? "scale-90" : "scale-100"
                           }`}
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSignUpClicked(true);
                    setTimeout(() => setSignUpClicked(false), 300);
                    handleSignupClick();
                  }}
                  className={`bg-white text-base lg:text-xl text-[#057DCD] w-[6rem] lg:w-[8rem] h-[45px] lg:h-[55px] 
                           rounded-[50px] font-semibold transition-all duration-100 ease-in delay-50 
                           hover:bg-[#54BEFF] hover:text-white ${
                             SignUpClicked ? "scale-90" : "scale-100"
                           }`}
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-screen bg-[#057DCD] transform transition-transform duration-700 delay-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } z-40 md:hidden`}
        >
          <button onClick={toggleMenu} className="absolute top-14 right-5 z-50">
            <svg
              className="w-8 h-8 text-white transition-transform duration-500 ease-in-out" // Increased duration from 200 to 500
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative h-full w-full flex flex-col p-6 justify-center items-center">
            <ul className="flex flex-col items-center gap-8 w-full">
              <li>
                <button
                  onClick={() => {
                    setContactClicked(true);
                    setTimeout(() => {
                      setContactClicked(false);
                      handleSectionNavigation("Contact");
                      setIsMenuOpen(false);
                    }, 200);
                  }}
                  className={`text-lg text-white font-medium focus:outline-none relative group 
                           ${ContactClicked ? "scale-90" : "scale-100"}`}
                >
                  Contact
                  <span
                    className="block absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 
                                 ease-in-out group-hover:w-full"
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setAboutClicked(true);
                    setTimeout(() => {
                      setAboutClicked(false);
                      handleSectionNavigation("About");
                      setIsMenuOpen(false);
                    }, 200);
                  }}
                  className={`text-lg text-white font-medium focus:outline-none relative group 
                           ${AboutClicked ? "scale-90" : "scale-100"}`}
                >
                  About
                  <span
                    className="block absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 
                                 ease-in-out group-hover:w-full"
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setLoginClicked(true);
                    setTimeout(() => {
                      setLoginClicked(false);
                      handleLoginClick();
                      setIsMenuOpen(false);
                    }, 300);
                  }}
                  className={`bg-white text-base text-[#057DCD] w-[12rem] h-[45px] 
                           rounded-[50px] font-semibold transition-all duration-100 ease-in delay-50 
                           hover:bg-[#54BEFF] hover:text-white ${
                             LoginClicked ? "scale-90" : "scale-100"
                           }`}
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSignUpClicked(true);
                    setTimeout(() => {
                      setSignUpClicked(false);
                      handleSignupClick();
                      setIsMenuOpen(false);
                    }, 300);
                  }}
                  className={`bg-white text-base text-[#057DCD] w-[12rem] h-[45px] 
                           rounded-[50px] font-semibold transition-all duration-100 ease-in delay-50 
                           hover:bg-[#54BEFF] hover:text-white ${
                             SignUpClicked ? "scale-90" : "scale-100"
                           }`}
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Body = () => {
  const images = [Consult1, Consult2, Consult3];
  const [currentImage, setCurrentImage] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);

      setTimeout(() => {
        setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
        setIsFading(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="Body"
      className="flex flex-col md:flex-row w-full justify-between items-center mt-10"
    >
      <div className="w-full h-[48rem] sm:h-[45rem] md:h-[38rem] lg:h-[40rem] relative">
        <div
          className="rounded-[25px] w-[94%] h-[42rem] sm:h-[40rem] md:h-[35rem] lg:h-[36rem] bg-[#057DCD] mx-auto
      absolute right-0 left-0 top-0 flex flex-col md:flex-row justify-between items-center p-2"
        >
          <div className="w-full md:w-[50%] min-h-[16rem] sm:min-h-[16rem] md:h-[30rem] lg:h-[33rem] md:flex md:flex-col text-[#ffffff] text-justify md:items-center md:justify-center px-2 md:px-0 md:pr-3 mt-6 md:mt-0 mx-auto order-1 md:order-none">
            <h1 className="text-xl md:text-[2rem] lg:text-[3rem] font-extrabold leading-tight w-full md:w-[90%]">
              POLYCON:
              <br /> CONSULTATION <br className="hidden md:block" /> SYSTEM
            </h1>
            <h3 className="mt-2 text:base lg:text-lg w-full md:w-[93%]">
              Our consultation system simplifies the process of booking
              appointments, whether for individual consultations or group
              sessions.
            </h3>
            <h6 className="mt-3 text-xs lg:text-sm font-light w-full md:w-[93%]">
              Designed to enhance convenience and efficiency, it ensures
              seamless scheduling, real-time updates, and a hassle-free
              experience for both teachers and students. With user-friendly
              features and an intuitive interface, our system makes managing
              consultations effortless.
            </h6>
          </div>

          <div className="w-[92%] h-[25rem] md:h-[37rem] md:w-[70%] lg:h-[38rem] lg:w-[50%] rounded-[25px] overflow-hidden absolute bottom-[-10vh] md:bottom-0 md:right-3 md:relative md:mt-[4.5rem] lg:mt-[5.2rem] order-2 md:order-none">
            <img
              src={images[currentImage]}
              alt="Consultation Image"
              className={`absolute top-0 left-0 h-full w-full object-fill transition-opacity duration-1000 ease-in-out ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white to-[#005B98] opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const About = ({ animateSection }) => {
  const images = [Image1, Image2, Image3];
  const [currentImgAbout, setCurrentImgAbout] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);

      setTimeout(() => {
        setCurrentImgAbout((prevIndex) => (prevIndex + 1) % images.length);
        setIsFading(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  return (
    <section
      id="About"
      className={`flex w-full justify-between items-center ${
        animateSection === "About" ? "animate-gentle" : ""
      }`}
    >
      <div className="w-full h-[46rem] md:h-[40rem] lg:h-[43rem] relative overflow-hidden items-center text-center">
        {/* Header */}
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl text-[#057DCD] text-center mt-2 md:mt-8 mb-1">
          About
        </h1>

        {/* Decorative elements with responsive positioning */}
        <div className="rounded-[25px] bg-[#005B98] h-[10vh] lg:h-[13vh] w-[10%] lg:w-[8%] absolute top-[5%] md:top-[4%] right-[-4%] md:right-[1%] rotate-[30deg]"></div>
        <div className="rounded-[25px] bg-[#057DCD] h-[25vh] w-[12%] justify-end hidden md:block absolute top-[82%] left-[92%] rotate-[20deg]"></div>

        <div className="absolute right-0 left-0 flex flex-col justify-start md:justify-center items-center px-4 md:px-5 h-[42rem] md:h-[32.5rem] lg:h-[39rem]">
          {/* Decorative elements */}
          <div className="rounded-[15px] bg-[#54BEFF] h-[7vh] w-[16%] md:w-[10%] lg:w-[8%] absolute bottom-[41.2vh] md:bottom-[10vh] left-[-3%] md:left-[54%] lg:left-[52%] right-0 rotate-[15deg]"></div>
          <div className="rounded-[25px] bg-[#057DCD] h-[14vh] md:h-[20vh] lg:h-[12vh] w-[36%] md:w-[36%] lg:w-[32%] justify-end absolute bottom-[-10vh] md:bottom-[-20vh] lg:bottom-[-5vh] left-[80%] md:left-[43%] right-0 rotate-[172deg]"></div>

          {/* Content Container */}
          <div className="w-full flex justify-center md:justify-end md:w-full lg:mb-10 z-10">
            <div className="w-[90%] md:w-[45%] lg:mr-5 flex-col text-justify items-center justify-center space-y-2">
              <h3 className="font-medium text-base md:text-lg lg:text-2xl text-center w-full mb-2 md:mb-4">
                POLYCON (Consultation System)
              </h3>

              <p className="text-[0.73rem] md:text-sm lg:text-base leading-relaxed w-full">
                We are a group of passionate individuals dedicated to creating
                innovative solutions that address real-world challenges. POLYCON
                is the result of our collective effort to design a system that
                simplifies processes and enhances communication.
                <br />
                <br className="hidden lg:block" />
                The team behind POLYCON includes David Paul Desuyo, Kurt
                Zhynkent Canja, Clark Jim Gabiota, and Kyrell Santillan.
                Together, as the Develorant group, we are 3rd-year Bachelor of
                Science in Computer Science students at STI West Negros
                University.
                <br />
                <br className="hidden lg:block" />
                POLYCON reflects our belief in the potential of technology to
                bridge gaps and improve lives. Thank you for supporting our
                work!
              </p>
            </div>
          </div>

          {/* Image Container */}
          <div className="w-[100%] h-[26rem] md:w-[50%] md:h-[30rem] lg:h-[36rem] absolute bottom-0 right-0 left-0 z-10">
            <img
              src={images[currentImgAbout]}
              alt="Consultation Image"
              className={`absolute bottom-0 lg:bottom-[9%] left-[5%] md:left-[8%] 
                h-[22rem] w-[90%]
                md:h-[32rem] md:w-[96%] 
                lg:h-[36rem] lg:w-[92%] 
                rounded-[25px] object-cover transition-opacity duration-1000 ease-in-out ${
                  isFading ? "opacity-0" : "opacity-100"
                }`}
            />
            <div
              className={`absolute bottom-0 lg:bottom-[9%] left-[5%] md:left-[8%] 
                h-[22rem] w-[90%]
                md:h-[32rem] md:w-[96%] 
                lg:h-[36rem] lg:w-[92%] 
                rounded-[25px] bg-gradient-to-b from-white to-[#005B98] opacity-50`}
            />
          </div>

          {/* Background Element */}
          <div className="w-[85%] md:w-[45%] h-[20rem] md:h-[24rem] lg:h-[28rem] bg-[#057DCD] rounded-tr-[20px] absolute bottom-[-15vh] md:bottom-[-12vh] left-0"></div>
        </div>
      </div>
    </section>
  );
};

export default Home;
