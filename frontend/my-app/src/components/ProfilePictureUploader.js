import React, { useState, useEffect, useRef } from 'react';
import { getProfilePictureUrl } from '../utils/utils';

function ProfilePictureUploader({ initialFile, onClose, onSuccess }) {
  const [src, setSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  // Simplified file selection to update preview immediately
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadPicture = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('picture', selectedFile, 'profile.png');
    const userEmail = localStorage.getItem('userEmail'); // Ensure userEmail is used
    console.log("Debug: userEmail being sent:", userEmail); // Debugging log
    formData.append('user_email', userEmail);
    try {
      const response = await fetch('http://localhost:5001/profile/upload_profile_picture', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        if (onSuccess) onSuccess(data.public_url);
        alert('Profile picture uploaded successfully!');
        onClose();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Upload error.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlaceholderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative">
      {/* Add close button */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg 
          className="w-6 h-6 text-gray-500" 
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

      <h2 className="text-xl font-bold mb-4">Upload Profile Picture</h2>
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={onSelectFile} 
        style={{ display: 'none' }} 
      />
      {!src && (
        <div onClick={handlePlaceholderClick} className="cursor-pointer">
          <img 
            src={currentProfilePic || getProfilePictureUrl('')} 
            alt="Current profile" 
            className="w-48 h-48 object-cover rounded-full"
          />
          <p className="mt-2 text-center">Click to change profile picture</p>
        </div>
      )}
      {src && (
        <>
          <div>
            <p>Preview:</p>
            <img src={src} alt="Preview" className="w-48 h-48 object-cover rounded-full" />
          </div>
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={uploadPicture} 
              disabled={isUploading}
              className={`${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded transition-colors`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button 
              onClick={onClose} 
              disabled={isUploading}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfilePictureUploader;
