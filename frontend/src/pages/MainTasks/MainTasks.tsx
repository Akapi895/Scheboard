import React from 'react';
import TaskTable from '../../components/task_table/task_table';
import './MainTasks.css';

const MainTasks: React.FC = () => {
  // Dữ liệu mẫu cho tasks
  const tasks = [
    { id: 1, name: "Task 1", description: "Description 1", priority: "High", deadline: "2025-03-06 10:00" },
    { id: 2, name: "Task 2", description: "Description 2", priority: "Medium", deadline: "2025-03-07 12:00" },
    { id: 3, name: "Task 3", description: "Description 3", priority: "Low", deadline: "2025-03-08 14:00" },
  ];

  // Giả sử có nhiều assignment
  const assignments = [
    { id: 1, tasks },
    { id: 2, tasks },
    { id: 3, tasks },
  ];

  return (
    <div className="main-tasks-container">
      {assignments.map(assignment => (
        <div key={assignment.id} className="assignment">
          <h2>Assignment {assignment.id}</h2>
          <TaskTable tasks={assignment.tasks} />
        </div>
      ))}
    </div>
  );
};

export default MainTasks;