import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskTable from "../../components/task_table/task_table";
import './MainTasks.css';

// Define interfaces for backend data structure
interface BackendTask {
  task_id: number;
  task_name: string;
  description?: string;
  priority?: string;
  due_date?: string;
  status?: string;
  estimated_time?: number;
}

interface MainTaskData {
  main_task: BackendTask; 
  task: BackendTask[];   
}

// This matches the TaskTable's expected interface
interface FormattedTask {
  id: number;
  name: string;
  description: string;
  priority: string;
  deadline: string;
}

const MainTasks: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();

  const [mainTaskData, setMainTaskData] = useState<MainTaskData | null>(null);
  const [formattedTasks, setFormattedTasks] = useState<FormattedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskName, setTaskName] = useState<string>("Main Task");

  // Lấy userId từ localStorage
  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  useEffect(() => {
    // Nếu chưa đăng nhập, điều hướng sang /login
    if (!userId) {
      navigate('/login');
      return;
    }
    
    // Fetch task name and main task data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch task name first
        await fetchTaskName();
        // Then fetch main task data
        await fetchMainTaskData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, navigate, taskId]);

  // New function to fetch task name
  const fetchTaskName = async () => {
    if (!taskId) return;
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/main-tasks/get-task-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: parseInt(taskId, 10)
        }),
      });

      if (!response.ok) {
        console.error(`Error fetching task name: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log("Task name API result:", result);
      
      if (result && result.task_name) {
        setTaskName(result.task_name);
      }
    } catch (error) {
      console.error("Error fetching task name:", error);
    }
  };

  const fetchMainTaskData = async () => {
    try {
      console.log("Fetching main tasks for user:", userId, "with main_task_id:", taskId);

      const response = await fetch('http://127.0.0.1:8000/api/main-tasks/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          main_task_id: parseInt(taskId || '0', 10)
        }),
      });

      console.log("main tasks API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("main tasks API result:", result);

      // Process data if successful
      if (
        result.status === 'success' &&
        result.data &&
        result.data.task && 
        result.data.main_task 
      ) {
        setMainTaskData(result.data);
        
        // Format the tasks to match the TaskTable interface
        const formatted = result.data.task.map((task: BackendTask) => ({
          id: task.task_id,
          name: task.task_name,
          description: task.description || "No description",
          priority: task.priority || "medium",
          deadline: task.due_date || "No deadline"
        }));
        
        setFormattedTasks(formatted);
        
        // Also update the task name if available
        if (result.data.main_task.task_name) {
          setTaskName(result.data.main_task.task_name);
        }
        console.log("main tasks loaded:", result.data);
      } else {
        // Fallback for invalid data format
        console.error("Failed to fetch main tasks:", result.message || "Invalid data format");

        const fallbackData: MainTaskData = {
          main_task: { task_id: 0, task_name: "No tasks" },
          task: []
        };
        setMainTaskData(fallbackData);
        setFormattedTasks([]);
      }
    } catch (error) {
      console.error("Error fetching main tasks:", error);

      // Fallback for errors
      const fallbackData: MainTaskData = {
        main_task: { task_id: 0, task_name: "No tasks" },
        task: []
      };
      setMainTaskData(fallbackData);
      setFormattedTasks([]);
    }
  };

  return (
    <div className="main-tasks-container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Hiển thị tên Main Task sử dụng taskName state */}
          <h1 className="main-task-title">
            {taskName}
          </h1>

          {/* Subtasks table */}
          {formattedTasks.length > 0 ? (
            <TaskTable
              tasks={formattedTasks}
              title="Subtasks"
              showCheckbox={true}
            />
          ) : (
            <p>No subtasks available for this task</p>
          )}
        </>
      )}
    </div>
  );
};

export default MainTasks;
