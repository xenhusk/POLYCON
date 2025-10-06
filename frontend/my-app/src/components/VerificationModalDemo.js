import React, { useState } from 'react';
import EmailVerificationModal from './EmailVerificationModal';

const VerificationModalDemo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Email Verification Modal Demo
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Show Verification Modal
          </button>
          
          <div className="text-center text-sm text-gray-600">
            <p>This modal includes:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• 60-second countdown timer</li>
              <li>• Resend email functionality</li>
              <li>• Beautiful animations</li>
              <li>• Email input field</li>
              <li>• Status indicators</li>
            </ul>
          </div>
        </div>

        {/* Verification Modal */}
        <EmailVerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          email="test@wnu.sti.edu.ph"
          onSuccess={() => {
            console.log('Verification successful!');
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default VerificationModalDemo;
