import React, { useState, useEffect } from "react";
import { Task } from "./types";
import "./calendar.css";

interface EditTaskPopupProps {
  show: boolean;
  task: Task | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const EditTaskPopup: React.FC<EditTaskPopupProps> = ({
  show,
  task,
  loading,
  error,
  onClose,
  onSave
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!show || !editedTask) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === 'estimated_time' ? parseInt(value) : value
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTask) {
      onSave(editedTask);
    }
  };

  return (
    <div className="task-popup-overlay">
      <div className="task-popup">
        <div className="task-popup-header">
          <h2>Edit Task</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
                value={editedTask.task_name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea 
                id="description" 
                name="description" 
                value={editedTask.description} 
                onChange={handleInputChange} 
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select 
                id="category" 
                name="category" 
                value={editedTask.category} 
                onChange={handleInputChange}
              >
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="leisure">Leisure</option>
                <option value="health">Health</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority:</label>
              <select 
                id="priority" 
                name="priority" 
                value={editedTask.priority} 
                onChange={handleInputChange}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <select 
                id="status" 
                name="status" 
                value={editedTask.status} 
                onChange={handleInputChange}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="estimated_time">Estimated Time (minutes):</label>
              <input 
                type="number" 
                id="estimated_time" 
                name="estimated_time" 
                value={editedTask.estimated_time} 
                onChange={handleInputChange} 
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="due_date">Due Date:</label>
              <input 
                type="datetime-local" 
                id="due_date" 
                name="due_date" 
                value={editedTask.due_date.replace(' ', 'T').substring(0, 16)} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPopup;