import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import './LoginForm.css';

function LoginForm({ onLogin }) {  // onLogin prop'u eklendi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token } = response.data;
      // Token'ı localStorage'a kaydedin
      localStorage.setItem('token', token);

      // Token'ı decode edin ve admin bilgisini alın
      const decodedToken = JSON.parse(atob(token.split('.')[1]));

      // onLogin fonksiyonuna admin bilgisini iletin
      onLogin(decodedToken.isAdmin);

      navigate('/home');
    } catch (err) {
      setError('E-posta veya şifre yanlış');
    }
  };

  const handleRegister = (userData) => {
    console.log('Üye olunuyor:', userData);
    setShowLogin(true);
  };

  const switchForm = () => {
    setShowLogin(!showLogin);
  };

  if (!showLogin) {
    return <RegistrationForm onRegister={handleRegister} onSwitch={switchForm} />;
  }

  return (
    <div className="login-form">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Şifre:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Giriş Yap</button>
        {error && <p>{error}</p>}
      </form>
      <p>Üye değil misin? <a href="#" onClick={switchForm}>Kayıt Ol</a></p>
    </div>
  );
}

export default LoginForm;
