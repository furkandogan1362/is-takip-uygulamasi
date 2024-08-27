import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import Header from './components/Header';
import Profile from './components/Profile'; // Profile bileşenini ekledik
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (adminStatus) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        {isLoggedIn && <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/" 
            element={!isLoggedIn ? <LoginForm onLogin={handleLogin} /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/home" 
            element={isLoggedIn ? <Home isAdmin={isAdmin} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile" 
            element={isLoggedIn ? <Profile /> : <Navigate to="/" />} 
          /> {/* Profile route ekledik */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
