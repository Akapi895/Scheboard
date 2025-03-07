import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskTable from "../../components/task_table/task_table";
import './MainTasks.css';

interface Task {
  task_id: number;
  task_name: string;
}

interface MainTaskData {
  main_task: Task;  // Thông tin main task
  task: Task[];     // Mảng subtasks
}

const MainTasks: React.FC = () => {
  const navigate = useNavigate();
  const { maintaskId } = useParams<{ maintaskId: string }>();

  const [mainTaskData, setMainTaskData] = useState<MainTaskData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Gọi API lấy main_task và subtasks
    fetchMainTaskData();
  }, [userId, navigate, maintaskId]);

  const fetchMainTaskData = async () => {
    try {
      console.log("Fetching main tasks for user:", userId, "with main_task_id:", maintaskId);

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

      // Kiểm tra format JSON trả về
      if (
        result.status === 'success' &&
        result.data &&
        result.data.task && // mảng subtasks
        result.data.main_task // object main_task
      ) {
        setMainTaskData(result.data);
        setTasks(result.data.task); // Gán mảng subtasks vào state
        console.log("main tasks loaded:", result.data);
      } else {
        // Nếu dữ liệu không đúng format mong đợi
        console.error("Failed to fetch main tasks:", result.message || "Invalid data format");

        const fallbackData: MainTaskData = {
          main_task: { task_id: 0, task_name: "No tasks" },
          task: []
        };
        setMainTaskData(fallbackData);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching main tasks:", error);

      // Nếu request hoặc parse bị lỗi
      const fallbackData: MainTaskData = {
        main_task: { task_id: 0, task_name: "No tasks" },
        task: []
      };
      setMainTaskData(fallbackData);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-tasks-container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Hiển thị tên Main Task */}
          <h1 className="main-task-title">
            {mainTaskData?.main_task?.task_name || "Main Task"}
          </h1>

          {/* Nếu tasks.length > 0 thì hiển thị bảng, ngược lại hiển thị message */}
          {tasks.length > 0 ? (
            <TaskTable
              tasks={tasks.map(task => ({
                id: task.task_id,
                name: task.task_name,
                description: "",
                priority: "medium",
                deadline: ""
              }))}
              title="Subtasks"
              showCheckbox={false}
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
