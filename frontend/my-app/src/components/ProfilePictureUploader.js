import React, { useState, useEffect, useRef } from 'react';
import { getProfilePictureUrl } from '../utils/utils';

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
        const response = await fetch(`http://localhost:5001/user/get_user?email=${userEmail}`);
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
      
      const response = await fetch('http://localhost:5001/profile/upload_profile_picture', {
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
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg relative max-w-md w-full mx-auto overflow-visible">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Profile Picture</h2>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg 
            className="w-5 h-5 text-gray-500" 
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
        </button>
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
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* Current profile & upload area */}
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full overflow-visible">
        {/* Current profile picture or preview */}
        <div className="flex-shrink-0">
          {!src ? (
            <div 
              onClick={handlePlaceholderClick}
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center"
              style={{maxWidth: '160px', maxHeight: '160px'}}
            >
              <img 
                src={currentProfilePic ? getProfilePictureUrl(currentProfilePic) : getProfilePictureUrl('')}
                alt="Current profile" 
                className="w-full h-full object-cover max-w-full max-h-full"
                style={{objectFit: 'cover'}}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Change Photo</span>
              </div>
            </div>
          ) : (
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden" style={{maxWidth: '160px', maxHeight: '160px'}}>
              <img 
                src={src} 
                alt="Preview" 
                className="w-full h-full object-cover max-w-full max-h-full" 
                style={{objectFit: 'cover'}}
              />
            </div>
          )}
        </div>

        {/* Right side - Upload controls */}
        <div className="flex-1 w-full min-w-0">
          {!src ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              } transition-all cursor-pointer w-full overflow-visible`}
              onClick={handlePlaceholderClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{minWidth: 0}}
            >
              <div className="flex flex-col items-center justify-center py-4">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-1">Drag & drop an image here</p>
                <p className="text-xs text-gray-500">or</p>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors">
                  Browse Files
                </button>
                <p className="mt-2 text-xs text-gray-500">Max size: 5MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full min-w-0">
              <p className="text-sm text-gray-700 font-medium">Selected Image</p>
              <p className="text-xs text-gray-500 truncate">
                {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)}MB)
              </p>
              
              {/* Progress bar for upload */}
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Action buttons - vertical stack for better fit */}
              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={uploadPicture} 
                  disabled={isUploading}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors 
                    ${isUploading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  `}
                >
                  {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Upload'}
                </button>
                <button 
                  onClick={handleReset} 
                  disabled={isUploading}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Change
                </button>
                <button 
                  onClick={onClose} 
                  disabled={isUploading}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePictureUploader;
