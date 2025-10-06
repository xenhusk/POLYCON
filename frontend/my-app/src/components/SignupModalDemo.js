import React, { useState } from 'react';
import SignupConfirmationModal from './SignupConfirmationModal';

const SignupModalDemo = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResendEmail = () => {
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60); // Start 60-second countdown
      alert('Verification email resent successfully!');
    }, 2000);
  };

  // Countdown timer effect
  React.useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Signup Modal Demo
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setCountdown(60); // Start countdown when showing success modal
              setShowSuccessModal(true);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Show Success Modal (with Timer)
          </button>
          
          <button
            onClick={() => setShowErrorModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Show Error Modal
          </button>
          
          <div className="text-center text-sm text-gray-600">
            {countdown > 0 && (
              <p>⏱️ Countdown active: {countdown}s remaining</p>
            )}
          </div>
        </div>

        {/* Success Modal */}
        <SignupConfirmationModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          type="success"
          email="test@wnu.sti.edu.ph"
          onResendEmail={handleResendEmail}
          isLoading={isResending}
          countdown={countdown}
        />

        {/* Error Modal */}
        <SignupConfirmationModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          type="error"
          email="test@wnu.sti.edu.ph"
        />
      </div>
    </div>
  );
};

export default SignupModalDemo;
