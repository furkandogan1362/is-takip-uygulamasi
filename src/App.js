import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import Header from './components/Header';
import Profile from './components/Profile';
import UsersPage from './components/UsersPage';
import SideMenu from './components/SideMenu';
import JobTable from './components/JobTable'; // İş tablosu bileşenini ekledik
import CommentsTable from './components/CommentsTable'; // Yorumlar tablosu bileşenini ekledik
import MyCommentsPage from './components/MyCommentsPage'; // Yorumlarım bileşenini ekledik
import AllCommentsPage from './components/AllCommentsPage'; // Tüm yorumlar bileşenini ekledik
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
        {isLoggedIn && <SideMenu isAdmin={isAdmin} />}
        <div className={`main-content ${isLoggedIn && isAdmin ? '' : 'full-width'}`}>
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
            />
            <Route 
              path="/users" 
              element={isLoggedIn && isAdmin ? <UsersPage /> : <Navigate to="/home" />} 
            />
            <Route 
              path="/jobs" 
              element={isLoggedIn ? <JobTable /> : <Navigate to="/" />} 
            />
            <Route 
              path="/comments" 
              element={isLoggedIn ? <CommentsTable /> : <Navigate to="/" />} 
            />
            <Route 
              path="/my-comments" 
              element={isLoggedIn ? <MyCommentsPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/all-comments" 
              element={isLoggedIn && isAdmin ? <AllCommentsPage /> : <Navigate to="/home" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
