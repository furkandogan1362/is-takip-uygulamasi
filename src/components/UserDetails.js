// src/components/UserDetails.js
import React from 'react';

function UserDetails({ user }) {
  return (
    <div className="user-details">
      <h2>Detaylar</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>İsim:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Fotoğraf:</strong> <img src={user.photoUrl} alt={user.name} /></p>
      <p><strong>CV:</strong> <a href={user.cvUrl} target="_blank" rel="noopener noreferrer">İndir</a></p>
    </div>
  );
}

export default UserDetails;
