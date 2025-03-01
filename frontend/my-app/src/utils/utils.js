// Add a consistent function to get profile pictures
export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) {
    return '/default-avatar.png';  // Return default avatar if no profile picture
  }
  
  if (profilePicture.startsWith('http')) {
    return profilePicture;  // Already a full URL
  }
  
  // Construct URL for server-stored images
  return `http://localhost:5001/uploads/${profilePicture}`;
};
