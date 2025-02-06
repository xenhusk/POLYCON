export function getProfilePictureUrl(profilePicture) {
    return profilePicture && profilePicture.trim() 
        ? profilePicture 
        : "https://avatar.iran.liara.run/public/boy?username=Ash";
}
