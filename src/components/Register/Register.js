import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const protocol = process.env.PROTOCOL;
  const host = process.env.HOST;
  const port = process.env.PORT;
  const url = `${protocol}://${host}:${port}`;

  const validateInput = (username, password) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    const passwordRegex = /^[a-zA-Z0-9]{8,15}$/;
  
    if (!username || !password) {
      return 'Username and password are required.';
    }
  
    if (!usernameRegex.test(username)) {
      return 'Username should only contain alphanumeric characters and be between 3 and 30 characters long.';
    }
  
    if (!passwordRegex.test(password)) {
      return 'Password should only contain alphanumeric characters and be between 8 and 15 characters long.';
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
      const response = await fetch(`${url}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isLoading ? <div className="loading"></div> : <button type="submit" disabled={!username || !password}>Register</button>}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default Register;