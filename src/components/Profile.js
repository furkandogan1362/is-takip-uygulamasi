import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [cv, setCv] = useState(null);
  const [cvError, setCvError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        console.log('Profile Data:', response.data); // Burayı kontrol edin
        setUserInfo(response.data);
      })
      .catch(error => {
        setError('Kullanıcı bilgileri alınamadı.');
      });
    }
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    axios.post('http://localhost:5000/upload-profile-photo', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      setUserInfo(prevState => ({
        ...prevState,
        photoUrl: response.data.photoUrl
      }));
      setUploadError(null);
    })
    .catch(error => {
      setUploadError('Fotoğraf yüklenirken hata oluştu.');
    });
  };

  const handleCvChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCv(file);
      handleCvUpload(file);
    }
  };

  const handleCvUpload = (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    axios.post('http://localhost:5000/upload-cv', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      setUserInfo(prevState => ({
        ...prevState,
        cvUrl: response.data.cvUrl,
        cvName: file.name // Dosya adını kaydediyoruz
      }));
      setCvError(null);
    })
    .catch(error => {
      setCvError('CV yüklenirken hata oluştu.');
    });
  };

  const handleCvDownload = () => {
    if (userInfo.cvUrl) {
      window.open(`http://localhost:5000${userInfo.cvUrl}`, '_blank');
    }
  };

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="profile-container">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profilim</h1>
      </div>
      <div className="profile-photo-container">
        {userInfo.photoUrl ? (
          <img src={`http://localhost:5000${userInfo.photoUrl}`} alt="Profile" className="profile-photo" />
        ) : (
          <p className="no-photo-message">Fotoğraf yüklenmemiş</p>
        )}
      </div>
      <div className="photo-upload">
        <input type="file" id="file-input" accept="image/*" onChange={handlePhotoChange} />
        <label htmlFor="file-input" className="upload-button">Fotoğraf Yükle</label>
        {uploadError && <p className="error-message">{uploadError}</p>}
      </div>
      <div className="cv-upload">
        <div className="buttons-container">
          <input type="file" id="cv-input" accept="application/pdf" onChange={handleCvChange} />
          <label htmlFor="cv-input" className="upload-button">CV Yükle</label>
          {userInfo.cvUrl && (
            <button className="upload-button" onClick={handleCvDownload}>CV'nizi görün</button>
          )}
        </div>
        {cvError && <p className="error-message">{cvError}</p>}
        <p className="note-message">Sadece PDF seçiniz.</p>
      </div>
      <div className="profile-details">
        <div className="profile-item">
          <span className="profile-label">Ad:</span>
          <span className="profile-value">{userInfo.name}</span>
        </div>
        <div className="profile-item">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{userInfo.email}</span>
        </div>
        <div className="profile-item">
          <span className="profile-label">Durum:</span>
          <span className="profile-value">
            <span className={`status-badge ${userInfo.isAdmin ? 'admin' : 'user'}`}>
              {userInfo.isAdmin ? 'Admin' : 'Kullanıcı'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Profile;
