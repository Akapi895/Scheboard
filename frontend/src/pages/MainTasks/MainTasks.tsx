import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskTable from '../../components/task_table/task_table';
import './MainTasks.css';

interface SubTask {
  id: number;
  name: string;
  description: string;
  priority: string;
  deadline: string;
}

interface MainTask {
  id: number;
  name: string;
  description: string;
  priority: string;
  deadline: string;
}

const MainTasks: React.FC = () => {
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch main tasks when component mounts
    const fetchMainTasks = async () => {
      try {
        const response = await axios.get('/api/main-tasks');
        setMainTasks(response.data);
      } catch (error) {
        console.error('Error fetching main tasks:', error);
      }
    };

    fetchMainTasks();
  }, []);

  const handleMainTaskClick = async (taskId: number) => {
    if (selectedTask === taskId) {
      // If clicking the same task, collapse it
      setSelectedTask(null);
      setSubTasks([]);
      return;
    }

    setLoading(true);
    setSelectedTask(taskId);
    
    try {
      const response = await axios.get(`/api/main-tasks/${taskId}/subtasks`);
      setSubTasks(response.data);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-tasks-container">
      <h1>Main Tasks</h1>
      
      <div className="main-tasks-list">
        {mainTasks.length === 0 ? (
          <p>No main tasks available</p>
        ) : (
          mainTasks.map(task => (
            <div key={task.id} className="main-task-item-container">
              <div 
                className={`main-task-item ${selectedTask === task.id ? 'selected' : ''}`}
                onClick={() => handleMainTaskClick(task.id)}
              >
                <h3>{task.name}</h3>
                <div className="main-task-details">
                  <p><strong>Description:</strong> {task.description}</p>
                  <p><strong>Priority:</strong> <span className={`priority-${task.priority.toLowerCase()}`}>{task.priority}</span></p>
                  <p><strong>Deadline:</strong> {task.deadline}</p>
                </div>
              </div>

              {selectedTask === task.id && (
                <div className="subtasks-container">
                  {loading ? (
                    <p>Loading subtasks...</p>
                  ) : (
                    <>
                      <h4>Subtasks</h4>
                      {subTasks.length > 0 ? (
                        <TaskTable tasks={subTasks} />
                      ) : (
                        <p>No subtasks available for this task</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MainTasks;