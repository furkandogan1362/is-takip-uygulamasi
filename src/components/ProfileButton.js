import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileButton.css';

function ProfileButton() {
  return (
    <Link to="/profile" className="profile-button">
      Profilim
    </Link>
  );
}

export default ProfileButton;
