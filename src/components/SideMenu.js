// SideMenu.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideMenu.css';

function SideMenu({ isAdmin }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`side-menu ${isOpen ? 'open' : 'closed'}`}>
      <button className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? '✕' : '≡'}
      </button>
      {isOpen && (
        <>
          {isAdmin ? (
            <div className="menu-item">
              <Link to="/users">Kullanıcılar</Link>
            </div>
          ) : null}
          <div className="menu-item">
            <Link to="/jobs">İş Tablosu</Link>
          </div>
          <div className="menu-item">
            <Link to="/comments">Yorum Yap</Link>
          </div>
          
        </>
      )}
    </div>
  );
}

export default SideMenu;
