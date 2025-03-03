import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Chatbot from './pages/Chatbot/Chatbot';
// import Calendar from './pages/Calendar/Calendar';
// import MainTasks from './pages/MainTasks/MainTasks';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chatbot" element={<Chatbot />} />
            {/* <Route path="/calendar" element={<Calendar />} />
            <Route path="/main-tasks" element={<MainTasks />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
