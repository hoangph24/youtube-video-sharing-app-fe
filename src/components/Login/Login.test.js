import { render, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter as Router } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http } from 'msw';

const server = setupServer(
  http.post('/login', (req, res, ctx) => {
    return res(ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('renders login form', () => {
    render(<Router><Login /></Router>);
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
});

test('allows the user to login successfully', async () => {
  render(<Router><Login /></Router>);

  const usernameInput = screen.getByPlaceholderText('Username');
  const passwordInput = screen.getByPlaceholderText('Password');
  const loginButton = screen.getByRole('button', { name: /login/i });

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'testpass' } });
  fireEvent.click(loginButton);
  await waitFor(() => expect(localStorage.getItem('isLoggedIn')).toEqual('true'));
  await waitFor(() => expect(localStorage.getItem('username')).toEqual('testuser'));
});

test('shows an error message when login fails', async () => {
server.use(
  http.post('/login', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Internal server error' }))
  })
)

const usernameInput = screen.getByPlaceholderText('Username');
const passwordInput = screen.getByPlaceholderText('Password');
const loginButton = screen.getByRole('button', { name: /login/i });

fireEvent.change(usernameInput, { target: { value: 'testuser' } });
fireEvent.change(passwordInput, { target: { value: 'testpass' } });
fireEvent.click(loginButton);

const errorMessage = await screen.findByText(/an error occurred. please try again./i);
expect(errorMessage).toBeInTheDocument();
});