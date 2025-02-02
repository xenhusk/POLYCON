import React, { useState, useEffect } from "react";
import logo from "./icons/logo2.png";
import Consult1 from "./icons/Consult1.jpg";
import Consult3 from "./icons/consult3.webp";
import Consult2 from "./icons/consultation.webp";
import Image1 from "./icons/ImageAbout.jpg";
import Image2 from "./icons/ImageAbout1.jpg";
import Image3 from "./icons/ImageAbout2.jpg";
import Login from "./Login";
import Signup from "./Signup";

const Home = () => {
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
      <nav className="flex w-full justify-between items-center my-3">
        <div className="w-[1346px] h-[134px] relative">
          <div className="rounded-br-[60px] rounded-tr-[60px] absolute bottom-0 right-0 left-0 flex h-[124px] w-full flex-1 bg-[#057DCD] justify-end items-center p-5 md:px-5 sm:p-5">
            <a href="#Body">
              <img src={logo} alt="Logo" className="flex left-[25.39px] h-[135px] w-[135px] my-auto object-contain"/>
            </a>
            <div className="w-[42%] flex items-end justify-end gap-5 md:w-full sm:mr-[15px]">
              <ul className="gap-[25px] flex flex-wrap items-center">
                <li> 
                  <a href="#Contact" className="text-[20px] text-white font-medium transition-all duration-800 ease-in-out delay-150 hover:underline underline-offset-4 focus:outline-none">
                      Contact
                  </a>
                </li>
                <li>
                  <a href="#About" className="text-[20px] text-white font-medium transition-all duration-800 ease-in-out delay-150 hover:underline underline-offset-4 focus:outline-none">
                      About
                  </a>
                </li>
                <li>
                  <button className="bg-white text-[20px] text-[#057DCD] px-auto w-[150px] h-[55px] rounded-[50px] px-auto text-lg font-semibold transition-all duration-800 ease-in-out delay-150 hover:bg-[#54BEFF] hover:text-white"
                    onClick={handleLoginClick}>
                      Login
                  </button>
                </li>
                <li>
                  <button
                    className="bg-white text-[20px] text-[#057DCD] text-center w-[150px] h-[55px] rounded-[50px] px-auto text-lg font-semibold transition-all duration-800 ease-in-out delay-150 hover:bg-[#54BEFF] hover:text-white"
                    onClick={handleSignupClick}>
                      Sign Up
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <Body/>

      {/* About */}
      <About/>


      {/* Contact */}
      <section id="Contact"  className="flex w-full justify-between items-center">
        <div className="w-full h-[659px] relative overflow-hidden bg-[#057DCD]">
          <h1 className="w-[1365px] font-bold text-[40px] text-[#ffffff] my-[33px] mx-auto">
            Contact
          </h1>
          <div className="absolute right-0 left-0 flex flex-1 justify-between md:px-5 text-[#ffffff]">
            <div className="w-[720px] h-[138px] flex-row top-0">
              <h3 className="font-semibold text-lg w-[620px] mx-auto">
                Visit Us
              </h3>
              <p className="font-light text-base w-[620px] mx-auto">
                  Visit us in person at our Department (CICT), Service Bldg.
              </p>
              <p className="font-medium text-base w-[620px] mx-auto">
                <span>📍</span>L N Agustin Dr, Bacolod, 6100 Negros Occidental
              </p>
            </div>
            <form className="flex flex-col w-[720px]">
              <h3 className="font-semibold text-lg w-[458px] mx-auto">
                Get in touch with us!
              </h3>
              <p className="font-light text-base w-[458px] mx-auto">
                Tell us about you.
              </p>
              <div className="flex mx-auto">
                <input type="text"placeholder="First Name"className="w-[224px] h-[44.59px] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black my-2"/>
                <input type="text" placeholder="Last Name" className="w-[224px] h-[44.59px] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black my-2 ml-2"/>
              </div>
              <input type="email" placeholder="Email Address" className="w-[458px] h-[44.59px] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black my-2 mx-auto"/>
              <textarea placeholder="Leave a message" rows="4" className="w-[458px] h-[132px] p-3 rounded-lg border border-gray-200 focus:border-[#057DCD] focus:ring-2 focus:ring-[#057DCD]/50 outline-none transition-all text-black my-2 mx-auto">
              </textarea>
              <button type="submit" className="w-[458px] h-[44.59px] bg-[#ffffff] text-[#057DCD] px-auto rounded-[10px] text-lg font-semibold transition-all duration-800 ease-in-out delay-150 hover:bg-[#0464a7] hover:text-[#ffffff] my-2 mx-auto">
                Submit
              </button>
            </form>
          </div>
        </div>
    </section>


      {/* footer */}
      <footer className="flex w-full justify-between items-center">
        <div className="w-full h-[226px] relative overflow-hidden bg-[#005B98]">
          <div className="h-[160px] w-[1290px] absolute right-0 left-0 justify-between mx-auto flex-1 flex text-[#ffffff]">
            <div className="flex-row w-[645px] h-[152px] ml-2">  
              <img src={logo} alt="Logo" className="h-[98px] w-[98px]"/>
              <h3 className="font-medium text-lg">
                We are still development
              </h3>
              <p className="font-light text-[13px] w-[304px]">
                Polycon, 2024
              </p>
            </div>
            <div className="flex-row w-[304px] h-[152px] my-[60px] justify-between gap-4">
              <h3 className="font-medium text-lg">
                Legal
              </h3>
              <div className="flex font-light text-base ">
                <p className="w-[150px]">Terms of Service</p>
                <p className="w-[150px]">Cookies Policy</p>
              </div>
              <div className="flex font-light text-base ">
                <p className="w-[150px]">Privacy Policy</p>
                <p className="w-[150px]">Data Processing</p>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-[#ffffff] h-[66px] w-[1290px] absolute bottom-0 right-0 left-0 justify-between mx-auto flex-1 flex text-[#ffffff] md:px-5">
            <p className="text-[12px] font-light w-[300px] my-auto">
                © 2024 Polycon Inc. All rights reserved.
            </p>
            <div className="w-[168px] flex items-end justify-end gap-5 md:w-full sm:mr-[15px]">
              <ul className="gap-[25px] flex flex-wrap items-center my-auto">
                <li>
                  <svg className="w-[20px] h-[20px] text-[#ffffff] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z" clip-rule="evenodd"/>
                  </svg>
                </li>
                <li>
                  <svg className="w-[20px] h-[20px] text-[#ffffff] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z" clip-rule="evenodd"/>
                  </svg>
                </li>
                <li>
                  <svg className="w-[20px] h-[20px] text-[#ffffff] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z" clip-rule="evenodd"/>
                  </svg>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      

      {/* Modals */}
      {showLoginModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-[20px] shadow-lg w-[650px] h-[650px] relative">
            <button className="absolute top-4 right-6 text-gray-500 hover:text-gray-700" onClick={closeModal}>
              &times;
            </button>
            <Login onLoginSuccess={closeModal} onSwitchToSignup={switchToSignup} onError={handleLoginError} />
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-[20px] shadow-lg w-[650px] h-[650px] relative">
            <button className="absolute top-4 right-6 text-gray-500 hover:text-gray-700" onClick={closeModal}>
              &times;</button>
            <Signup onSwitchToLogin={switchToLogin} onError={handleSignupError} />
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const About = () => {
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
  return(
    <section id="About" className="flex w-full justify-between items-center">
        <div className="w-full h-[678px] relative overflow-hidden">
        <div className="rounded-[25px] bg-[#005B98] h-[100px] w-[100px] rotate-[30deg] absolute top-[16px] right-[10px]"></div>
          <div className="rounded-[25px] bg-[#057DCD] h-[219px] w-[219px] justify-end absolute top-[550px] left-[1366px] rotate-[20deg]"></div>
          <h1 className="font-bold text-[40px] text-[#057DCD] text-center">About</h1>
          <div className="absolute right-0 left-0 flex flex-1 justify-between items-center md:px-5">
            <div className="w-full flex justify-center md:w-full sm:ml-[48%]">
            <div className="rounded-[15px] bg-[#54BEFF] h-[50px] w-[148.24px] absolute bottom-[38px] right-[648px] rotate-[15deg]"></div>
            <div className="rounded-[25px] bg-[#057DCD] h-[88px] w-[507px] justify-end absolute top-[585px] left-[568px] right-[358px] rotate-[172deg]"></div>
              <div className="w-[518px] h-[578px] flex-row text-justify">
                <h3 className="font-medium text-lg text-center">
                  POLYCON (Consultation System)
                </h3>
                <p className="text-base">
                  We are a group of passionate individuals dedicated to 
                  creating innovative solutions that address real-world 
                  challenges. POLYCON is the result of our collective 
                  effort to design a system that simplifies processes 
                  and enhances communication. <br /> <br />
                  The team behind POLYCON includes David Paul Desuyo, Kurt 
                  Zhynkent Canja, Clark Jim Gabiota, and Kyrell Santillan. 
                  Together, as the Develorant group, we are 3rd-year Bachelor 
                  of Science in Computer Science students at STI West Negros 
                  University. <br /> <br />
                  POLYCON reflects our belief in the potential of technology 
                  to bridge gaps and improve lives. Thank you for supporting 
                  our work!
                </p>
              </div>
            </div>
          </div>
          <div className="w-[700px] h-[454px] bg-[#057DCD] rounded-tr-[20px] absolute bottom-0 right-0 left-0">
            <img src={images[currentImgAbout]} alt="Consultation Image"
              className={`absolute bottom-[38px] left-[78px] h-[580px] w-[580px] rounded-[25px] transition-opacity duration-1000 ease-in-out ${isFading ? "opacity-0" : "opacity-100"}`}/>
            <div className="absolute bottom-[38px] left-[78px] h-[580px] w-[580px] rounded-[25px] bg-gradient-to-b from-white to-[#005B98] opacity-50"></div>
          </div>
        </div>
    </section>
  )
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
    <div id="Body" className="flex w-full justify-between items-center my-10">
      <div className="w-full h-[700px] relative">
        <div className="rounded-[25px] w-[1368px] h-[582px] bg-[#057DCD] mx-auto absolute right-0 left-0 flex flex-1 justify-between items-center p-5 md:px-5 sm:p-5">
          <div className="w-[593px] flex-row text-[#ffffff] text-justify">
            <h1 className="text-5xl font-extrabold leading-tight">
              POLYCON: CONSULTATION SYSTEM
            </h1>
            <h3 className="mt-2 text-lg">
              Our consultation system simplifies the process of booking
              appointments, whether for individual consultations or group
              sessions.
            </h3>
            <h6 className="mt-3 text-sm font-light">
              Designed to enhance convenience and efficiency, it ensures seamless
              scheduling, real-time updates, and a hassle-free experience for both
              teachers and students. With user-friendly features and an intuitive
              interface, our system makes managing consultations effortless.
            </h6>
          </div>

          <div className="relative h-[660px] w-[660px] rounded-[25px] overflow-hidden mt-[130px]">
            <img src={images[currentImage]} alt="Consultation Image"
              className={`absolute top-0 left-0 h-full w-full transition-opacity duration-1000 ease-in-out ${isFading ? "opacity-0" : "opacity-100"}`}/>
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#005B98] opacity-50"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
