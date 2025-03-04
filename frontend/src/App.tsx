import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile/Profile';
import Chatbot from './pages/Chatbot/Chatbot';
import Calendar from './pages/Calendar/Calendar';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './pages/Login/login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    // Logic đăng nhập thực tế sẽ ở đây
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Sidebar />}
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/chatbot"
              element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" />}
            />
            <Route
              path="/calendar"
              element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />}
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;