import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => {
    setIsPopupOpen(true);
    console.log("Popup opened, state:", isPopupOpen);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const saveChanges = () => {
    // Implement save changes logic here
    closePopup();
  };

  return (
    <div className="profile-container">
      {/* Left Section */}
      <div className="left-section">
        <div className="avatar">
          <img id="avatar-img" src="https://www.w3schools.com/howto/img_avatar.png" alt="avatar" />
        </div>
        <div className="username" id="username">Username</div>
        <div className="user-id" id="user-id" style={{ display: 'none' }}>0</div>
      </div>
      
      {/* Right Section */}
      <div className="right-section">
        <div className="profile-info">
          <div><span>Name:</span> <span id="full-name">Loading...</span></div>
          <div><span>Total tasks:</span> <span id="total-tasks">Loading...</span></div>
          <div><span>Completion rate:</span> <span id="completion-rate">Loading...</span></div>
          <div><span>Email:</span> <span id="email">Loading...</span></div>
          <div><span>About me:</span> <span id="about-me">Loading...</span></div>
          <div><span>Learning style:</span> <span id="learning-style">Loading...</span></div>
        </div>
        <button className="edit-btn" onClick={openPopup}>Edit</button>
      </div>

      {/* Popup Form */}
      {isPopupOpen && (
        <div id="popup-overlay" className={`popup-overlay ${isPopupOpen ? 'show' : ''}`}>
        <div className="popup">
          <h2>Edit Profile</h2>
          <div className="form-group">
            <label htmlFor="edit-ava-url">Avatar URL:</label>
            <input type="text" id="edit-ava-url" placeholder="Enter URL for your profile image" />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-password">Password:</label>
            <input type="password" id="edit-password" placeholder="Enter new password" />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-about-me">About Me:</label>
            <textarea id="edit-about-me" placeholder="Tell us about yourself"></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-learning-style">Learning Style:</label>
            <select id="edit-learning-style">
              <option value="Feynman">Feynman</option>
              <option value="Pomodoro">Pomodoro</option>
              <option value="Interleaving">Interleaving</option>
              <option value="Active Recall">Active Recall</option>
              <option value="Spaced Repetition">Spaced Repetition</option>
            </select>
          </div>
      
          <div className="popup-buttons">
            <button onClick={saveChanges}>Save</button>
            <button onClick={closePopup}>Cancel</button>
          </div>
        </div>
      </div>
      
      )}
    </div>
  );
};

export default Profile;
