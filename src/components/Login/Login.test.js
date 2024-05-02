import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import axios from 'axios';
import Login from './Login';
import { BrowserRouter as Router } from 'react-router-dom';

export default axios;

jest.mock('axios');

describe('Login component', () => {
  it('renders login form', () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();;
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });

  it('submits form with correct data', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Login');

    axios.post.mockResolvedValueOnce({ data: { token: 'testToken' } });

    fireEvent.change(usernameInput, { target: { value: 'testUser@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'test@Password' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
    });

    expect(localStorage.getItem('token')).toBe('testToken');
  });

  it('displays error message for invalid credentials', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Login');

    axios.post.mockRejectedValueOnce({ response: { data: 'Invalid credentials' } });

    fireEvent.change(usernameInput, { target: { value: 'testUser@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'test@Password' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
