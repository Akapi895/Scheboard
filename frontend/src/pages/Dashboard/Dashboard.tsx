import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile, faMeh, faFrown, faTired, faAngry } from "@fortawesome/free-solid-svg-icons";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import TaskTable from "../../components/task_table/task_table";
import './Dashboard.css';

// Thêm interface cho dữ liệu dashboard
interface DashboardData {
  total_main_task: number;
  today_task_cnt: number;
  mood?: string; // Mood có thể là tùy chọn
}

interface DonutChartData {
  completed: number;
  inprogress: number;
  todo: number;
}

interface TaskItem {
  task_id: number;
  task_name: string;
  description: string;
  task_type: string;
  due_date: string;
  priority: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Thêm state để lưu trữ dữ liệu dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  useEffect(() => {
    if (!userId) {
      // Now you can use navigate, as it's properly defined
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [userId, navigator]);
  
  
  // Thêm state cho pieData
  const [pieData, setPieData] = useState([
    { name: "Study", value: 40, color: "#0088FE" },
    { name: "Work", value: 30, color: "#00C49F" },
    { name: "Health", value: 20, color: "#FFBB28" },
    { name: "Leisure", value: 10, color: "#FF8042" },
  ]);
  
  const [barChart, setBarChart] = useState([
    { day: "Mon", tasks: 0 },
    { day: "Tue", tasks: 0 },
    { day: "Wed", tasks: 0 },
    { day: "Thu", tasks: 0 },
    { day: "Fri", tasks: 0 },
    { day: "Sat", tasks: 0 },
    { day: "Sun", tasks: 0 },
  ]);

  const [donutData, setDonutData] = useState([
    { name: "Completed", value: 30, color: "#4CAF50" },
    { name: "In Progress", value: 45, color: "#FFC107" },
    { name: "Todo", value: 25, color: "#2196F3" },
  ]);

  // Thêm hàm fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard', {
        method: 'POST', // API sử dụng phương thức POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setDashboardData(result.data);
        console.log("Dashboard data loaded:", result.data);
        
        // Nếu API trả về mood, cập nhật state selectedMood
        if (result.data.mood) {
          setSelectedMood(result.data.mood);
        }
      } else {
        console.error("Failed to fetch dashboard data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Thêm hàm fetchPieChartData
  const fetchPieChartData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/piechart', {
        method: 'POST', // API sử dụng phương thức POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const formattedData = [
          { name: "Study", value: result.data.study_percent || 0, color: "#0088FE" },
          { name: "Work", value: result.data.work_percent || 0, color: "#00C49F" },
          { name: "Health", value: result.data.health_percent || 0, color: "#FFBB28" },
          { name: "Leisure", value: result.data.leisure_percent || 0, color: "#FF8042" },
        ];
        
        setPieData(formattedData);
        console.log("Pie chart data loaded:", formattedData);
      } else {
        console.error("Failed to fetch pie chart data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching pie chart data:", error);
      // Nếu có lỗi, giữ nguyên dữ liệu mặc định (không cần làm gì)
    }
  };

  // Thêm hàm fetchBarChartData
  const fetchBarChartData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/barchart', {
        method: 'POST', // API sử dụng phương thức POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        // Format dữ liệu cho BarChart từ API response
        // API trả về { "Mon": 5, "Tue": 3, "Wed": 8, ... }
        // Chuyển thành [{ day: "Mon", tasks: 5 }, { day: "Tue", tasks: 3 }, ...]
        
        const formattedData = Object.entries(result.data).map(([day, tasks]) => ({
          day,
          tasks: tasks as number
        }));
        
