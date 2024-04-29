import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './VideoList.css';

function VideoList() {
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn'));
  const [isReloaded, setIsReloaded] = useState(false);
  const videosPerPage = process.env.REACT_APP_VIDEOS_PER_PAGE || 5;

  const [videoLink, setVideoLink] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {    
    let storedUserId = '';

    if (token) {
      const decodedToken = decodeToken(token);
      storedUserId = decodedToken.id;
      if(storedUserId) {
        setIsLoggedIn(true);
      }
    }
    setUserId(storedUserId);
  }, [token]);

  function decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  }

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/${process.env.REACT_APP_API_VIDEOS}?page=${currentPage}&limit=${videosPerPage}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setVideos(response.data);
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage('An error occurred. Please try again.');
        }
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage, isLoggedIn, isReloaded]);

  const handleShare = async () => {
    try {
      await axios.post(`${apiUrl}/${process.env.REACT_APP_API_VIDEOS}`, {
        sharer: userId,
        url: videoLink,
        title: videoTitle,
        description: videoDescription
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      setVideoLink('');
      setVideoTitle('');
      setVideoDescription('');
      setSuccessMessage('Video shared successfully!');
      setErrorMessage('');
      setCurrentPage(1);
      setIsReloaded(prevState => !prevState);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const handleMyVideos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/${process.env.REACT_APP_API_VIDEOS}/my-videos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setVideos(response.data);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  async function handleEdit(id, newUrl, newTitle, newDescription) {
    try {
      const response = await axios.put(`${apiUrl}/${process.env.REACT_APP_API_VIDEOS}/${id}`, {
        url: newUrl,
        title: newTitle,
        description: newDescription,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      return response.data;
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  }
  
  async function handleDelete(id) {
    try {
      await axios.delete(`${apiUrl}/${process.env.REACT_APP_API_VIDEOS}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      setVideos(videos.filter(video => video.id !== id));
      setSuccessMessage('Video deleted successfully!');
      setIsReloaded(prevState => !prevState);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error occurred while deleting the video. Please try again.');
      }
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
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Enter video title"
        />
        <input
          type="text"
          value={videoDescription}
          onChange={e => setVideoDescription(e.target.value)}
          placeholder="Enter video description here"
        />
        <button onClick={handleShare}>Share</button>
        <button onClick={handleMyVideos}>My Videos</button>
      </div>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {successMessage && (
          <div className="success-notification">
            {successMessage}
            <button onClick={() => setSuccessMessage(null)}>X</button>
          </div>
        )}
      {errorMessage && (
          <div className="error-notification">
            {errorMessage}
            <button onClick={() => setErrorMessage(null)}>X</button>
          </div>
        )}
      {videos.map((video) => (
        <VideoItem key={video._id} video={video} userId={userId} />
    ))}
      <div className="pagination">
        <button onClick={handlePrevious}>Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );

  function VideoItem({ video, userId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(video.title);
    const [newDescription, setNewDescription] = useState(video.description);
    const [newUrl, setNewUrl] = useState(video.url);
  
    const handleEditClick = () => {
      setIsEditing(true);
    };
  
    const handleSubmitClick = async () => {
      let updatingUrl = newUrl;
      if (!newUrl) updatingUrl = `${process.env.REACT_APP_YOUTUBE_WATCH_URL}${video.youtubeId}`;
        const response = await handleEdit(video._id, updatingUrl, newTitle, newDescription);
        if (response) {
          setSuccessMessage('Video updated successfully!');
          setVideoLink('');
          setIsEditing(false);
          setIsReloaded(prevState => !prevState);
        }
    };

    const handleCancelClick = () => {
      setIsEditing(false);
    };
  
    return (
      <div className="video-item" key={video._id}>
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
            <p>Shared by: {video.sharer.username}</p>
            <p>{video.description}</p>
            <iframe
              width="560"
              height="315"
              src={`${process.env.REACT_APP_YOUTUBE_EMBED_URL}/${video.youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {userId === video.sharer._id && (
              <div>
                <button className="button button-edit" onClick={handleEditClick}>Edit</button>
                <button className="button button-delete" onClick={() => handleDelete(video._id)}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default VideoList;