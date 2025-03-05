import axios from "axios";
import React, { useState, useEffect } from "react";
import { Task } from "./types";
import { fetchTasks, fetchTaskDetails, updateTaskStatus, deleteTask } from "./api";
import TaskPopup from "./TaskPopup";
import AddTaskPopup from "./AddTaskPopup";
import "./calendar.css";

const Calendar: React.FC = () => {
  const [userId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);

  useEffect(() => {
    if (userId) fetchTasks(userId).then(setTasks);
  }, [userId]);

  const handleTaskClick = async (task: Task) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng hàm fetchTaskDetails từ api.ts
      const { data, error: apiError } = await fetchTaskDetails(userId, task.task_id);
      
      if (apiError) {
        setError(apiError);
        console.error(apiError);
      } else if (data) {
        setTaskDetail(data);
        setSelectedTask(task);
        setShowTaskPopup(true);
      } else {
        setError("No data returned");
        console.error("No data returned from API");
      }
    } catch (error) {
      setError("Unexpected error occurred");
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Time
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const startOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(start.setDate(diff));
  };

  const getWeekDates = (date: Date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentDate);

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  useEffect(() => {
    fetchTasks(userId).then(setTasks);
  }, [currentDate, userId]);

  //Popup
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{date: Date, hour: number} | null>(null);
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCellClick = (date: Date, hour: number) => {
    // Kiểm tra xem ô có task nào không
    const hasTask = tasks.some(task => isTaskInTimeSlot(task, date, hour));
    
    if (!hasTask) {
      // Nếu không có task, hiển thị popup tạo task mới
      setSelectedTimeSlot({date, hour});
      setShowAddTaskPopup(true);
    }
  };

  // Xử lý việc đóng popup chi tiết task
  const closeTaskPopup = () => {
    setShowTaskPopup(false);
    setSelectedTask(null);
    setTaskDetail(null);
  };

  // Xử lý việc đóng popup thêm task
  const closeAddTaskPopup = () => {
    setShowAddTaskPopup(false);
    setSelectedTimeSlot(null);
  };

  // const handleTaskClick = async (task: Task) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await axios.post('http://127.0.0.1:8000/api/calendar/tasks/detail', {
  //       user_id: userId,
  //       task_id: task.task_id
  //     });
      
  //     if (response.data.status === 'success') {
  //       setTaskDetail(response.data.data);
  //       setSelectedTask(task);
  //       setShowTaskPopup(true);
  //     } else {
  //       setError("Failed to fetch task details");
  //       console.error("Failed to fetch task details:", response.data);
  //     }
  //   } catch (error) {
  //     setError("Error connecting to server");
  //     console.error("Error fetching task details:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Cập nhật handleAddTask để thêm task mới
  const handleAddTask = async (taskData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Tạo task data với due_date từ selectedTimeSlot
      const formattedDate = selectedTimeSlot ? 
        `${selectedTimeSlot.date.getFullYear()}-${(selectedTimeSlot.date.getMonth() + 1).toString().padStart(2, '0')}-${selectedTimeSlot.date.getDate().toString().padStart(2, '0')} ${selectedTimeSlot.hour.toString().padStart(2, '0')}:00:00` :
        taskData.due_date;
    
      const newTaskData = {
        ...taskData,
        due_date: formattedDate,
        user_id: userId
      };
      
      const response = await axios.post('http://127.0.0.1:8000/api/calendar/tasks/create', newTaskData);
      
      if (response.data.status === 'success') {
        // Thêm task mới vào danh sách task
        await fetchTasks(userId).then(setTasks);
        setShowAddTaskPopup(false);
      } else {
        setError("Failed to create task");
        console.error("Failed to create task:", response.data);
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch('http://127.0.0.1:8000/api/calendar/tasks/status', {
        task_id: taskId,
        status: status,
        user_id: userId
      });
      
      if (response.data.status === 'success') {
        await fetchTasks(userId).then(setTasks);
        await fetchTaskDetails(userId, taskId).then(setTaskDetail);
        closeTaskPopup();
      } else {
        setError("Failed to update task status");
        console.error("Failed to update task status:", response.data);
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error updating task status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await handleDeleteTask(taskId);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete('http://127.0.0.1:8000/api/calendar/tasks/delete', {
        data: {
          task_id: taskId,
          user_id: userId
        }
      });
      
      if (response.data.status === 'success') {
        await fetchTasks(userId).then(setTasks);
        closeTaskPopup();
      } else {
        setError("Failed to delete task");
        console.error("Failed to delete task:", response.data);
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  const isTaskInTimeSlot = (task: Task, date: Date, hour: number) => {
    try {
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getHours() === hour
      );
    } catch (err) {
      console.error("Error parsing date:", task.due_date, err);
      return false;
    }
  };

  // Phân loại task theo màu sắc dựa trên priority
  const getTaskPriorityClass = (priority: string) => {
    switch(priority) {
      case "high": return "high-priority";
      case "medium": return "medium-priority";
      case "low": return "low-priority";
      default: return "";
    }
  };

  // Component TaskPopup để hiển thị chi tiết task
  const TaskPopup = () => {
    if (!showTaskPopup || !taskDetail) return null;
    
    return (
      <div className="task-popup-overlay">
        <div className="task-popup">
          <div className="task-popup-header">
            <h2>{selectedTask?.task_name}</h2>
            <button className="close-btn" onClick={closeTaskPopup}>×</button>
          </div>
          <div className="task-popup-content">
            {loading ? (
              <div className="loading">Loading task details...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="task-info">
                  <p><strong>Description:</strong> {taskDetail.description}</p>
                  <p><strong>Due Date:</strong> {new Date(taskDetail.due_date).toLocaleString()}</p>
                  <p><strong>Category:</strong> {taskDetail.category}</p>
                  <p><strong>Priority:</strong> {taskDetail.priority}</p>
                  <p><strong>Status:</strong> {taskDetail.status}</p>
                  <p><strong>Estimated Time:</strong> {taskDetail.estimated_time} minutes</p>
                  <p><strong>Task Type:</strong> {taskDetail.task_type}</p>
                </div>
                <div className="task-actions">
                  {taskDetail.status !== 'completed' && (
                    <button onClick={() => handleUpdateStatus(taskDetail.task_id, 'completed')}>
                      Mark as Completed
                    </button>
                  )}
                  <button onClick={() => handleDeleteConfirm(taskDetail.task_id)}>
                    Delete Task
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component AddTaskPopup để thêm task mới
  const AddTaskPopup = () => {
    if (!showAddTaskPopup) return null;
    
    const [newTask, setNewTask] = useState({
      task_name: '',
      description: '',
      category: 'work', // default value
      priority: 'medium', // default value
      status: 'todo', // default value
      estimated_time: 60, // default: 60 minutes
      task_type: 'task', // default value
      parent_task_id: null,
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewTask(prev => ({
        ...prev,
        [name]: name === 'estimated_time' ? parseInt(value) : value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddTask(newTask);
    };
    
    return (
      <div className="task-popup-overlay">
        <div className="task-popup">
          <div className="task-popup-header">
            <h2>Add New Task</h2>
            <button className="close-btn" onClick={closeAddTaskPopup}>×</button>
          </div>
          <div className="task-popup-content">
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="task_name">Task Name:</label>
                <input 
                  type="text" 
                  id="task_name" 
                  name="task_name" 
                  value={newTask.task_name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={newTask.description} 
                  onChange={handleInputChange} 
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select 
                  id="category" 
                  name="category" 
                  value={newTask.category} 
                  onChange={handleInputChange}
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="leisure">Leisure</option>
                  <option value="health">Health</option>
                  <option value="others">Others</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                <select 
                  id="priority" 
                  name="priority" 
                  value={newTask.priority} 
                  onChange={handleInputChange}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="estimated_time">Estimated Time (minutes):</label>
                <input 
                  type="number" 
                  id="estimated_time" 
                  name="estimated_time" 
                  value={newTask.estimated_time} 
                  onChange={handleInputChange} 
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="task_type">Task Type:</label>
                <select 
                  id="task_type" 
                  name="task_type" 
                  value={newTask.task_type} 
                  onChange={handleInputChange}
                >
                  <option value="maintask">Main Task</option>
                  <option value="task">Task</option>
                  <option value="subtask">Subtask</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {error && !showTaskPopup && !showAddTaskPopup && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="calendar-header">
        <button className="prev-week-btn" onClick={handlePrevWeek}>
          Last Week
        </button>
        <button className="today-btn" onClick={() => setCurrentDate(new Date())}>
          Today
        </button>
        <button className="next-week-btn" onClick={handleNextWeek}>
          Next Week
        </button>
        <span className="month-title">
          {currentDate.toLocaleDateString("en-US", { month: "long" })} {currentDate.getFullYear()}
        </span>
      </div>

      <div className="calendar-grid">
        {/* Header hàng ngày */}
        <div className="time-zone">GMT+7</div>
        {weekDates.map((date, index) => (
          <div key={index} className={`day-header ${date.toDateString() === new Date().toDateString() ? "today" : ""}`}>
            {days[date.getDay()]}
            <span className="day-number">{date.getDate()}</span>
          </div>
        ))}

        {/* Grid thời gian */}
        {hours.map((hour, hourIdx) => (
          <React.Fragment key={hourIdx}>
            <div className="time-slot">{hour}</div>
            {weekDates.map((date, dayIdx) => (
              <div 
                key={`${dayIdx}-${hourIdx}`} 
                className="cell"
                onClick={() => handleCellClick(date, hourIdx)}
              >
                {tasks
                  .filter(task => isTaskInTimeSlot(task, date, hourIdx))
                  .map(task => (
                    <div 
                      key={task.task_id} 
                      className={`task ${getTaskPriorityClass(task.priority)}`} 
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện bubbling lên cell
                        handleTaskClick(task);
                      }}
                    >
                      {task.task_name}
                      <div className="task-details">{task.description}</div>
                    </div>
                  ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Render các popup */}
      <TaskPopup />
      <AddTaskPopup />
    </div>
  );
};

export default Calendar;