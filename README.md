# YouTube Video Sharing App

## Introduction
This is a React-based application that allows users to share and view YouTube videos. Key features include user authentication, video uploading, and management for each video.

## Prerequisites
- Node.js (v20 or later)
- npm (v6 or later)
- Docker (v20.10 or later)
- MongoDB Atlas account

## Installation & Configuration
1. Clone the repository: `git clone https://github.com/yourusername/youtube-video-sharing-app-fe.git`
2. Navigate to the project directory: `cd youtube-video-sharing-app-fe`
3. Install dependencies: `npm install`

## Database Setup
This application uses MongoDB Atlas for database services. To set up, follow these steps:
1. Create a new cluster in the [MongoDB Atlas console](https://cloud.mongodb.com/).
2. Navigate to the database access and create a new database user.
3. Under network access, add a new IP address. For development, you can allow access from anywhere.
4. Click on 'Connect', select 'Connect your application', copy the connection string and replace `<password>` with your database user password.
5. Create a `.env` file in the root directory and paste the connection string as the value for `REACT_APP_API_URL`.

## Running the Application
1. Start the development server: `npm start`
2. Access the application in a web browser at `http://localhost:3000`
3. Run the test suite: `npm test`

## Docker Deployment
1. Build the Docker image: `docker build -t youtube-video-sharing-app-fe .`
2. Run the Docker container: `docker run -p 3000:3000 -d youtube-video-sharing-app-fe`

## Usage
Once logged in, users can share videos through the 'Share' button. Users can edit or delete videos they have shared. Each time it is successfully shared, a notification will be sent to the remaining users.

## Troubleshooting
If you encounter issues during setup, ensure that all prerequisites are correctly installed and that the MongoDB configuration details are correctly entered in the `.env` file.