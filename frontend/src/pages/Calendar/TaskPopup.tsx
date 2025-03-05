import React from "react";
import { Task } from "./types";
import "./calendar.css";

interface TaskPopupProps {
  show: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: number, status: string) => void;
  onDelete: (taskId: number) => void;
}

const TaskPopup: React.FC<TaskPopupProps> = ({ show, task, onClose, onUpdateStatus, onDelete }) => {
  if (!show || !task) return null;

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
              <button onClick={() => onUpdateStatus(task.task_id, "completed")}>Mark as Completed</button>
            )}
            <button onClick={() => onDelete(task.task_id)}>Delete Task</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
