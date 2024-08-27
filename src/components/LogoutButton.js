import React from 'react';
import './LogoutButton.css';
import { useNavigate } from 'react-router-dom';

function LogoutButton({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Token'ı temizle
    onLogout(); // Çıkış yapıldığında onLogout fonksiyonunu çağır
    navigate('/'); // Login sayfasına yönlendir
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Çıkış Yap
    </button>
  );
}

export default LogoutButton;
