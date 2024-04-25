import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt from 'jsonwebtoken';
import './VideoList.css';

function VideoList() {
  const [username, setUsername] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn'));
  const videosPerPage = process.env.VIDEOS_PER_PAGE || 5;

  const [videoLink, setVideoLink] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const protocol = process.env.PROTOCOL;
  const host = process.env.HOST;
  const port = process.env.PORT;
  const url = `${protocol}://${host}:${port}`;

  useEffect(() => {    
    let storedUsername = '';

    if (token) {
      const decodedToken = jwt.decode(token);
      storedUsername = decodedToken.username;
      if(storedUsername) setIsLoggedIn(true);
    }
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${url}/videos?page=${currentPage}&limit=${videosPerPage}`);
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        setVideos([]);
      }
      setIsLoading(false);
    };

    fetchVideos();
  }, [currentPage, isLoggedIn]);

  const handleShare = async () => {
    const username = localStorage.getItem('username');
    const response = await fetch(`${url}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sharer: username, url: videoLink, description: videoDescription }),
    });

    if (response.ok) {
      setVideoLink('');
      setVideoDescription('');
      setSuccessMessage('Video shared successfully!');
      setErrorMessage('');
      setCurrentPage(1);
    } else {
      const errorData = await response.json();
      setErrorMessage(errorData.message);
    }
  };

  async function handleEdit(id, newUrl, newTitle, newDescription) {
    const response = await fetch(`${url}/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: newUrl,
        title: newTitle,
        description: newDescription,
      }),
    });
  
    return response;
  }
  
  async function handleDelete(id) {
    try {
      const response = await fetch(`${url}/videos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }

      setVideos(videos.filter(video => video.id !== id));
    } catch (error) {
      alert('An error occurred while deleting the video. Please try again.');
    }
  }

  const handlePrevious = () => {
    setCurrentPage((oldPage) => Math.max(oldPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((oldPage) => oldPage + 1);
  };

  if (!isLoggedIn) {
    navigate('/login');
  }

  if (isLoading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="video-list">
      <div className="share-video">
        <input
          type="text"
          value={videoLink}
          onChange={e => setVideoLink(e.target.value)}
          placeholder="Paste YouTube video link here"
        />
        <input
          type="text"
          value={videoDescription}
          onChange={e => setVideoDescription(e.target.value)}
          placeholder="Enter video description here"
        />
        <button onClick={handleShare}>Share</button>
      </div>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {videos.map((video) => (
        <VideoItem key={video.id} video={video} username={username} />
    ))}
      <div className="pagination">
        <button onClick={handlePrevious}>Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );

  function VideoItem({ video, username }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(video.title);
    const [newDescription, setNewDescription] = useState(video.description);
    const [newUrl, setNewUrl] = useState(video.url);
  
    const handleEditClick = () => {
      setIsEditing(true);
    };
  
    const handleSubmitClick = async () => {
      try {
        const response = await handleEdit(video.id, newUrl, newTitle, newDescription);
        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.message);
        }
        const updatedVideo = await response.json();
        setVideoLink(updatedVideo.url);
        setIsEditing(false);
      } catch (error) {
        alert('An error occurred while updating the video. Please try again.');
      }
    };

    const handleCancelClick = () => {
      setIsEditing(false);
    };
  
    return (
      <div className="video-item">
        {isEditing ? (
          <div>
            <input className="input-field" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New Title"/>
            <input className="input-field" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="New Description"/>
            <input className="input-field" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="New Video URL"/>
            <button className="button button-edit" onClick={handleSubmitClick}>Submit</button>
          <button className="button button-delete" onClick={handleCancelClick}>Cancel</button>
          </div>
        ) : (
          <div>
            <h2>{video.title}</h2>
            <p>Shared by: {video.sharer}</p>
            <p>{video.description}</p>
            <iframe
              width="560"
              height="315"
              src={`${process.env.YOUTUBE_EMBED_URL}/${video.id}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {username === video.sharer && (
              <div>
                <button className="button button-edit" onClick={handleEditClick}>Edit</button>
                <button className="button button-delete" onClick={() => handleDelete(video.id)}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default VideoList;