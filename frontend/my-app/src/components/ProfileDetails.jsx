import React from 'react';
import { getProfilePictureUrl } from '../utils/utils';

const ProfileDetails = ({ profileDetails, departmentName, onProfileClick }) => {
  return (
    <div className="mb-4 flex items-center">
      <img
        src={getProfilePictureUrl(profileDetails.profile_picture)}
        alt="Profile"
        className="rounded-full w-24 h-24 mr-4 cursor-pointer"
        onClick={onProfileClick}
      />
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          {profileDetails.name || 'No profile info'}
        </h3>
        <p className="text-gray-600">
          {profileDetails.id} | {profileDetails.role}
        </p>
        {profileDetails.role === 'Faculty' ? (
          <p className="text-gray-600">{departmentName}</p>
        ) : (
          <p className="text-gray-600">
            {profileDetails.program} {profileDetails.year_section}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
