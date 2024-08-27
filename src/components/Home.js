import React from 'react';
import LogoutButton from './LogoutButton';
import { useNavigate } from 'react-router-dom';

function Home({ isAdmin, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // Çıkış yapıldığında bu fonksiyonu çağır
    navigate('/'); // Login sayfasına yönlendir
  };

  return (
    <div className="home">
      <LogoutButton onLogout={handleLogout} /> {/* Logout işlemini tetikler */}
    </div>
  );
}

export default Home;
