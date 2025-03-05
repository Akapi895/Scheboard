import React, { useState, useEffect } from "react";
import "./calendar.css";

interface AddTaskPopupProps {
  show: boolean;
  selectedTimeSlot: {date: Date, hour: number} | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onAddTask: (taskData: any) => Promise<void>;
}

const AddTaskPopup: React.FC<AddTaskPopupProps> = ({ 
  show, 
  selectedTimeSlot, 
  loading = false, 
  error = null, 
  onClose, 
  onAddTask 
}) => {
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    category: 'work',
    priority: 'medium',
    status: 'todo',
    estimated_time: 60,
    task_type: 'task', // Mặc định là 'task', không hiển thị cho người dùng
    parent_task_id: null,
  });
  
  // Reset form khi mở popup mới
  useEffect(() => {
    if (show) {
      setNewTask({
        task_name: '',
        description: '',
        category: 'work',
        priority: 'medium',
        status: 'todo',
        estimated_time: 60,
        task_type: 'task',
        parent_task_id: null,
      });
    }
  }, [show]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: name === 'estimated_time' ? parseInt(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTask);
  };
  
  if (!show) return null;
  
  return (
    <div className="task-popup-overlay">
      <div className="task-popup">
        <div className="task-popup-header">
          <h2>Add New Task</h2>
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
                <option value="personal">Personal</option>
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
            
            {selectedTimeSlot && (
              <div className="form-group">
                <label>Due Date:</label>
                <div className="selected-timeslot">
                  {selectedTimeSlot.date.toLocaleDateString()} at {selectedTimeSlot.hour}:00
                </div>
              </div>
            )}
            
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

export default AddTaskPopup;
