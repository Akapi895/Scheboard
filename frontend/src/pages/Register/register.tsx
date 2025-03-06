import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Gọi API đăng ký
      const response = await fetch('http://127.0.0.1:8000/api/credentials/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          confirm_password: confirmPassword, 
        }),
      });
      
      // Xử lý response
      const data = await response.json();
      
      if (!response.ok) {
        // Nếu có lỗi từ server
        throw new Error(data.detail || 'Registration failed');
      }
      
      // Nếu đăng ký thành công
      if (data.status === 'success') {
        // Lưu user_id vào localStorage
        localStorage.setItem('userId', data.data.user_id);
        
        // Hiển thị thông báo thành công
        console.log('Registration successful!: ', data.data.user_id);
        
        // Chuyển hướng đến trang profile
        navigate('/profile');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          {/* Các trường input giữ nguyên */}
          <div className="form-group">
            <div className="icon-box">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9H17V7H12V9ZM12 6H17V4H12V6ZM3 12H11V11.45C11 10.7 10.6333 10.1042 9.9 9.6625C9.16667 9.22083 8.2 9 7 9C5.8 9 4.83333 9.22083 4.1 9.6625C3.36667 10.1042 3 10.7 3 11.45V12ZM7 8C7.55 8 8.02083 7.80417 8.4125 7.4125C8.80417 7.02083 9 6.55 9 6C9 5.45 8.80417 4.97917 8.4125 4.5875C8.02083 4.19583 7.55 4 7 4C6.45 4 5.97917 4.19583 5.5875 4.5875C5.19583 4.97917 5 5.45 5 6C5 6.55 5.19583 7.02083 5.5875 7.4125C5.97917 7.80417 6.45 8 7 8ZM2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM2 14H18V2H2V14Z" fill="white"/>
              </svg>
            </div>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              // Không cần required vì field này không gửi lên server
            />
          </div>
          <div className="form-group">
            <div className="icon-box">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16V0H20V16H0ZM10 9L2 4V14H18V4L10 9ZM10 7L18 2H2L10 7ZM2 4V2V14V4Z" fill="white"/>
              </svg>
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <div className="icon-box">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 9C7.7625 9 6.70312 8.55938 5.82188 7.67813C4.94063 6.79688 4.5 5.7375 4.5 4.5C4.5 3.2625 4.94063 2.20312 5.82188 1.32188C6.70312 0.440625 7.7625 0 9 0C10.2375 0 11.2969 0.440625 12.1781 1.32188C13.0594 2.20312 13.5 3.2625 13.5 4.5C13.5 5.7375 13.0594 6.79688 12.1781 7.67813C11.2969 8.55938 10.2375 9 9 9ZM0 18V14.85C0 14.2125 0.164062 13.6266 0.492188 13.0922C0.820312 12.5578 1.25625 12.15 1.8 11.8688C2.9625 11.2875 4.14375 10.8516 5.34375 10.5609C6.54375 10.2703 7.7625 10.125 9 10.125C10.2375 10.125 11.4563 10.2703 12.6562 10.5609C13.8562 10.8516 15.0375 11.2875 16.2 11.8688C16.7438 12.15 17.1797 12.5578 17.5078 13.0922C17.8359 13.6266 18 14.2125 18 14.85V18H0ZM2.25 15.75H15.75V14.85C15.75 14.6437 15.6984 14.4562 15.5953 14.2875C15.4922 14.1187 15.3562 13.9875 15.1875 13.8938C14.175 13.3875 13.1531 13.0078 12.1219 12.7547C11.0906 12.5016 10.05 12.375 9 12.375C7.95 12.375 6.90937 12.5016 5.87812 12.7547C4.84687 13.0078 3.825 13.3875 2.8125 13.8938C2.64375 13.9875 2.50781 14.1187 2.40469 14.2875C2.30156 14.4562 2.25 14.6437 2.25 14.85V15.75ZM9 6.75C9.61875 6.75 10.1484 6.52969 10.5891 6.08906C11.0297 5.64844 11.25 5.11875 11.25 4.5C11.25 3.88125 11.0297 3.35156 10.5891 2.91094C10.1484 2.47031 9.61875 2.25 9 2.25C8.38125 2.25 7.85156 2.47031 7.41094 2.91094C6.97031 3.35156 6.75 3.88125 6.75 4.5C6.75 5.11875 6.97031 5.64844 7.41094 6.08906C7.85156 6.52969 8.38125 6.75 9 6.75Z" fill="white"/>
              </svg>
            </div>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <div className="icon-box">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.77778 18C1.28889 18 0.87037 17.8237 0.522222 17.4713C0.174074 17.1187 0 16.695 0 16.2V3.6C0 3.105 0.174074 2.68125 0.522222 2.32875C0.87037 1.97625 1.28889 1.8 1.77778 1.8H2.66667V0H4.44444V1.8H11.5556V0H13.3333V1.8H14.2222C14.7111 1.8 15.1296 1.97625 15.4778 2.32875C15.8259 2.68125 16 3.105 16 3.6V16.2C16 16.695 15.8259 17.1187 15.4778 17.4713C15.1296 17.8237 14.7111 18 14.2222 18H1.77778ZM1.77778 16.2H14.2222V7.2H1.77778V16.2ZM1.77778 5.4H14.2222V3.6H1.77778V5.4ZM8 10.8C7.74815 10.8 7.53704 10.7137 7.36667 10.5413C7.1963 10.3688 7.11111 10.155 7.11111 9.9C7.11111 9.645 7.1963 9.43125 7.36667 9.25875C7.53704 9.08625 7.74815 9 8 9C8.25185 9 8.46296 9.08625 8.63333 9.25875C8.8037 9.43125 8.88889 9.645 8.88889 9.9C8.88889 10.155 8.8037 10.3688 8.63333 10.5413C8.46296 10.7137 8.25185 10.8 8 10.8ZM4.44444 10.8C4.19259 10.8 3.98148 10.7137 3.81111 10.5413C3.64074 10.3688 3.55556 10.155 3.55556 9.9C3.55556 9.645 3.64074 9.43125 3.81111 9.25875C3.98148 9.08625 4.19259 9 4.44444 9C4.6963 9 4.90741 9.08625 5.07778 9.25875C5.24815 9.43125 5.33333 9.645 5.33333 9.9C5.33333 10.155 5.24815 10.3688 5.07778 10.5413C4.90741 10.7137 4.6963 10.8 4.44444 10.8ZM11.5556 10.8C11.3037 10.8 11.0926 10.7137 10.9222 10.5413C10.7519 10.3688 10.6667 10.155 10.6667 9.9C10.6667 9.645 10.7519 9.43125 10.9222 9.25875C11.0926 9.08625 11.3037 9 11.5556 9C11.8074 9 12.0185 9.08625 12.1889 9.25875C12.3593 9.43125 12.4444 9.645 12.4444 9.9C12.4444 10.155 12.3593 10.3688 12.1889 10.5413C12.0185 10.7137 11.8074 10.8 11.5556 10.8ZM8 14.4C7.74815 14.4 7.53704 14.3138 7.36667 14.1413C7.1963 13.9688 7.11111 13.755 7.11111 13.5C7.11111 13.245 7.1963 13.0312 7.36667 12.8588C7.53704 12.6862 7.74815 12.6 8 12.6C8.25185 12.6 8.46296 12.6862 8.63333 12.8588C8.8037 13.0312 8.88889 13.245 8.88889 13.5C8.88889 13.755 8.8037 13.9688 8.63333 14.1413C8.46296 14.3138 8.25185 14.4 8 14.4ZM4.44444 14.4C4.19259 14.4 3.98148 14.3138 3.81111 14.1413C3.64074 13.9688 3.55556 13.755 3.55556 13.5C3.55556 13.245 3.64074 13.0312 3.81111 12.8588C3.98148 12.6862 4.19259 12.6 4.44444 12.6C4.6963 12.6 4.90741 12.6862 5.07778 12.8588C5.24815 13.0312 5.33333 13.245 5.33333 13.5C5.33333 13.755 5.24815 13.9688 5.07778 14.1413C4.90741 14.3138 4.6963 14.4 4.44444 14.4ZM11.5556 14.4C11.3037 14.4 11.0926 14.3138 10.9222 14.1413C10.7519 13.9688 10.6667 13.755 10.6667 13.5C10.6667 13.245 10.7519 13.0312 10.9222 12.8588C11.0926 12.6862 11.3037 12.6 11.5556 12.6C11.8074 12.6 12.0185 12.6862 12.1889 12.8588C12.3593 13.0312 12.4444 13.245 12.4444 13.5C12.4444 13.755 12.3593 13.9688 12.1889 14.1413C12.0185 14.3138 11.8074 14.4 11.5556 14.4Z" fill="white"/>
              </svg>
            </div>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="Date of Birth"
                          />
          </div>

          {/* Password - field bắt buộc */}
          <div className="form-group">
            <div className="icon-box">
              <svg width="23" height="12" viewBox="0 0 23 12" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8C5.45 8 4.97917 7.80417 4.5875 7.4125C4.19583 7.02083 4 6.55 4 6C4 5.45 4.19583 4.97917 4.5875 4.5875C4.97917 4.19583 5.45 4 6 4C6.55 4 7.02083 4.19583 7.4125 4.5875C7.80417 4.97917 8 5.45 8 6C8 6.55 7.80417 7.02083 7.4125 7.4125C7.02083 7.80417 6.55 8 6 8ZM6 12C4.33333 12 2.91667 11.4167 1.75 10.25C0.583333 9.08333 0 7.66667 0 6C0 4.33333 0.583333 2.91667 1.75 1.75C2.91667 0.583333 4.33333 0 6 0C7.11667 0 8.12917 0.275 9.0375 0.825C9.94583 1.375 10.6667 2.1 11.2 3H20L23 6L18.5 10.5L16.5 9L14.5 10.5L12.375 9H11.2C10.6667 9.9 9.94583 10.625 9.0375 11.175C8.12917 11.725 7.11667 12 6 12ZM6 10C6.93333 10 7.75417 9.71667 8.4625 9.15C9.17083 8.58333 9.64167 7.86667 9.875 7H13L14.45 8.025L16.5 6.5L18.275 7.875L20.15 6L19.15 5H9.875C9.64167 4.13333 9.17083 3.41667 8.4625 2.85C7.75417 2.28333 6.93333 2 6 2C4.9 2 3.95833 2.39167 3.175 3.175C2.39167 3.95833 2 4.9 2 6C2 7.1 2.39167 8.04167 3.175 8.825C3.95833 9.60833 4.9 10 6 10Z" fill="white"/>
              </svg>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          <div className="form-group">
            <div className="icon-box">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="white"/>
              </svg>
            </div>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm Password"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
      <div className="login-link">
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;