import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateTaskModal.css';

function CreateTaskModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [creationDate, setCreationDate] = useState('');
  const [image, setImage] = useState(null); // Tek fotoğrafı tutacak state

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
          setCreationDate(new Date().toLocaleString());
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
          setError('Kullanıcı bilgileri alınamadı');
        }
      };

      fetchUserInfo();
    }

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      setError('Kullanıcı bilgileri alınamadı.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('status', 'Yeni'); // Durum her zaman 'Yeni' olarak ayarlanır
      formData.append('details', details);
      formData.append('createdBy', userInfo.id);
      formData.append('creationDate', creationDate);

      if (image) {
        formData.append('image', image); // Tek fotoğrafı 'image' olarak gönderiyoruz
      }

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/tasks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Görev başarıyla oluşturuldu:', response.data);
      onClose();
    } catch (error) {
      console.error('Görev oluşturulurken hata oluştu:', error);
      setError('Görev oluşturulurken hata oluştu');
    }
  };

  if (!isOpen) return null;

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
          {/* Durum seçimi kaldırıldı */}
          <label>Detay:</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
          <label>Fotoğraf (1 adet):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <button type="submit">Oluştur</button>
          <button type="button" onClick={onClose}>Kapat</button>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
