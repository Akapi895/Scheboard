import axios from "axios";
import React, { useState, useEffect } from "react";
import { Task } from "./types";
import { fetchTasks, fetchTaskDetails, updateTaskStatus, deleteTask, updateTask } from "./api";
import TaskPopup from "./TaskPopup";
import AddTaskPopup from "./AddTaskPopup";
import EditTaskPopup from "./EditTaskPopup";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

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
      
      // Sử dụng hàm updateTaskStatus từ api.ts
      const success = await updateTaskStatus(taskId, status, userId);
      
      if (success) {
        await fetchTasks(userId).then(setTasks);
        closeTaskPopup();
      } else {
        setError("Failed to update task status");
        console.error("Failed to update task status");
      }
    } catch (error) {
      setError("Error connecting to serverrrrrr");
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
      
      // Sử dụng hàm deleteTask từ api.ts
      const success = await deleteTask(taskId, userId);
      
      if (success) {
        await fetchTasks(userId).then(setTasks);
        closeTaskPopup();
      } else {
        setError("Failed to delete task");
        console.error("Failed to delete task");
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

  const handleEditClick = (task: Task) => {
    setEditedTask({...task});
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedTask(null);
  };

  const handleSaveEdit = async (updatedTask: Task) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng hàm updateTask từ api.ts thay vì gọi axios trực tiếp
      const success = await updateTask(updatedTask, userId);
      
      if (success) {
        await fetchTasks(userId).then(setTasks);
        setIsEditMode(false);
        setEditedTask(null);
        closeTaskPopup();
      } else {
        setError("Failed to update task");
        console.error("Failed to update task");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error updating task:", error);
    } finally {
      setLoading(false);
    }
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
      <TaskPopup
        show={showTaskPopup}
        task={selectedTask}
        loading={loading}
        error={error}
        onClose={closeTaskPopup}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteConfirm}
        onEdit={handleEditClick}  // Thêm prop này
      />
      
      <AddTaskPopup 
        show={showAddTaskPopup}
        selectedTimeSlot={selectedTimeSlot}
        loading={loading}
        error={error}
        onClose={closeAddTaskPopup}
        onAddTask={handleAddTask}
      />
      
      <EditTaskPopup
        show={isEditMode}
        task={editedTask}
        loading={loading}
        error={error}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default Calendar;