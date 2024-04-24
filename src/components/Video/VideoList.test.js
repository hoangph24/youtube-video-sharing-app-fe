import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { useNavigate } from 'react-router-dom';
import VideoList from './VideoList';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const server = setupServer(
  http.get('/videos', (req, res, ctx) => {
    const page = req.url.searchParams.get('page');
    const limit = req.url.searchParams.get('limit');
    const videos = Array.from({ length: limit }, (_, index) => ({
      id: index + 1,
      title: `Video ${index + 1}`,
      sharer: 'testuser',
      description: `Description ${index + 1}`,
      url: `https://youtube.com/video${index + 1}`,
    }));
    return res(ctx.json(videos));
  }),
  http.post('/videos', (req, res, ctx) => {
    return res(ctx.json({ id: 1 }));
  }),
  http.put('/videos/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ id }));
  }),
  http.delete('/videos/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders video list', async () => {
  render(<VideoList />);
  const loader = screen.getByTestId('loader');
  expect(loader).toBeInTheDocument();

  await waitFor(() => {
    const videoItems = screen.getAllByTestId('video-item');
    expect(videoItems.length).toBeGreaterThan(0);
  });
});

test('allows the user to share a video', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  render(<VideoList />);
  const videoLinkInput = screen.getByPlaceholderText('Paste YouTube video link here');
  const videoDescriptionInput = screen.getByPlaceholderText('Enter video description here');
  const shareButton = screen.getByRole('button', { name: /share/i });

  fireEvent.change(videoLinkInput, { target: { value: 'https://youtube.com/video1' } });
  fireEvent.change(videoDescriptionInput, { target: { value: 'Test video description' } });
  fireEvent.click(shareButton);

  await waitFor(() => {
    expect(videoLinkInput.value).toBe('');
  });

  await waitFor(() => {
    expect(videoDescriptionInput.value).toBe('');
  });

  await waitFor(() => {
    expect(screen.getByText(/video shared successfully/i)).toBeInTheDocument();
  });
});

test('allows the user to edit a video', async () => {
  render(<VideoList />);
  const editButton = screen.getAllByRole('button', { name: /edit/i })[0];

  fireEvent.click(editButton);

  const newTitleInput = screen.getByPlaceholderText('New Title');
  const newDescriptionInput = screen.getByPlaceholderText('New Description');
  const newUrlInput = screen.getByPlaceholderText('New Video URL');
  const submitButton = screen.getByRole('button', { name: /submit/i });

  fireEvent.change(newTitleInput, { target: { value: 'New Video Title' } });
  fireEvent.change(newDescriptionInput, { target: { value: 'New Video Description' } });
  fireEvent.change(newUrlInput, { target: { value: 'https://youtube.com/newvideo' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(newTitleInput.value).toBe('');
  });

  await waitFor(() => {
    expect(newDescriptionInput.value).toBe('');
  });

  await waitFor(() => {
    expect(newUrlInput.value).toBe('');
  });

  await waitFor(() => {
    expect(screen.getByText(/video shared successfully/i)).toBeInTheDocument();
  });
});

test('allows the user to delete a video', async () => {
  render(<VideoList />);
  const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];

  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText(/video 1/i)).not.toBeInTheDocument();
  });
});

test('navigates to login page if user is not logged in', () => {
  localStorage.setItem('isLoggedIn', 'false');
  render(<VideoList />);
  expect(useNavigate).toHaveBeenCalledWith('/login');
});

test('displays loader while fetching videos', async () => {
  render(<VideoList />);
  const loader = screen.getByTestId('loader');
  expect(loader).toBeInTheDocument();

  await waitFor(() => {
    expect(loader).not.toBeInTheDocument();
  });
});