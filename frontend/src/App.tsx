import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile/Profile';
import Chatbot from './pages/Chatbot/Chatbot';
import Calendar from './pages/Calendar/Calendar';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './pages/Login/login';
import './App.css';

function App() {
  // Kiểm tra localStorage khi khởi tạo component để duy trì phiên đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Kiểm tra trạng thái xác thực khi component mount
  useEffect(() => {
    // Kiểm tra với backend xem token còn hiệu lực không
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/user_id', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Session đã hết hạn, đăng xuất
          handleLogout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    if (isAuthenticated) {
      checkAuthStatus();
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = async () => {
    try {
      // Gọi API logout để xóa session phía server
      await fetch('http://127.0.0.1:8000/api/credentials/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa dữ liệu lưu trữ cục bộ
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
                isAuthenticated ? <Navigate to="/profile" /> : <Login onLogin={handleLogin} />
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
              path="/" 
              element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;