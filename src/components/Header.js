// Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileButton from './ProfileButton';
import CreateTaskButton from './CreateTaskButton';
import CreateTaskModal from './CreateTaskModal'; // Modal bileşenini import ettik
import './Header.css';

function Header({ isLoggedIn, isAdmin, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleCreateTask = () => {
    // Görev oluşturulduğunda yapılacak işlemler
  };

  return (
    <header className="header">
      <Link to="/home" className="header-button">Ana Sayfa</Link>
      <div className="header-buttons">
        {isLoggedIn && (
          <>
            <ProfileButton />
            <CreateTaskButton onClick={handleOpenModal} /> {/* İş oluşturma butonu */}
            <button className="header-button-logout" onClick={onLogout}>Çıkış Yap</button>
          </>
        )}
      </div>
      <CreateTaskModal isOpen={isModalOpen} onClose={handleCloseModal} onCreate={handleCreateTask} />
    </header>
  );
}

export default Header;
