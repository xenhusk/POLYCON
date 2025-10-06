import React from 'react';
import { CheckCircleOutlined, ExclamationCircleOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';

const SignupConfirmationModal = ({ 
  isOpen, 
  onClose, 
  type = 'success', // 'success' or 'error'
  email = '',
  onResendEmail = null,
  isLoading = false,
  countdown = 0
}) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-2xl ${isSuccess ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-rose-50'}`}>
          <div className="flex items-center justify-center mb-2">
            {isSuccess ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleOutlined className="text-4xl text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationCircleOutlined className="text-4xl text-red-600" />
              </div>
            )}
          </div>
          
          <h2 className={`text-xl font-bold text-center ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
            {isSuccess ? 'Account Created Successfully!' : 'Signup Failed'}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-4">
                <MailOutlined className="text-3xl text-blue-500 mb-2" />
                <p className="text-gray-700 text-base leading-relaxed">
                  We've sent a verification email to:
                </p>
                <p className="font-semibold text-blue-600 text-lg mt-1">
                  {email}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <ClockCircleOutlined className="text-blue-500 mt-0.5" />
                  <div className="text-left">
                    <p className="text-blue-800 font-medium text-sm mb-1">Next Steps:</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Check your email inbox (including spam folder)</li>
                      <li>• Click the verification link in the email</li>
                      <li>• Complete your account setup</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                {countdown > 0 ? (
                  <span className="text-blue-600 font-medium">
                    ⏱️ Please wait {countdown} seconds before requesting another email
                  </span>
                ) : (
                  "Didn't receive the email? Check your spam folder or try resending."
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-700 text-base leading-relaxed mb-4">
                We encountered an issue while creating your account. This could be due to:
              </p>
              <ul className="text-gray-600 text-sm text-left space-y-2 mb-4">
                <li>• Email already exists</li>
                <li>• Invalid email format</li>
                <li>• Network connection issues</li>
                <li>• Server temporarily unavailable</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mt-6">
            {isSuccess ? (
              <>
                <button
                  onClick={() => window.location.href = '/verify-email'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Verification Page
                </button>
                
                {onResendEmail && (
                  <button
                    onClick={onResendEmail}
                    disabled={isLoading || countdown > 0}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${
                      countdown > 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : isLoading 
                          ? 'bg-gray-100 text-gray-700 cursor-not-allowed' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resending...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <ClockCircleOutlined className="mr-2" />
                        Resend in {countdown}s
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupConfirmationModal;
