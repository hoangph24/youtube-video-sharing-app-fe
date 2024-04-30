import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const url = process.env.REACT_APP_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${url}/${process.env.REACT_APP_API_USERS}/login`, {
        username,
        password
      });

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', response.data.token);

      const decodedToken = decodeToken(response.data.token);
      localStorage.setItem('userId', decodedToken.id);
      navigate('/videos');
    } catch (error) {
      if (error.response) {
        setError(error.response.data);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {isLoading ? <div className="loading"></div> : <button type="submit" disabled={!username || !password}>Login</button>}
        {error && (
          <div className="error-notification">
            {error}
            <button onClick={() => setError(null)}>X</button>
          </div>
        )}
        <button type="button" onClick={() => navigate('/register')}>Register</button>
      </form>
    </div>
  );
}

export default Login;