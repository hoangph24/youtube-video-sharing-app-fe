import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <header class="header-container">
      {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
    </header>
  );
}

export default Header;