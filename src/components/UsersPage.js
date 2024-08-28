import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigate hook'u kullanarak yönlendirme işlemlerini yapacağız

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Token'ı al
        const response = await axios.get('http://localhost:5000/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data); // Kullanıcıları state'e aktar
        setLoading(false);
      } catch (error) {
        console.error('Kullanıcılar alınırken bir hata oluştu:', error);
        setError('Kullanıcılar alınamadı');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate('/home'); // 'Escape' tuşuna basıldığında yönlendirme işlemi
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="users-page">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
}

export default UsersPage;
