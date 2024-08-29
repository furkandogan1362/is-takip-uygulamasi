import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateTaskModal.css';

function CreateTaskModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Yeni');
  const [details, setDetails] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [creationDate, setCreationDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchUserInfo = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserInfo(response.data);
          setCreationDate(new Date().toLocaleString()); // Tarihi ayarla
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
          setError('Kullanıcı bilgileri alınamadı');
        }
      };

      fetchUserInfo();
    }

    // ESC tuşuna basıldığında modalı kapatma işleyicisi
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Olay dinleyicisini ekle
    document.addEventListener('keydown', handleEscKey);

    // Temizlik işlevi
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      setError('Kullanıcı bilgileri alınamadı.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/tasks', {
        title,
        status,
        details,
        createdBy: userInfo.id, // Kullanıcının ID'sini gönder
        creationDate, // Tarihi gönder
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Görev başarıyla oluşturuldu:', response.data);
      onClose(); // Modalı kapat
    } catch (error) {
      console.error('Görev oluşturulurken hata oluştu:', error);
      setError('Görev oluşturulurken hata oluştu');
    }
  };

  if (!isOpen) return null; // Modal kapalıysa hiçbir şey render edilmez

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <h2 className="modal-title">Yeni Görev Oluştur</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>ID:</label>
          <input type="text" value={userInfo ? userInfo.id : ''} readOnly />
          <label>Tarih:</label>
          <input type="text" value={creationDate} readOnly />
          <label>Başlık:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Durum:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="Yeni">Yeni</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Silindi">Silindi</option>
          </select>
          <label>Detay:</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
          <button type="submit">Oluştur</button>
          <button type="button" onClick={onClose}>Kapat</button>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
