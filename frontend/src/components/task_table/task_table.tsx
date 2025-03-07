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
  tasks: Task[];         // Dữ liệu bảng (phải là mảng)
  title?: string;        // Tiêu đề bảng (tuỳ chọn)
  showCheckbox?: boolean; // Hiển thị cột checkbox (tuỳ chọn)
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  title,
  showCheckbox = true
}) => {
  // Nếu muốn chắc chắn tasks luôn là mảng, có thể:
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="task-table-container">
      {title && <h2>{title}</h2>}

      {safeTasks.length === 0 ? (
        <div className="no-tasks-message">No tasks available</div>

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
            {safeTasks.map(task => (
              <tr key={task.id}>
                {showCheckbox && (
                  <td>
                    <input type="checkbox" />
                  </td>
                )}
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td className={`priority-${task.priority?.toLowerCase()}`}>
                  {task.priority}
                </td>
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
