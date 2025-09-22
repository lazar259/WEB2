import React, { useState, useEffect } from 'react';
import userService, { UserProfile } from '../../services/userService';
import './UserProfilePicture.css';

interface UserProfilePictureProps {
  size?: 'small' | 'medium' | 'large';
  showZoom?: boolean;
}

const UserProfilePicture: React.FC<UserProfilePictureProps> = ({
  size = 'medium',
  showZoom = true
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const profile = await userService.getUserProfile();
      setUserProfile(profile);

      if (profile?.profilePicture) {
        const pictureUrl = userService.getProfilePictureUrl(profile.profilePicture);
        setProfilePictureUrl(pictureUrl);
      }
    };

    fetchUserProfile();
  }, []);

  const handleClick = () => {
    if (showZoom && profilePictureUrl) {
      setIsZoomed(true);
    }
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleZoomBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsZoomed(false);
    }
  };

  if (!userProfile) {
    return (
      <div className={`user-profile-picture skeleton ${size}`}>
        <div className="skeleton-content"></div>
      </div>
    );
  }

  const displayInitials = userProfile.username.substring(0, 2).toUpperCase();

  return (
    <>
      <div
        className={`user-profile-picture ${size} ${showZoom && profilePictureUrl ? 'clickable' : ''}`}
        onClick={handleClick}
        title={`${userProfile.username}`}
      >
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={`${userProfile.username}'s profile`}
            className="profile-image"
          />
        ) : (
          <div className="profile-initials">
            {displayInitials}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && profilePictureUrl && (
        <div className="profile-zoom-overlay" onClick={handleZoomBackdropClick}>
          <div className="profile-zoom-container">
            <button
              className="zoom-close-button"
              onClick={handleCloseZoom}
              aria-label="Close zoom"
            >
              ×
            </button>
            <img
              src={profilePictureUrl}
              alt={`${userProfile.username}'s profile (zoomed)`}
              className="profile-image-zoomed"
            />
            <div className="profile-zoom-info">
              <h3>{userProfile.username}</h3>
              <p>{userProfile.email}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfilePicture;