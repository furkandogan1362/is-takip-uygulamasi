import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa'; // Yeşil tik ikonu
import './UsersPage.css';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Başarı mesajı için state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Kullanıcılar alınırken bir hata oluştu:', error);
        setError('Kullanıcılar alınamadı');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async (id, name) => {
    if (window.confirm('Gerçekten silmek istiyor musunuz?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(users.filter(user => user.id !== id)); // Kullanıcıyı local state'ten çıkar
        setSuccessMessage(`Kullanıcı ${id} (${name}) başarıyla silindi.`);
        console.log(`${id} idli ${name} kullanıcısı silindi.`);
        
        // 5 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } catch (error) {
        console.error('Kullanıcı silinirken bir hata oluştu:', error);
        setError('Kullanıcı silinemedi');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate('/home');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="users-page">
      {successMessage && (
        <div className="success-message">
          <FaCheckCircle className="success-icon" />
          {successMessage}
        </div>
      )}
      <h1>Kullanıcılar</h1>
      <div className="user-container">
        {users.map(user => (
          <div className={`user-item ${user.isAdmin ? 'admin' : 'normal-user'}`} key={user.id}>
            <img src={`http://localhost:5000${user.photoUrl}`} alt="User" />
            <div className="user-info">
              <p className="id">ID: {user.id}</p>
              <p className="name">İsim: {user.name}</p>
              <p className="email">E-mail: {user.email}</p>
              <div className="cv">
                <a href={`http://localhost:5000${user.cvUrl}`} target="_blank" rel="noopener noreferrer" className="cv-link">
                  CV'yi Gör
                </a>
              </div>
              <p className="user-status">{user.isAdmin ? 'Durum: Admin' : 'Durum: Kullanıcı'}</p>
              {!user.isAdmin && ( // Admin kullanıcıları silemeyiz
                <button className="delete-button" onClick={() => deleteUser(user.id, user.name)}>
                  Kullanıcıyı Sil
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;
