import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskTable from "../../components/task_table/task_table";
import './MainTasks.css';

interface Task {
  task_id: number;
  task_name: string;
}

interface MainTaskData {
  main_task: Task;
  task: Task[];
}

const MainTasks: React.FC = () => {
  const navigate = useNavigate();
  const { maintaskId } = useParams<{ maintaskId: string }>()

  const [mainTaskData, setMainTaskData] = useState<MainTaskData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchMainTaskData();
  }, [userId, navigate, maintaskId]);

  const fetchMainTaskData = async () => {
    try {
      console.log("Fetching main tasks for user:", userId);
      
      const response = await fetch('http://127.0.0.1:8000/api/main-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          main_task_id: maintaskId
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

      // Check for the proper response format - changed from Array check to object check
      if (result.status === 'success' && result.data && result.data.task) {
        setMainTaskData(result.data);
        // Set the tasks state with the subtasks from the response
        setTasks(result.data.task || []);
        console.log("main tasks loaded:", result.data);
      } else {
        console.error("Failed to fetch main tasks:", result.message || "Invalid data format");
        // Set fallback data
        const fallbackData = {
          main_task: { 
            task_id: 1, 
            task_name: "No tasks" 
          },
          task: []
        };
        setMainTaskData(fallbackData);
        setTasks([]); // Empty tasks array when there's an error
      }
    } catch (error) {
      console.error("Error fetching main tasks:", error);
      // Set fallback data
      const fallbackData = {
        main_task: { 
          task_id: 1, 
          task_name: "No tasks" 
        },
        task: []
      };
      setMainTaskData(fallbackData);
      setTasks([]); // Empty tasks array when there's an error
    } finally {
      // Always set loading to false when done, whether successful or not
      setLoading(false);
    }
  };

  return (
    <div className="main-tasks-container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <h1 className="main-task-title">{mainTaskData?.main_task?.task_name || "Main Task"}</h1>
          <TaskTable 
            tasks={tasks.map(task => ({
              id: task.task_id,
              name: task.task_name,
              description: "",
              priority: "medium",
              deadline: ""
            }))}
          />
        </>
      )}
    </div>
  );
};

export default MainTasks;