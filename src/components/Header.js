import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileButton from './ProfileButton';
import CreateTaskButton from './CreateTaskButton';
import CreateTaskModal from './CreateTaskModal'; // Modal bileşenini import ettik
import './Header.css';

function Header({ isLoggedIn, isAdmin, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate hook'unu kullan

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleCreateTask = () => {
    // Görev oluşturulduğunda yapılacak işlemler
  };

  const handleViewMyComments = () => {
    navigate('/my-comments'); // Sayfaya yönlendirme
  };

  return (
    <header className="header">
      <Link to="/home" className="header-button">Ana Sayfa</Link>
      <div className="header-buttons">
        {isLoggedIn && (
          <>
            <ProfileButton />
            <CreateTaskButton onClick={handleOpenModal} /> {/* İş oluşturma butonu */}
            <button className="header-button-yorum" onClick={handleViewMyComments}>
              Yorumlarım
            </button>
            <button className="header-button-logout" onClick={onLogout}>Çıkış Yap</button>
          </>
        )}
      </div>
      <CreateTaskModal isOpen={isModalOpen} onClose={handleCloseModal} onCreate={handleCreateTask} />
    </header>
  );
}

export default Header;
