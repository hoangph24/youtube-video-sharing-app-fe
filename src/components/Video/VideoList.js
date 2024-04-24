import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoList.css';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const videosPerPage = 5;

  const [videoLink, setVideoLink] = useState('');
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
        setVideos(Array(videosPerPage).fill({}));
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
      body: JSON.stringify({ username, url: videoLink }),
    });

    if (response.ok) {
      setVideoLink('');
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

  // if (!isLoggedIn) {
  //   navigate('/login');
  // }

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
        <button onClick={handleShare}>Share</button>
      </div>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {videos.map((video, index) => (
        <div key={index} className="video-item">
          {video.url ? (
            <>
              <video src={video.url} controls />
              <p>{video.title}</p>
            </>
          ) : (
            <div className="empty-video">No video</div>
          )}
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