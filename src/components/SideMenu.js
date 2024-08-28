import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideMenu.css';

function SideMenu({ isAdmin }) {
  const [isOpen, setIsOpen] = useState(true); // Menü açık mı kapalı mı durumunu kontrol eden state

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Menünün durumunu değiştir
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
          {/* Diğer menü öğeleri buraya eklenebilir */}
        </>
      )}
    </div>
  );
}

export default SideMenu;
