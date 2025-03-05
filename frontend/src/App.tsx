import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile/Profile';
import Chatbot from './pages/Chatbot/Chatbot';
import Calendar from './pages/Calendar/Calendar';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './pages/Login/login';
import Register from './pages/Register/register';
import Dashboard from './pages/Dashboard/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/user_id', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          handleLogout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    if (isAuthenticated) {
      checkAuthStatus();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/credentials/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
    }
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Sidebar onLogout={handleLogout} />}
        <div className="content">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
              }
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
              }
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
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
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />}
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;