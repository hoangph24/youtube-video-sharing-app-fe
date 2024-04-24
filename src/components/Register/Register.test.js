import { render, fireEvent, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import Register from './Register';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const server = setupServer(
  http.post('/register', (req, res, ctx) => {
    return res(ctx.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders register form', () => {
  render(<Register />);
  const usernameInput = screen.getByPlaceholderText('Username');
  const passwordInput = screen.getByPlaceholderText('Password');

  expect(usernameInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});

test('allows the user to register successfully', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  render(<Register />);
  const usernameInput = screen.getByPlaceholderText('Username');
  const passwordInput = screen.getByPlaceholderText('Password');
  const registerButton = screen.getByRole('button', { name: /register/i });

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'testpass' } });
  fireEvent.click(registerButton);

  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
});

test('shows an error message when registration fails', async () => {
  server.use(
    http.post('/register', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'Internal server error' }));
    })
  );

  render(<Register />);
  const usernameInput = screen.getByPlaceholderText('Username');
  const passwordInput = screen.getByPlaceholderText('Password');
  const registerButton = screen.getByRole('button', { name: /register/i });

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'testpass' } });
  fireEvent.click(registerButton);

  const errorMessage = await screen.findByText(/an error occurred. please try again./i);
  expect(errorMessage).toBeInTheDocument();
});