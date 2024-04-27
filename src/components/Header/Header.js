import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <header className="header-container">
      <h1 className="header-title">VideosHub</h1>
      {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
    </header>
  );
}

export default Header;