import { useState, useEffect } from 'react';
import './Profile.css';

interface ProfileData {
  user_id?: number | null;
  username?: string;
  ava_url?: string;
  // full_name?: string;
  email?: string;
  about_me?: string;
  learning_style?: string;
  total_tasks?: number;
  completion_rate?: number;
  password?: string;
}

const Profile = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [avaUrl, setAvaUrl] = useState('');
  const [password, setPassword] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [learningStyle, setLearningStyle] = useState('Spaced Repetition');

  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });      

      if (!response.ok) {
        throw new Error(`Error fetching profile: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setProfile(data.data);
        
        // Initialize form fields with current values
        setAvaUrl(data.data.ava_url || '');
        setAboutMe(data.data.about_me || '');
        setLearningStyle(data.data.learning_style || 'Spaced Repetition');
      } else {
        throw new Error('API returned error status');
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      console.warn("No user ID found in localStorage. Some features may not work correctly.");
    }
  }, [userId]);

  const openPopup = () => {
    // Reset form fields with current profile values
    setAvaUrl(profile.ava_url || '');
    setAboutMe(profile.about_me || '');
    setLearningStyle(profile.learning_style || 'Spaced Repetition');
    setPassword(''); // Always reset password field
    
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const saveChanges = async () => {
    try {
      const updateData: ProfileData = {
        user_id: userId,
        ava_url: avaUrl,
        about_me: aboutMe,
        learning_style: learningStyle
      };

      // Only include password if it was changed
      if (password && password.trim() !== '') {
        updateData.password = password;
      }

      const response = await fetch('http://127.0.0.1:8000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Update local profile data
        setProfile(prev => ({
          ...prev,
          ava_url: avaUrl,
          about_me: aboutMe,
          learning_style: learningStyle
        }));
        
        alert('Profile updated successfully!');
      } else {
        throw new Error('API returned error status');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      closePopup();
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {/* Left Section */}
        <div className="left-section">
          <div className="avatar">
          <img
            id="avatar-img"
            src={
              profile.ava_url 
                ? `${profile.ava_url}?v=${Date.now()}`
                : "https://www.w3schools.com/howto/img_avatar.png"
            }
            alt="avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = "https://www.w3schools.com/howto/img_avatar.png";
              console.log("Image failed to load:", profile.ava_url);
            }}
          />
          </div>
          {/* <div className="username" id="username">{profile.username || "Username"}</div> */}
          <div className="user-id" id="user-id" style={{ display: 'none' }}>{profile.user_id || 0}</div>
        </div>
        
        {/* Right Section */}
        <div className="right-section">
          <div className="profile-info">
            {/* <div><span>Name:</span> <span id="full-name">{isLoading ? "Loading..." : (profile.full_name || "N/A")}</span></div> */}
            <div className="username" id="username">{profile.username || "Username"}</div>
            <div><span>Total tasks:</span> <span id="total-tasks">{isLoading ? "Loading..." : (profile.total_tasks || 0)}</span></div>
            <div><span>Completion rate:</span> <span id="completion-rate">
              {isLoading ? "Loading..." : (
                typeof profile.completion_rate === 'number' 
                  ? `${profile.completion_rate}%` 
                  : "0%"
              )}
            </span></div>
            <div><span>Email:</span> <span id="email">{isLoading ? "Loading..." : (profile.email || "N/A")}</span></div>
            <div><span>About me:</span> <span id="about-me">{isLoading ? "Loading..." : (profile.about_me || "No information available.")}</span></div>
            <div><span>Learning style:</span> <span id="learning-style">{isLoading ? "Loading..." : (profile.learning_style || "Not specified")}</span></div>
          </div>
          <button className="edit-btn" onClick={openPopup} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Edit'}
          </button>
        </div>

        {/* Popup Form */}
        {isPopupOpen && (
          <div id="popup-overlay" className={`popup-overlay ${isPopupOpen ? 'show' : ''}`}>
            <div className="popup">
              <h2>Edit Profile</h2>
              <div className="form-group">
                <label htmlFor="edit-ava-url">Avatar URL:</label>
                <input 
                  type="text" 
                  id="edit-ava-url" 
                  placeholder="Enter URL for your profile image"
                  value={avaUrl}
                  onChange={(e) => setAvaUrl(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-about-me">About Me:</label>
                <textarea 
                  id="edit-about-me" 
                  placeholder="Tell us about yourself"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-learning-style">Learning Style:</label>
                <select 
                  id="edit-learning-style"
                  value={learningStyle}
                  onChange={(e) => {
                    // alert("Change event triggered!"); // Kiểm tra sự kiện có kích hoạt không
                    // console.log("Selected Learning Style:", e.target.value);
                    setLearningStyle(e.target.value);
                  }}
                >
                  <option value="Spaced Repetition">Spaced Repetition</option>
                  <option value="Active Recall">Active Recall</option>
                  <option value="Interleaving">Interleaving</option>
                  <option value="Pomodoro">Pomodoro</option>
                  <option value="Feynman">Feynman</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-password">Password:</label>
                <input 
                  type="password" 
                  id="edit-password" 
                  placeholder="Enter new password (leave empty to keep current)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
          
              <div className="popup-buttons">
                <button onClick={saveChanges}>Save</button>
                <button onClick={closePopup}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
