import React, { useState } from 'react';
import axios from 'axios';

function RegistrationForm({ onRegister, onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { name, email, password });
      onRegister({ name, email, password });
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu');
    }
  };

  return (
    <div className="registration-form">
      <h2>Üye Ol</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">İsim:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">E-posta:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Şifre:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Üye Ol</button>
        {error && <p>{error}</p>}
      </form>
      <p>Zaten üye misin? <a href="#" onClick={onSwitch}>Giriş Yap</a></p>
    </div>
  );
}

export default RegistrationForm;
