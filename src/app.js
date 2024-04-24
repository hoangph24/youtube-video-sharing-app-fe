import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Login from './components/Login';
import Register from './components/Register/Register';
// import Home from './components/Home';

function Home() {
  return <h1>Home</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" component={Login} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;