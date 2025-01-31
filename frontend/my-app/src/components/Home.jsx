import React from "react";
import logo from "./logo2.png";
import heroImage from "./icons/hero.image.jpg"; // Replace with actual image
import aboutUs from "./icons/about.jpg";
const Home = () => {
  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Navbar */}
      <nav className="bg-[#057DCD] p-5 flex justify-between items-center shadow-md rounded-r-full px-8 mt-6 mr-20">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Polycon Logo" className="h-12" />
        </div>
        <div className="flex items-center space-x-7">
          <a href="#about" className="text-white text-lg hover:underline">About</a>
          <a href="#contact" className="text-white text-lg hover:underline">Contact</a>
          <button className="bg-white text-[#057DCD] px-6 py-2 rounded-full text-lg font-semibold shadow-md hover:bg-[#54BEFF] hover:text-white">Login</button>
          <button className="bg-white text-[#057DCD] px-6 py-2 rounded-full text-lg font-semibold shadow-md hover:bg-[#54BEFF] hover:text-white">Sign Up</button>
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
          Our consultation system simplifies the process of booking appointments,
          whether for individual consultations or group sessions.
        </h2>
        <h4 className="mt-3 text-sm">
            Designed to enhance convenience and efficiency, it ensures seamless scheduling, 
            real-time updates, and a hassle-free experience for both teachers and students. 
            With user-friendly features and an intuitive interface, our system makes managing consultations effortless.
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
 <h1 className="text-4xl font-bold text-[#057DCD] text-center md:text-center">About</h1>
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

    <h2 className="text-2xl font-semibold text-gray-900">POLYCON (Consultation System)</h2>
    
    <p className="text-lg text-gray-700 leading-relaxed">
      We are a group of passionate individuals dedicated to creating innovative solutions that address real-world challenges.
      POLYCON is the result of our collective effort to design a system that simplifies processes and enhances communication.
    </p>
    
    <p className="text-lg text-gray-700 leading-relaxed">
      The team behind POLYCON includes <b>David Paul Desuyo, Kurt Zhynkent Canja, Clark Jim Gabiota, and Kyrell Santillan.</b> 
      Together, as the **Develorant group**, we are 3rd-year Bachelor of Science in Computer Science students at **STI West Negros University**. 
      POLYCON reflects our belief in the potential of technology to bridge gaps and improve lives. Thank you for supporting our work!
    </p>
  </div>
</section>


      
       {/* Contact Section */}
       <section id="contact" className="bg-[#057DCD] p-10 text-white mt-20">
        <div className="w-[95%] mx-auto flex flex-col md:flex-row justify-between items-start">
          {/* Left Side: Contact Info */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold">Contact</h2>
            <p className="mt-4 text-lg">Visit us in person at our department (CICT), Service Bldg.</p>
            <p className="mt-2 flex items-center">
              📍 <span className="ml-2 font-semibold">L N Agustin Dr, Bacolod, 6100 Negros Occidental</span>
            </p>
          </div>
          
          {/* Right Side: Contact Form */}
          <form className="md:w-1/2 mt-10 md:mt-0 space-y-4 bg-white p-6 rounded-lg shadow-lg text-black">
            <h3 className="text-xl font-semibold text-[#057DCD]">Get in touch with us!</h3>
            <div className="flex space-x-4">
              <input type="text" placeholder="First Name" className="w-1/2 p-3 rounded border border-gray-300" />
              <input type="text" placeholder="Last Name" className="w-1/2 p-3 rounded border border-gray-300" />
            </div>
            <input type="email" placeholder="Email Address" className="w-full p-3 rounded border border-gray-300" />
            <textarea placeholder="Leave a message" className="w-full p-3 rounded border border-gray-300"></textarea>
            <button className="bg-[#057DCD] text-white px-6 py-2 rounded-md w-full font-bold">Submit</button>
          </form>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#034C8C] p-6 text-white text-center mt-10">
        <div className="w-[95%] mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Polycon Logo" className="h-10" />
            <p className="text-lg font-semibold">We are still in development</p>
          </div>
          <div className="text-sm">
            <p>© 2025 Polycon. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Cookies Policy</a>
            <a href="#" className="hover:underline">Data Processing</a>
          </div>
        </div>
      </footer>
    </div>

    
  );
};

export default Home;
// chat, let's now create the login and signup form. so you know that there's a login and signup button in the homepage right? I want a modal to pop-pup whenever those buttons are clicked, here's our figma reference