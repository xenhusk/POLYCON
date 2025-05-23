// Add a consistent function to get profile pictures
export const getProfilePictureUrl = (profilePicture, userName = '') => {
  if (!profilePicture) {
    // Use UI Avatars as default placeholder with user's name if available
    const name = userName || 'User';
    const formattedName = name.replace(/\s+/g, '+');
    return `https://eu.ui-avatars.com/api/?name=${formattedName}&size=250`;
  }
  
  if (profilePicture.startsWith('http')) {
    return profilePicture;  // Already a full URL
  }
  
  // Construct URL for server-stored images
  return `http://localhost:5001/uploads/${profilePicture}`;
};