        console.log("Bar chart data loaded:", formattedData);
        setBarChart(formattedData);
      } else {
        console.error("Failed to fetch bar chart data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching bar chart data:", error);
      // Nếu có lỗi, giữ nguyên dữ liệu mặc định
    }
  };

  // Thêm hàm này sau các hàm fetch khác
  const fetchDonutChartData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/donutchart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        // API trả về { completed: 30, inprogress: 45, todo: 25 }
        // Chuyển đổi thành định dạng mà recharts có thể sử dụng
        const formattedData = [
          { name: "Completed", value: Number((result.data.completed || 0).toFixed(1)), color: "#4CAF50" },
          { name: "In Progress", value: Number((result.data.inprogress || 0).toFixed(1)), color: "#FFC107" },
          { name: "Todo", value: Number((result.data.todo || 0).toFixed(1)), color: "#2196F3" },
        ];        
        
        setDonutData(formattedData);
        console.log("Donut chart data loaded:", formattedData);
      } else {
        console.error("Failed to fetch donut chart data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching donut chart data:", error);
      // Nếu có lỗi, giữ nguyên dữ liệu mặc định
    }
  };

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  // Thêm hàm này sau các hàm fetch khác
  const fetchUpcomingTasks = async () => {
    try {
      console.log("Fetching upcoming tasks for user:", userId);
      
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/upcoming/overall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      console.log("Upcoming tasks API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upcoming tasks API result:", result);

      if (result.status === 'success' && Array.isArray(result.data)) {
        setTasks(result.data);
        console.log("Upcoming tasks loaded:", result.data);
      } else {
        console.error("Failed to fetch upcoming tasks:", result.message || "Invalid data format");
        // Nếu không có dữ liệu hoặc lỗi, sử dụng dữ liệu mẫu
        setTasks([
          { 
            task_id: 1, 
            task_name: "No tasks for today", 
            description: "You have no tasks scheduled for today", 
            priority: "-", 
            due_date: "-",
            task_type: "info" 
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      // Sử dụng dữ liệu mẫu nếu có lỗi
      setTasks([
        { 
          task_id: 1, 
          task_name: "Error loading tasks", 
          description: "Could not load your tasks. Please try again later.", 
          priority: "-", 
          due_date: "-",
          task_type: "error" 
        }
      ]);
    }
  };

  useEffect(() => {
    // Gọi API để lấy dữ liệu dashboard chung
    fetchDashboardData();
    
    // Gọi API để lấy dữ liệu cho pie chart
    fetchPieChartData();

    // Gọi API để lấy dữ liệu cho bar chart
    fetchBarChartData();

    // Gọi API để lấy dữ liệu cho donut chart
    fetchDonutChartData();

    // Gọi API để lấy dữ liệu upcoming tasks
    fetchUpcomingTasks();
    
    // Giữ nguyên giả lập loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Thêm hàm xử lý cập nhật mood
  const handleMoodChange = async (mood: string) => {
    setSelectedMood(mood);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/mood/change', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          mood: mood
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success') {
        console.error("Failed to update mood:", result.message);
      }
    } catch (error) {
      console.error("Error updating mood:", error);
    }
  };

  const moods = [
    { name: "Good", icon: <FontAwesomeIcon icon={faSmile} />, className: "good" },
    { name: "Fine", icon: <FontAwesomeIcon icon={faMeh} />, className: "fine" },
    { name: "Sad", icon: <FontAwesomeIcon icon={faFrown} />, className: "sad" },
    { name: "Tired", icon: <FontAwesomeIcon icon={faTired} />, className: "tired" },
    { name: "Angry", icon: <FontAwesomeIcon icon={faAngry} />, className: "angry" },
  ];

  const scrollToTodaysTasks = () => {
    const tasksSection = document.getElementById('todays-tasks-section');
    if (tasksSection) {
      tasksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-container flex min-h-screen bg-gray-100">
      <div className="flex-1 p-5">
        <div className="flex justify-between items-center">
          <div className="relative">
            <input type="text" placeholder="Searching..." className="px-4 py-2 w-80 border rounded-full shadow-md focus:outline-none" />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-3 gap-5 mt-5">
          <div className="total">
            <h3 className="text-xl font-bold text-blue-900">Total Projects</h3>
            <p className="text-2xl">{dashboardData?.total_main_task || 0}</p>
          </div>
          <div className="today" onClick={scrollToTodaysTasks} style={{ cursor: 'pointer' }}>
            <h3 className="text-xl font-bold text-blue-900">Today's Tasks</h3>
            <p className="text-2xl">{dashboardData?.today_task_cnt || 0}</p>
          </div>
          <div className="mood">
            <h3 className="text-red-600 text-lg font-bold">How are you feeling?</h3>
            <div className="flex gap-3 mt-3">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.name.toLowerCase();
                
                return (
                  <button
                    key={mood.name}
                    onClick={() => handleMoodChange(mood.name.toLowerCase())}
                    className={`mood-button ${mood.className} ${
                      isSelected ? "selected" : "not-selected"
                    }`}
                    aria-pressed={isSelected}
                    title={`Feeling ${mood.name}`}
                  >
                    {mood.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Section - Reorganized Layout */}
        <div className="grid grid-cols-2 gap-5 mt-5">
          {/* Left Section - Stacked Charts */}
          <div className="charts-left-column flex flex-col gap-5">
            {/* Pie Chart */}
            <div className="pie">
              <h3 className="text-lg font-semibold mb-2">Task Categories</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Doughnut Chart */}
            <div className="doughnut">
              <h3 className="text-lg font-semibold mb-2">Task Progress</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie 
                    data={donutData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={90} 
                    fill="#8884d8" 
                    label
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => {
                    // Check if value is a number before calling toFixed
                    return typeof value === 'number' 
                      ? `${value.toFixed(1)}%` 
                      : `${value}%`;
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Section - Bar Chart */}
          <div className="charts-right-column">
            <div className="bar h-full">
              <h3 className="text-lg font-semibold mb-2">Tasks Completed This Week</h3>
              <ResponsiveContainer width="100%" height={580}>
                <BarChart data={barChart}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#0D1F80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Table - Giữ nguyên dữ liệu hardcoded */}
        <h2 id="todays-tasks-section" className="text-lg font-semibold mt-5 mb-2 upcoming-tasks">Upcoming Tasks</h2>
        <TaskTable 
          tasks={tasks.map(task => ({
            id: task.task_id,
            name: task.task_name,
            description: task.description,
            priority: task.priority,
            deadline: task.due_date
          }))} 
        />
      </div>
    </div>
  );
};

export default Dashboard;