import React from 'react';
import { Link } from 'react-router-dom';
import ProfileButton from './ProfileButton';
import './Header.css';

function Header({ isLoggedIn, isAdmin, onLogout }) {
  return (
    <header className="header">
      <Link to="/home" className="header-button">Ana Sayfa</Link>
      <div className="header-buttons">
        {isLoggedIn && (
          <>
            <ProfileButton /> {/* Profilim butonunu ekledik */}
            <button className="header-button-logout" onClick={onLogout}>Çıkış Yap</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
