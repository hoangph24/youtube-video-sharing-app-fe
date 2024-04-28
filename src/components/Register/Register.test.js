import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import Register from './Register';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('axios');

describe('Register component', () => {
  it('renders register form', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <Register />
      </Router>
    );
    
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });

  it('submits form with correct data', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <Register />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    axios.post.mockResolvedValueOnce({});

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/${process.env.REACT_APP_API_USERS}/register`,
        { username: 'testUser', password: 'testPassword' }
      );
    });
  });

  it('displays error message for invalid input', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <Register />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    fireEvent.change(usernameInput, { target: { value: 'invalidUsername!' } });
    fireEvent.change(passwordInput, { target: { value: 'invalidPassword!' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Username should only contain alphanumeric characters and be between 3 and 30 characters long.')).toBeTruthy();
    });
  });

  it('displays error message for server error', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <Register />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    axios.post.mockRejectedValueOnce({ response: { data: 'Username already exists' } });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeTruthy();
    });
  });
});
