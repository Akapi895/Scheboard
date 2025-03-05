import React, { useState } from "react";
import "./calendar.css";

interface AddTaskPopupProps {
  show: boolean;
  onClose: () => void;
  onAddTask: (taskData: any) => void;
}

const AddTaskPopup: React.FC<AddTaskPopupProps> = ({ show, onClose, onAddTask }) => {
  const [taskData, setTaskData] = useState({
    task_name: "",
    description: "",
    category: "work",
    priority: "medium",
    status: "todo",
    estimated_time: 60,
    task_type: "task",
    parent_task_id: null,
  });

  if (!show) return null;

  return (
    <div className="add-task-popup-overlay">
      <div className="add-task-popup">
        <h2>Add Task</h2>
        <input
          type="text"
          name="task_name"
          value={taskData.task_name}
          onChange={(e) => setTaskData({ ...taskData, task_name: e.target.value })}
          placeholder="Task Name"
        />
        <textarea
          name="description"
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          placeholder="Description"
        />
        <button onClick={() => onAddTask(taskData)}>Add Task</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AddTaskPopup;
