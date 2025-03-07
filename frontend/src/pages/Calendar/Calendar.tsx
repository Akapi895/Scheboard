import axios from "axios";
import ReactMarkdown from 'react-markdown';
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
      const dueDate = new Date(task.due_date);
      
      // Tính thời gian bắt đầu (due_date - estimated_time phút)
      const startDate = new Date(dueDate.getTime() - task.estimated_time * 60 * 1000);
      
      // Tính thời gian của ô hiện tại
      const cellDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        0,
        0
      );
      
      // Kiểm tra xem ô có nằm trong khoảng thời gian của task không
      return cellDateTime >= startDate && cellDateTime <= dueDate;
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

  // Thêm state cho câu trả lời AI
const [aiResponse, setAiResponse] = useState<string | null>(null);
const [question, setQuestion] = useState<string>("");
const [isAskingQuestion, setIsAskingQuestion] = useState(false);

const [aiTasks, setAiTasks] = useState<Task[]>(() => {
  const storedSessionTasks = localStorage.getItem("session_tasks");
  return storedSessionTasks ? JSON.parse(storedSessionTasks) : [];
});

  const handleSendQuestion = async () => {
    if (question.trim()) {
      try {
        setLoading(true);
        setIsAskingQuestion(true);
        setAiResponse(null);
        setAiTasks([]); 
        
        // Format tasks to match the AITask model expected by the backend
        const formattedTasks = tasks.map(task => ({
          task_id: task.task_id,
          task_name: task.task_name,
          description: task.description || "",
          category: task.category || "leisure",
          priority: task.priority || "medium",
          status: task.status || "todo",
          estimated_time: task.estimated_time || 60,
          due_date: task.due_date,
          task_type: task.task_type || "task",
          parent_task_id: task.parent_task_id || null,
          user_id: userId
        }));
        
        // Add logging to see exactly what's being sent
        const requestBody = {
          user_id: userId,
          prompt: question,
          tasks: formattedTasks
        };
        console.log("Sending request to AI:", requestBody);
        
        const response = await fetch('http://127.0.0.1:8000/api/calendar/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error: ${response.status}`, errorText);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("AI response data:", data);
        
        if (data.status === 'success') {
          // Lưu câu trả lời AI
          setAiResponse(data.ai_response);
          await fetchTasks(userId).then(setTasks);
        }
      } catch (error) {
        console.error("Failed to send question:", error);
        setError("An error occurred while processing your question");
      } finally {
        setLoading(false);
        setIsAskingQuestion(false);
      }
    }
  };

  return (
    <div className="calendar-container">
      {error && !showTaskPopup && !showAddTaskPopup && (
        <div className="error-message">{error}</div>
      )}
      
      {/* Thêm phần hỏi đáp ở đây */}
      <div className="calendar-question-section">
        <div className="question-container">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about your schedule..."
            disabled={isAskingQuestion}
            className="question-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
          />
          <button 
            onClick={handleSendQuestion}
            disabled={isAskingQuestion || !question.trim()}
            className="ask-btn"
          >
            {isAskingQuestion ? 'Asking...' : 'Ask'}
          </button>
        </div>
        
        {/* Hiển thị câu trả lời AI */}
      {aiResponse && (
        <div className="ai-response-container">
          <div className="ai-response">
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          </div>
        </div>
      )}

      </div>

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

        {hours.map((hour, hourIdx) => (
          <React.Fragment key={hourIdx}>
            <div className="time-slot">{hour}</div>
            {weekDates.map((date, dayIdx) => {
              // Lấy các task trong ô này
              const tasksInCell = tasks.filter(task => isTaskInTimeSlot(task, date, hourIdx));
              return (  
                <div 
                  key={`${dayIdx}-${hourIdx}`} 
                  className="cell"
                  onClick={() => handleCellClick(date, hourIdx)}
                >
                  {tasksInCell.map(task => {
                    // Tạo dueDate và startDate
                    const dueDate = new Date(task.due_date);
                    const startDate = new Date(dueDate.getTime() - task.estimated_time * 60 * 1000);

                    const isStartingCell = (
                      startDate.getDate() === date.getDate() &&
                      startDate.getMonth() === date.getMonth() &&
                      startDate.getFullYear() === date.getFullYear() &&
                      (startDate.getHours() === hourIdx || (startDate.getHours() === hourIdx - 1 && startDate.getMinutes() > 0))
                    );
                      
                    // Thêm class để hiển thị đúng phần của task
                    let cellPosition = "";
                    if (isStartingCell) {
                      cellPosition = "task-start";
                    } else if (
                      dueDate.getDate() === date.getDate() && 
                      dueDate.getMonth() === date.getMonth() &&
                      dueDate.getHours() === hourIdx
                    ) {
                      cellPosition = "task-end";
                    } else {
                      cellPosition = "task-mid";
                    }
                    
                    return (
                      <div 
                        key={task.task_id} 
                        className={`task ${getTaskPriorityClass(task.priority)} ${cellPosition}`} 
                        style={{
                          gridColumn: dayIdx + 1,
                          gridRow: (() => {
                            if (isStartingCell) {
                              return hourIdx + 1; // +1 vì grid-row bắt đầu từ 1, không phải 0
                            } else {
                              return hourIdx + 1;
                            }
                          })(),
                          gridRowEnd: 'auto', 
                          position: 'relative',
                          zIndex: 5,
                          height: '103%',
                          width: '100%',
                          boxSizing: 'border-box',
                          margin: 0,
                          padding: '4px 8px',  // Added missing comma here
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        {isStartingCell && (
                        <>
                          {task.task_name}
                          <div className="task-time">
                            {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </>
                      )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
        onEdit={handleEditClick} 
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