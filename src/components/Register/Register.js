import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const validateInput = (username, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
  
    if (!username || !password) {
      return 'Username and password are required.';
    }
  
    if (!emailRegex.test(username)) {
      return 'Username should be a valid email address.';
    }
  
    if (!passwordRegex.test(password)) {
      return 'Password should be 8-15 characters long and contain at least one letter, one number and one special character.';
    }
  
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const validationError = validateInput(username, password);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${apiUrl}/${process.env.REACT_APP_API_USERS}/register`, {
        username,
        password
      });
  
      navigate('/login');
    } catch (error) {
      if (error.response) {
        setError(error.response.data);
      } else if (error.request) {
        setError('An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          title="Username should be a valid email address."
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          title="Password should be 8-15 characters long and contain at least one letter, one number and one special character."
        />
        {isLoading ? <div className="loading"></div> : <button type="submit" disabled={!username || !password}>Register</button>}
        {error && (
          <div className="error-notification">
            {error}
            <button onClick={() => setError(null)}>X</button>
          </div>
        )}
      </form>
    </div>
  );
}

export default Register;