import React from 'react';
import { useNavigate } from 'react-router-dom';

import { socket } from '../../socket';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    socket.disconnect();
    navigate('/login');
  };

  return (
    <header className="header-container">
      <h1 className="header-title">Funny Movies</h1>
      {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
    </header>
  );
}

export default Header;