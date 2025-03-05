import React, { useState, useEffect } from "react";
import axios from "axios";
import "./calendar.css";

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const startOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/profile/weekly-tasks?user_id=1`);
      setTasks(response.data.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const handleTaskClick = (task) => {
    // Handle task click (e.g., show task details, edit task, etc.)
    console.log("Task clicked:", task);
  };

  const handleAddTask = async (task) => {
    try {
      await axios.post("/api/tasks/create", task);
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleUpdateTask = async (task) => {
    try {
      await axios.put("/api/tasks/update", task);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/delete`, { data: { task_id: taskId } });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="calendar-container">
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
          <div key={index} className={`day-header ${index === 2 ? "today" : ""}`}>
            {days[date.getDay()]}
            <span className="day-number">{date.getDate()}</span>
          </div>
        ))}

        {/* Grid thời gian */}
        {hours.map((hour, hourIdx) => (
          <React.Fragment key={hourIdx}>
            <div className="time-slot">{hour}</div>
            {days.map((_, dayIdx) => (
              <div key={`${dayIdx}-${hourIdx}`} className="cell">
                {tasks
                  .filter(task => new Date(task.due_date).getDay() === dayIdx)
                  .map(task => (
                    <div key={task.task_name} className="task" onClick={() => handleTaskClick(task)}>
                      {task.task_name}
                    </div>
                  ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;