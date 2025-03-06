import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

// Định nghĩa interface cho main task
interface MainTask {
  task_id: number;
  task_name: string;
  // Các thuộc tính khác nếu cần
}

const Sidebar = ({ onLogout }: { onLogout?: () => void }) => {
  const navigate = useNavigate();
  
  // Lấy userId từ localStorage
  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [showMainTasks, setShowMainTasks] = useState(false);
  const [loading, setLoading] = useState(false);

  // Thêm useEffect để gọi API lấy main tasks khi component được mount hoặc userId thay đổi
  useEffect(() => {
    if (userId) {
      fetchMainTasks();
    }
  }, [userId]);

  // Hàm gọi API để lấy danh sách main tasks
  const fetchMainTasks = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/main-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching main tasks: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        // setMainTasks(...data.data);
        setMainTasks([...data.data]);
        // console.log(data.data);
      } else {
        throw new Error('Failed to fetch main tasks');
      }
    } catch (error) {
      console.error('Error fetching main tasks:', error);
    } finally {
      setLoading(false);
    }
    // console.log(mainTasks);
  };

  useEffect(() => {
    // console.log("Updated mainTasks:", mainTasks);
  }, [mainTasks]);

  // Hàm toggle hiển thị/ẩn danh sách main tasks
  const toggleMainTasks = () => {
    setShowMainTasks(!showMainTasks);
  };

  const handleLogout = async () => {
    try {
      // Gọi API để xóa session ở server
      const response = await fetch('http://127.0.0.1:8000/api/credentials/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Logout failed:', response.status);
      } else {
        console.log('Logged out successfully from server');
      }

      // Xóa dữ liệu đăng nhập ở client
      localStorage.removeItem('userId');
      localStorage.removeItem('isAuthenticated');
      
      // Gọi onLogout nếu có (để cập nhật state ở component cha)
      if (onLogout) {
        onLogout();
      }

      // Chuyển hướng về trang đăng nhập
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Xử lý lỗi và vẫn logout ở client side để đảm bảo người dùng có thể thoát
      localStorage.removeItem('userId');
      localStorage.removeItem('isAuthenticated');
      navigate('/login');
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <ul>
          <li>
            <Link to="#"> {/*TODO*/}
              <span className="icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#06094D"/>
                </svg>
              </span>
              <span className="title">Search</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <span className="icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0H8V8H0V0ZM10 0H18V8H10V0ZM0 10H8V18H0V10ZM13 10H15V13H18V15H15V18H13V15H10V13H13V10ZM12 2V6H16V2H12ZM2 2V6H6V2H2ZM2 12V16H6V12H2Z" fill="#06094D"/>
                </svg>
              </span>
              <span className="title">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/calendar">
              <span className="icon">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.77778 18C1.28889 18 0.87037 17.8237 0.522222 17.4712C0.174074 17.1187 0 16.695 0 16.2V3.6C0 3.105 0.174074 2.68125 0.522222 2.32875C0.87037 1.97625 1.28889 1.8 1.77778 1.8H2.66667V0H4.44444V1.8H11.5556V0H13.3333V1.8H14.2222C14.7111 1.8 15.1296 1.97625 15.4778 2.32875C15.8259 2.68125 16 3.105 16 3.6V16.2C16 16.695 15.8259 17.1187 15.4778 17.4712C15.1296 17.8237 14.7111 18 14.2222 18H1.77778ZM1.77778 16.2H14.2222V7.2H1.77778V16.2ZM1.77778 5.4H14.2222V3.6H1.77778V5.4ZM8 10.8C7.74815 10.8 7.53704 10.7138 7.36667 10.5413C7.1963 10.3688 7.11111 10.155 7.11111 9.9C7.11111 9.645 7.1963 9.43125 7.36667 9.25875C7.53704 9.08625 7.74815 9 8 9C8.25185 9 8.46296 9.08625 8.63333 9.25875C8.8037 9.43125 8.88889 9.645 8.88889 9.9C8.88889 10.155 8.8037 10.3688 8.63333 10.5413C8.46296 10.7138 8.25185 10.8 8 10.8ZM4.44444 10.8C4.19259 10.8 3.98148 10.7138 3.81111 10.5413C3.64074 10.3688 3.55556 10.155 3.55556 9.9C3.55556 9.645 3.64074 9.43125 3.81111 9.25875C3.98148 9.08625 4.19259 9 4.44444 9C4.6963 9 4.90741 9.08625 5.07778 9.25875C5.24815 9.43125 5.33333 9.645 5.33333 9.9C5.33333 10.155 5.24815 10.3688 5.07778 10.5413C4.90741 10.7138 4.6963 10.8 4.44444 10.8ZM11.5556 10.8C11.3037 10.8 11.0926 10.7138 10.9222 10.5413C10.7519 10.3688 10.6667 10.155 10.6667 9.9C10.6667 9.645 10.7519 9.43125 10.9222 9.25875C11.0926 9.08625 11.3037 9 11.5556 9C11.8074 9 12.0185 9.08625 12.1889 9.25875C12.3593 9.43125 12.4444 9.645 12.4444 9.9C12.4444 10.155 12.3593 10.3688 12.1889 10.5413C12.0185 10.7138 11.8074 10.8 11.5556 10.8ZM8 14.4C7.74815 14.4 7.53704 14.3138 7.36667 14.1413C7.1963 13.9688 7.11111 13.755 7.11111 13.5C7.11111 13.245 7.1963 13.0312 7.36667 12.8588C7.53704 12.6863 7.74815 12.6 8 12.6C8.25185 12.6 8.46296 12.6863 8.63333 12.8588C8.8037 13.0312 8.88889 13.245 8.88889 13.5C8.88889 13.755 8.8037 13.9688 8.63333 14.1413C8.46296 14.3138 8.25185 14.4 8 14.4ZM4.44444 14.4C4.19259 14.4 3.98148 14.3138 3.81111 14.1413C3.64074 13.9688 3.55556 13.755 3.55556 13.5C3.55556 13.245 3.64074 13.0312 3.81111 12.8588C3.98148 12.6863 4.19259 12.6 4.44444 12.6C4.6963 12.6 4.90741 12.6863 5.07778 12.8588C5.24815 13.0312 5.33333 13.245 5.33333 13.5C5.33333 13.755 5.24815 13.9688 5.07778 14.1413C4.90741 14.3138 4.6963 14.4 4.44444 14.4ZM11.5556 14.4C11.3037 14.4 11.0926 14.3138 10.9222 14.1413C10.7519 13.9688 10.6667 13.755 10.6667 13.5C10.6667 13.245 10.7519 13.0312 10.9222 12.8588C11.0926 12.6863 11.3037 12.6 11.5556 12.6C11.8074 12.6 12.0185 12.6863 12.1889 12.8588C12.3593 13.0312 12.4444 13.245 12.4444 13.5C12.4444 13.755 12.3593 13.9688 12.1889 14.1413C12.0185 14.3138 11.8074 14.4 11.5556 14.4Z" fill="#06094D"/>
                </svg>
              </span>
              <span className="title">Calendar</span>
            </Link>
          </li>
          <li>
            <Link to="/chatbot">
              <span className="icon">
                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.36364 13.5C2.56818 13.5 1.89205 13.2083 1.33523 12.625C0.778409 12.0417 0.5 11.3333 0.5 10.5C0.5 9.66667 0.778409 8.95833 1.33523 8.375C1.89205 7.79167 2.56818 7.5 3.36364 7.5V5.5C3.36364 4.95 3.55057 4.47917 3.92443 4.0875C4.2983 3.69583 4.74773 3.5 5.27273 3.5H8.13636C8.13636 2.66667 8.41477 1.95833 8.97159 1.375C9.52841 0.791667 10.2045 0.5 11 0.5C11.7955 0.5 12.4716 0.791667 13.0284 1.375C13.5852 1.95833 13.8636 2.66667 13.8636 3.5H16.7273C17.2523 3.5 17.7017 3.69583 18.0756 4.0875C18.4494 4.47917 18.6364 4.95 18.6364 5.5V7.5C19.4318 7.5 20.108 7.79167 20.6648 8.375C21.2216 8.95833 21.5 9.66667 21.5 10.5C21.5 11.3333 21.2216 12.0417 20.6648 12.625C20.108 13.2083 19.4318 13.5 18.6364 13.5V17.5C18.6364 18.05 18.4494 18.5208 18.0756 18.9125C17.7017 19.3042 17.2523 19.5 16.7273 19.5H5.27273C4.74773 19.5 4.2983 19.3042 3.92443 18.9125C3.55057 18.5208 3.36364 18.05 3.36364 17.5V13.5ZM8.13636 11.5C8.53409 11.5 8.87216 11.3542 9.15057 11.0625C9.42898 10.7708 9.56818 10.4167 9.56818 10C9.56818 9.58333 9.42898 9.22917 9.15057 8.9375C8.87216 8.64583 8.53409 8.5 8.13636 8.5C7.73864 8.5 7.40057 8.64583 7.12216 8.9375C6.84375 9.22917 6.70455 9.58333 6.70455 10C6.70455 10.4167 6.84375 10.7708 7.12216 11.0625C7.40057 11.3542 7.73864 11.5 8.13636 11.5ZM13.8636 11.5C14.2614 11.5 14.5994 11.3542 14.8778 11.0625C15.1562 10.7708 15.2955 10.4167 15.2955 10C15.2955 9.58333 15.1562 9.22917 14.8778 8.9375C14.5994 8.64583 14.2614 8.5 13.8636 8.5C13.4659 8.5 13.1278 8.64583 12.8494 8.9375C12.571 9.22917 12.4318 9.58333 12.4318 10C12.4318 10.4167 12.571 10.7708 12.8494 11.0625C13.1278 11.3542 13.4659 11.5 13.8636 11.5ZM7.18182 15.5H14.8182V13.5H7.18182V15.5ZM5.27273 17.5H16.7273V5.5H5.27273V17.5Z" fill="#06094D"/>
                </svg>
              </span>
              <span className="title">Chatbot</span>
            </Link>
          </li>
          <li className="main-task">
  <div className="main-task-header" onClick={toggleMainTasks}>
    <hr />
    <span>MAIN TASKS</span>
    <hr />
  </div>

  {showMainTasks && (
    <div className="main-tasks-list">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : mainTasks.length > 0 ? (
        mainTasks.map((task) => (
          <Link 
            key={task.task_id} 
            to={`/tasks/${task.task_id}`}
            className="main-task-item"
          >
            <span className="task-name">{task.task_name}</span>
          </Link>
        ))
      ) : (
        <div className="no-tasks">No tasks available</div>
      )}
    </div>
  )}
  </li> 
          <li>
          <Link to="/profile">
              <span className="icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 9C7.7625 9 6.70313 8.55938 5.82188 7.67813C4.94063 6.79688 4.5 5.7375 4.5 4.5C4.5 3.2625 4.94063 2.20313 5.82188 1.32188C6.70313 0.440625 7.7625 0 9 0C10.2375 0 11.2969 0.440625 12.1781 1.32188C13.0594 2.20313 13.5 3.2625 13.5 4.5C13.5 5.7375 13.0594 6.79688 12.1781 7.67813C11.2969 8.55938 10.2375 9 9 9ZM0 18V14.85C0 14.2125 0.164062 13.6266 0.492188 13.0922C0.820313 12.5578 1.25625 12.15 1.8 11.8688C2.9625 11.2875 4.14375 10.8516 5.34375 10.5609C6.54375 10.2703 7.7625 10.125 9 10.125C10.2375 10.125 11.4562 10.2703 12.6562 10.5609C13.8563 10.8516 15.0375 11.2875 16.2 11.8688C16.7438 12.15 17.1797 12.5578 17.5078 13.0922C17.8359 13.6266 18 14.2125 18 14.85V18H0ZM2.25 15.75H15.75V14.85C15.75 14.6437 15.6984 14.4562 15.5953 14.2875C15.4922 14.1187 15.3563 13.9875 15.1875 13.8938C14.175 13.3875 13.1531 13.0078 12.1219 12.7547C11.0906 12.5016 10.05 12.375 9 12.375C7.95 12.375 6.90937 12.5016 5.87812 12.7547C4.84687 13.0078 3.825 13.3875 2.8125 13.8938C2.64375 13.9875 2.50781 14.1187 2.40469 14.2875C2.30156 14.4562 2.25 14.6437 2.25 14.85V15.75ZM9 6.75C9.61875 6.75 10.1484 6.52969 10.5891 6.08906C11.0297 5.64844 11.25 5.11875 11.25 4.5C11.25 3.88125 11.0297 3.35156 10.5891 2.91094C10.1484 2.47031 9.61875 2.25 9 2.25C8.38125 2.25 7.85156 2.47031 7.41094 2.91094C6.97031 3.35156 6.75 3.88125 6.75 4.5C6.75 5.11875 6.97031 5.64844 7.41094 6.08906C7.85156 6.52969 8.38125 6.75 9 6.75Z" fill="#06094D"/>
                        </svg>                                                                                                                                       
                    </span>
                    <span className = "title">Profile</span>
                </Link>
            </li>
            <li>
                <Link to= "/setting"> {/*TODO*/}
                    <span className = "icon"> 
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.53731 18L6.1791 15.12C5.98507 15.045 5.80224 14.955 5.6306 14.85C5.45895 14.745 5.29104 14.6325 5.12687 14.5125L2.46269 15.6375L0 11.3625L2.30597 9.6075C2.29104 9.5025 2.28358 9.40125 2.28358 9.30375V8.69625C2.28358 8.59875 2.29104 8.4975 2.30597 8.3925L0 6.6375L2.46269 2.3625L5.12687 3.4875C5.29104 3.3675 5.46269 3.255 5.64179 3.15C5.8209 3.045 6 2.955 6.1791 2.88L6.53731 0H11.4627L11.8209 2.88C12.0149 2.955 12.1978 3.045 12.3694 3.15C12.541 3.255 12.709 3.3675 12.8731 3.4875L15.5373 2.3625L18 6.6375L15.694 8.3925C15.709 8.4975 15.7164 8.59875 15.7164 8.69625V9.30375C15.7164 9.40125 15.7015 9.5025 15.6716 9.6075L17.9776 11.3625L15.5149 15.6375L12.8731 14.5125C12.709 14.6325 12.5373 14.745 12.3582 14.85C12.1791 14.955 12 15.045 11.8209 15.12L11.4627 18H6.53731ZM8.10448 16.2H9.87313L10.1866 13.815C10.6493 13.695 11.0784 13.5187 11.4739 13.2862C11.8694 13.0537 12.2313 12.7725 12.5597 12.4425L14.7761 13.365L15.6493 11.835L13.7239 10.3725C13.7985 10.1625 13.8507 9.94125 13.8806 9.70875C13.9104 9.47625 13.9254 9.24 13.9254 9C13.9254 8.76 13.9104 8.52375 13.8806 8.29125C13.8507 8.05875 13.7985 7.8375 13.7239 7.6275L15.6493 6.165L14.7761 4.635L12.5597 5.58C12.2313 5.235 11.8694 4.94625 11.4739 4.71375C11.0784 4.48125 10.6493 4.305 10.1866 4.185L9.89552 1.8H8.12687L7.81343 4.185C7.35075 4.305 6.92164 4.48125 6.52612 4.71375C6.1306 4.94625 5.76866 5.2275 5.4403 5.5575L3.22388 4.635L2.35075 6.165L4.27612 7.605C4.20149 7.83 4.14925 8.055 4.1194 8.28C4.08955 8.505 4.07463 8.745 4.07463 9C4.07463 9.24 4.08955 9.4725 4.1194 9.6975C4.14925 9.9225 4.20149 10.1475 4.27612 10.3725L2.35075 11.835L3.22388 13.365L5.4403 12.42C5.76866 12.765 6.1306 13.0537 6.52612 13.2862C6.92164 13.5187 7.35075 13.695 7.81343 13.815L8.10448 16.2ZM9.04478 12.15C9.91045 12.15 10.6493 11.8425 11.2612 11.2275C11.8731 10.6125 12.1791 9.87 12.1791 9C12.1791 8.13 11.8731 7.3875 11.2612 6.7725C10.6493 6.1575 9.91045 5.85 9.04478 5.85C8.16418 5.85 7.42164 6.1575 6.81716 6.7725C6.21269 7.3875 5.91045 8.13 5.91045 9C5.91045 9.87 6.21269 10.6125 6.81716 11.2275C7.42164 11.8425 8.16418 12.15 9.04478 12.15Z" fill="#06094D"/>
                        </svg>                                                                                                                                                                 
                    </span>
                    <span className = "title">Setting</span>
                </Link>
            </li>
            <li>
                <Link to= "#"> {/*TODO*/}
                    <span className = "icon"> 
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H9V2H2V16H9V18H2ZM13 14L11.625 12.55L14.175 10H6V8H14.175L11.625 5.45L13 4L18 9L13 14Z" fill="#06094D"/>
                        </svg>                                                                                                                                                                                            
                    </span>
                    <span className = "title" onClick={handleLogout}>Logout</span>
                </Link>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;