import React, { useState, useEffect, useRef } from 'react';

function ProfilePictureUploader({ initialFile, onClose }) {
  const [src, setSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

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
        alert('Profile picture uploaded successfully!');
        onClose();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Upload error.');
    }
  };

  const handlePlaceholderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
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
          <img src="https://via.placeholder.com/200" alt="Click to upload" className="w-48 h-48" />
          <p className="mt-2 text-center">Click image to upload</p>
        </div>
      )}
      {src && (
        <>
          <div>
            <p>Preview:</p>
            <img src={src} alt="Preview" className="w-48 h-48" />
          </div>
          <div className="mt-4 flex space-x-4">
            <button onClick={uploadPicture} className="bg-blue-500 text-white px-4 py-2 rounded">
              Upload
            </button>
            <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfilePictureUploader;
