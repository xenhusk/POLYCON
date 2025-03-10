import React from "react";

const AssessmentModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-[#057DCD] w-[90%] sm:w-[80%] md:w-[70%] lg:w-[40%] flex flex-row justify-between p-4 rounded-tr-lg rounded-tl-lg z-10">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Assessment Student
        </h2>
      </div>
      {/* Modal */}
      <div className="bg-white rounded-br-lg rounded-bl-lg shadow-lg z-10 w-[90%] sm:w-[80%] md:w-[70%] lg:w-[40%] h-[60vh] sm:h-[65vh] md:h-[60vh] p-4 sm:p-6 relative overflow-y-auto">
        {children || (
          <div className="px-6 py-1">
            <div className='flex flex-row gap-2'>
                <div className="mb-4 flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                        Attendance:
                    </label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4 flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                        Quiz:
                    </label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div className='flex flex-row gap-2'>
                <div className="mb-4 flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                        Performance Task:
                    </label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4 flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                        Exam:
                    </label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Grade:
              </label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Recomdendation:
              </label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="absolute bottom-0 right-0 left-0 -mx-0">
                <div className="flex">
                    <button className="bg-[#057DCD] text-white px-4 py-4 flex-1 rounded-bl-lg">
                        Submit
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-gray-400 text-white px-4 py-4 flex-1 rounded-br-lg">
                        Cancel
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentModal;
