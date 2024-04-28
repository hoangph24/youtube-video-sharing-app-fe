import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import VideoList from './VideoList';
import { BrowserRouter as Router } from 'react-router-dom';
import decodeToken from 'jwt-decode';
import { wait } from '@testing-library/user-event/dist/utils';

jest.mock('jwt-decode', () => () => ({ id: 'testUserId' }));

jest.mock('axios');

describe('VideoList component', () => {

  beforeEach(() => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4IiwiaWF0IjoxNTE2MjM5MDIyfQ.axu-zC5zwJGbaAgYvPpiBW8hdPrGPfaMv_cr3fJxyqUM8');
    localStorage.setItem('isLoggedIn', 'true');

    process.env.REACT_APP_API_URL = 'https://example.com/api';
    process.env.REACT_APP_API_VIDEOS = 'videos';
  });

  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');

    process.env.REACT_APP_API_URL = undefined;
    process.env.REACT_APP_API_VIDEOS = undefined;
  });

  it('renders video list', async () => {
    const videos = [
      { _id: '1', title: 'Video 1', description: 'Description 1', sharer: { _id: '1', username: 'User 1' }, youtubeId: 'youtubeId1' },
      { _id: '2', title: 'Video 2', description: 'Description 2', sharer: { _id: '2', username: 'User 2' }, youtubeId: 'youtubeId2' }
    ];
    axios.get.mockResolvedValueOnce({ data: videos });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <VideoList />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Video 1')).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText('Video 2')).toBeTruthy();
    });
  });

  it('shares a video', async () => {
    const mockNewVideo = {
      _id: '3',
      title: 'New Video',
      description: 'New Description',
      youtubeId: 'new123',
      sharer: { _id: '1', username: 'user1' }
    };

    axios.post.mockResolvedValueOnce({ data: mockNewVideo });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <VideoList />
      </Router>
    );

    const shareLinkInput = await screen.findByPlaceholderText('Paste YouTube video link here');
    const titleInput = screen.getByPlaceholderText('Enter video title');
    const descriptionInput = screen.getByPlaceholderText('Enter video description here');
    const shareButton = screen.getByText('Share');

    fireEvent.change(shareLinkInput, { target: { value: 'https://www.youtube.com/watch?v=new123' } });
    fireEvent.change(titleInput, { target: { value: 'New Video' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://example.com/api/videos',
        {
          sharer: expect.any(String),
          url: 'https://www.youtube.com/watch?v=new123',
          title: 'New Video',
          description: 'New Description'
        },
        expect.any(Object)
      );
    });
  });
  
  it('edits a video', async () => {
    const videos = [
      { 
        _id: '1',
        title: 'Video 1',
        description: 'Description 1',
        sharer: { _id: '12345678', username: 'User 1' },
        youtubeId: 'youtubeId1'
      }
    ];
    axios.get.mockResolvedValueOnce({ data: videos });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <VideoList />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeTruthy();
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    fireEvent.change(screen.getByDisplayValue('Video 1'), { target: { value: 'Updated Video' } });
    fireEvent.change(screen.getByDisplayValue('Description 1'), { target: { value: 'Updated Description' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/videos'),
        { url: expect.any(String), title: 'Updated Video', description: 'Updated Description' },
        expect.any(Object)
      );
    });
  });

  it('deletes a video', async () => {
    const videos = [
      { 
        _id: '1',
        title: 'Video 1',
        description: 'Description 1',
        sharer: { _id: '12345678', username: 'User 1' },
        youtubeId: 'youtubeId1'
      }
    ];
    axios.get.mockResolvedValueOnce({ data: videos });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Router>
        <VideoList />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeTruthy();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    axios.delete.mockResolvedValueOnce({});

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/videos/1'),
        expect.any(Object)
      );
    });
  });
});
