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
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
  return (
    <div className="task-table-container">
      <h2>Upcoming Tasks</h2>
      {tasks.length === 0 ? (
        <div className="no-tasks-message">
          No tasks scheduled for today!
        </div>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Task</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td><input type="checkbox" /></td>
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{task.priority}</td>
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