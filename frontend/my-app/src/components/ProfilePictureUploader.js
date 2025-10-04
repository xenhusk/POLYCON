import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfilePictureUrl } from '../utils/utils';
import API_URL from '../apiConfig';

function ProfilePictureUploader({ initialFile, onClose, onSuccess }) {
  const [src, setSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch current user's profile picture on component mount
  useEffect(() => {
    const fetchCurrentProfilePic = async () => {
      const userEmail = localStorage.getItem('userEmail');
      try {
        const response = await fetch(`${API_URL}/user/get_user?email=${userEmail}`);
        const userData = await response.json();
        if (userData.profile_picture) {
          setCurrentProfilePic(userData.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };
    fetchCurrentProfilePic();
  }, []);

  // Automatically read file if provided
  useEffect(() => {
    if (initialFile) {
      setSelectedFile(initialFile);
      const reader = new FileReader();
      reader.onload = () => setSrc(reader.result);
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  // Helper function to handle selected file
  const handleFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file.');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB.');
      return;
    }
    
    setErrorMessage('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const uploadPicture = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('picture', selectedFile, 'profile.png');
    const userEmail = localStorage.getItem('userEmail');
    formData.append('user_email', userEmail);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      const response = await fetch(`${API_URL}/profile/upload_profile_picture`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const data = await response.json();
      if (response.ok) {
        if (onSuccess) onSuccess(data.public_url);
        // Delay closing to show 100% completion
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMessage(`Upload failed: ${data.error}`);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      setErrorMessage('Network error. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlaceholderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    setSrc(null);
    setSelectedFile(null);
    setErrorMessage('');
    setUploadProgress(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/20 relative max-w-lg w-full mx-auto overflow-visible"
    >
      {/* Header with gradient background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94] rounded-2xl opacity-10"></div>
        <div className="relative flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Profile Picture</h2>
              <p className="text-sm text-gray-600">Update your profile photo</p>
            </div>
          </div>
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-md"
            aria-label="Close"
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={onSelectFile} 
        className="hidden" 
      />

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl text-sm shadow-sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current profile & upload area */}
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full overflow-visible">
        {/* Current profile picture or preview */}
        <div className="flex-shrink-0">
          {!src ? (
            <motion.div 
              onClick={handlePlaceholderClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer shadow-lg border-4 border-white hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              style={{maxWidth: '176px', maxHeight: '176px'}}
            >
              <img 
                src={currentProfilePic ? getProfilePictureUrl(currentProfilePic) : getProfilePictureUrl('')}
                alt="Current profile" 
                className="w-full h-full object-cover max-w-full max-h-full"
                style={{objectFit: 'cover'}}
              />
              <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center"
              >
                <div className="text-center">
                  <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white text-sm font-semibold">Change Photo</span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-lg border-4 border-white" 
              style={{maxWidth: '176px', maxHeight: '176px'}}
            >
              <img 
                src={src} 
                alt="Preview" 
                className="w-full h-full object-cover max-w-full max-h-full" 
                style={{objectFit: 'cover'}}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent flex items-end justify-center pb-2">
                <span className="text-white text-xs font-semibold bg-green-500 px-2 py-1 rounded-full">Preview</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right side - Upload controls */}
        <div className="flex-1 w-full min-w-0">
          {!src ? (
            <motion.div 
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer w-full overflow-visible ${
                isDragging 
                  ? 'border-[#057DCD] bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' 
                  : 'border-gray-300 hover:border-[#057DCD] hover:bg-gray-50'
              }`}
              onClick={handlePlaceholderClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{minWidth: 0}}
            >
              <div className="flex flex-col items-center justify-center py-6">
                <motion.div
                  animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-full flex items-center justify-center mb-4 shadow-lg"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Profile Picture</h3>
                <p className="text-sm text-gray-600 mb-3">Drag & drop an image here</p>
                <p className="text-xs text-gray-500 mb-4">or</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white text-sm font-semibold rounded-xl hover:from-[#046bb8] hover:to-[#034a94] transition-all duration-200 shadow-lg"
                >
                  Browse Files
                </motion.button>
                <p className="mt-4 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Max size: 5MB</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 w-full min-w-0"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Image Selected</h3>
                </div>
                <p className="text-sm text-gray-600 truncate font-medium">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile?.size / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
              
              {/* Progress bar for upload */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner"
                  >
                    <motion.div 
                      className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] h-3 rounded-full transition-all duration-500 ease-out"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons - modern styling */}
              <div className="flex flex-col gap-3 w-full">
                <motion.button 
                  onClick={uploadPicture} 
                  disabled={isUploading}
                  whileHover={!isUploading ? { scale: 1.02 } : {}}
                  whileTap={!isUploading ? { scale: 0.98 } : {}}
                  className={`w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white hover:shadow-xl'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading {Math.round(uploadProgress)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Picture</span>
                    </div>
                  )}
                </motion.button>
                
                <div className="flex gap-3">
                  <motion.button 
                    onClick={handleReset} 
                    disabled={isUploading}
                    whileHover={!isUploading ? { scale: 1.02 } : {}}
                    whileTap={!isUploading ? { scale: 0.98 } : {}}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-all duration-200 shadow-md"
                  >
                    Change
                  </motion.button>
                  <motion.button 
                    onClick={onClose} 
                    disabled={isUploading}
                    whileHover={!isUploading ? { scale: 1.02 } : {}}
                    whileTap={!isUploading ? { scale: 0.98 } : {}}
                    className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200 shadow-md"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProfilePictureUploader;
