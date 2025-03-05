import React from "react";
import { Task } from "./types";
import "./calendar.css";

interface TaskPopupProps {
  show: boolean;
  task: Task | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onUpdateStatus: (taskId: number, status: string) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void; // Thêm prop onEdit
}

const TaskPopup: React.FC<TaskPopupProps> = ({ 
    show, 
    task, 
    loading, 
    error, 
    onClose, 
    onUpdateStatus, 
    onDelete,
    onEdit 
  }) => {
  if (!show || !task) return null;

  if (loading) {
    return (
      <div className="task-popup-overlay">
        <div className="task-popup">
          <div className="task-popup-header">
            <h2>Loading task details...</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="task-popup-content">
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <div className="task-popup-overlay">
        <div className="task-popup">
          <div className="task-popup-header">
            <h2>Error</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="task-popup-content">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-popup-overlay">
      <div className="task-popup">
        <div className="task-popup-header">
          <h2>{task.task_name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="task-popup-content">
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}</p>
          <p><strong>Category:</strong> {task.category}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Estimated Time:</strong> {task.estimated_time} minutes</p>
          <div className="task-actions">
            {task.status !== "completed" && (
              <button 
                className="complete-btn" 
                onClick={() => onUpdateStatus(task.task_id, "completed")}
              >
                Mark as Completed
              </button>
            )}
            <button
              className="edit-btn"
              onClick={() => onEdit(task)}
            >
              Edit Task
            </button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(task.task_id)}
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
