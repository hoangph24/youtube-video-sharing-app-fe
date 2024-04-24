import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoList.css';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const videosPerPage = 5;

  const [videoLink, setVideoLink] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/videos?page=${currentPage}&limit=${videosPerPage}`);
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
    const response = await fetch('http://localhost:8000/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      setErrorMessage('Failed to share video');
    }
  };

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
      {videos.map((video, index) => (
      <div className="video-item" key={index}>
        <h2>{video.title}</h2>
        <p>Shared by: {video.sharer}</p>
        <p>{video.description}</p>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${video.id}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    ))}
      <div className="pagination">
        <button onClick={handlePrevious}>Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default VideoList;