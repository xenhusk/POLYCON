import React, { useState, useEffect } from 'react';
import { getProfilePictureUrl } from '../utils/utils';

const ProfileDetails = ({ profileDetails, departmentName, onProfileClick }) => {
  const [profile, setProfile] = useState(null);
  const userID = localStorage.getItem('userID') || localStorage.getItem('studentID') || localStorage.getItem('teacherID');

  useEffect(() => {
    if (userID) {
      fetch(`http://localhost:5001/user/get_user?userID=${userID}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error(err));
    }
  }, [userID]);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="mb-4 flex items-center">
      <img
        src={getProfilePictureUrl(profile.profile_picture)}
        alt="Profile"
        className="rounded-full w-24 h-24 mr-4 cursor-pointer"
        onClick={onProfileClick}
      />
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          {profile.firstName} {profile.lastName}
        </h3>
        <p className="text-gray-600">
          {profile.id} | {profile.role}
        </p>
        {profile.role === 'Faculty' ? (
          <p className="text-gray-600">{profile.department}</p>
        ) : (
          <p className="text-gray-600">
            {profile.program} {profile.year_section}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
