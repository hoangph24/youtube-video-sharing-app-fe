import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import Register from './Register';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('axios');

describe('Register component', () => {
  it('renders register form', () => {
    render(
      <Router>
        <Register />
      </Router>
    );
    
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });

  it('submits form with correct data', async () => {
    render(
      <Router>
        <Register />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    axios.post.mockResolvedValueOnce({});

    fireEvent.change(usernameInput, { target: { value: 'testUser@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'test@Password' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/${process.env.REACT_APP_API_USERS}/register`,
        { username: 'testUser@gmail.com', password: 'test@Password' }
      );
    });
  });

  it('displays error message for invalid input', async () => {
    render(
      <Router>
        <Register />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    fireEvent.change(usernameInput, { target: { value: 'invalidUsername!' } });
    fireEvent.change(passwordInput, { target: { value: 'invalidPassword' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Username should be a valid email address.')).toBeTruthy();
    });
  });

  it('displays error message for server error', async () => {
    render(
      <Router>
        <Register />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    axios.post.mockRejectedValueOnce({ response: { data: 'Username already exists' } });

    fireEvent.change(usernameInput, { target: { value: 'testUser@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'test@Password' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeTruthy();
    });
  });
});
