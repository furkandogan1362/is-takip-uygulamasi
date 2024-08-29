// CreateTaskButton.js
import React from 'react';
import './CreateTaskButton.css'; // Stil dosyasını import edin

function CreateTaskButton({ onClick }) {
  return (
    <button className="create-task-button" onClick={onClick}>
      İş Oluştur
    </button>
  );
}

export default CreateTaskButton;
