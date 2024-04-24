import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Video from './components/Video/VideoList';

function Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn) {
      navigate('/videos');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/videos" element={<Video />} />
        <Route path="/" element={<Redirect />} />
      </Routes>
    </Router>
  );
}

export default App;