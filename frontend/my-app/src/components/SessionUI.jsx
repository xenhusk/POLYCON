import React, { useState } from 'react';
import profileImage from './profile.jpg';
import micIcon from './icons/mic.png';
import recordIcon from './icons/voice.png';
import stopIcon from './icons/stop-button.png';
const SessionUI = () => {

  const [selectedDate, setSelectedDate] = useState('');
  return (
    <div className="min-h-screen bg-red-100 p-10 flex justify-center items-center font-poppins">
      <div className="max-w-5xl w-full grid grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="col-span-2 bg-blue-600 p-6 rounded-lg shadow-lg">
          <label className="block text-white text-lg mb-2">Concern</label>
          <textarea className="w-full p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>

          <label className="block text-white text-lg mb-2">Action Taken</label>
          <textarea className="w-full p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>

          <label className="block text-white text-lg mb-2">Outcome</label>
          <textarea className="w-full p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>

          <label className="block text-white text-lg mb-2">Remarks</label>
          <textarea className="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
        </div>

        {/* Right Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2 p-8 sm:flex-row sm:items-center sm:gap-6 sm:py-4 bg-blue-600 text-white rounded-lg shadow-lg">
            <img className="mx-auto block h-24 rounded-full sm:mx-0 sm:shrink-0" src={profileImage} alt="Profile" />
            <div className="space-y-2 text-center sm:text-left">
              <div className="space-y-0.5">
                <p className="text-lg font-semibold">Ms Orvilla Balangue</p>
                <p className="font-small text-gray-300">CICT Faculty</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <p className="font-bold mb-2">Student/s</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">👤</span>
                John Harvey Villaflor
              </li>
              <li className="flex items-center">
                <span className="mr-2">👤</span>
                Dhenz Sherwin Quenca
              </li>
              <li className="flex items-center">
                <span className="mr-2">👤</span>
                Jefferson Inere
              </li>
              <li className="flex items-center">
                <span className="mr-2">👤</span>
                James Galliet Noecja
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-4">
            <img src={micIcon} alt="Microphone" className="w-6 h-6" />
            <img src={recordIcon} alt="Recording" className="w-6 h-6" />
            <img src={stopIcon} alt="Stop Recording" className="w-6 h-6" />
            <input
              type="date"
              className="border rounded-md p-1"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <span className="text-gray-600">29:48</span>
          </div>

          <button className="w-full bg-[#057DCD] text-white py-3 rounded-lg shadow-md hover:bg-blue-700">
            Finalize Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionUI;
