import React from 'react';
import './task_table.css';

interface Task {
  id: number;
  name: string;
  description: string;
  priority: string;
  deadline: string;
}

interface TaskTableProps {
  tasks: Task[];
  title?: string;  // Optional title
  showCheckbox?: boolean; // Optional checkbox column
}

const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks, 
  title, 
  showCheckbox = true 
}) => {
  return (
    <div className="task-table-container">
      {title && <h2>{title}</h2>}
      {tasks.length === 0 ? (
        <div className="no-tasks-message">
          No tasks available
        </div>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              {showCheckbox && <th>Check</th>}
              <th>Task</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                {showCheckbox && <td><input type="checkbox" /></td>}
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td className={`priority-${task.priority.toLowerCase()}`}>{task.priority}</td>
                <td>{task.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskTable;