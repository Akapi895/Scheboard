// api.ts
import axios from "axios";
import { Task } from "./types";

const API_BASE_URL = "http://127.0.0.1:8000/api/calendar/tasks";

export const fetchTasks = async (userId: number | null): Promise<Task[]> => {
  if (!userId) return [];
  try {
    const response = await axios.post(`${API_BASE_URL}`, { user_id: userId });
    return response.data.status === "success" ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// Cập nhật hàm fetchTaskDetails để trả về cả lỗi nếu có
export const fetchTaskDetails = async (userId: number | null, taskId: number): Promise<{ data: any; error: string | null }> => {
  try {
    if (!userId) {
      return { data: null, error: "User ID is required" };
    }
    
    const response = await axios.post(`${API_BASE_URL}/detail`, { user_id: userId, task_id: taskId });
    
    if (response.data.status === "success") {
      return { data: response.data.data, error: null };
    } else {
      return { data: null, error: "Failed to fetch task details" };
    }
  } catch (error) {
    console.error("Error fetching task details:", error);
    return { data: null, error: "Error connecting to server" };
  }
};

export const createTask = async (taskData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, taskData);
    return response.data.status === "success";
  } catch (error) {
    console.error("Error creating task:", error);
    return false;
  }
};

export const updateTaskStatus = async (taskId: number, status: string, userId: number | null): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const response = await axios.patch(`${API_BASE_URL}/status`, { 
      task_id: taskId, 
      status, 
      user_id: userId 
    });
    
    return response.data.status === "success";
  } catch (error) {
    console.error("Error updating task status:", error);
    return false;
  }
};

export const deleteTask = async (taskId: number, userId: number | null): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const response = await axios.delete(`${API_BASE_URL}/delete`, { 
      data: { 
        task_id: taskId, 
        user_id: userId 
      } 
    });
    
    return response.data.status === "success";
  } catch (error) {
    console.error("Error deleting task:", error);
    return false;
  }
};

export const updateTask = async (task: Task, userId: number | null): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const response = await axios.put(`${API_BASE_URL}/update`, {
      ...task,
      user_id: userId
    });
    
    return response.data.status === "success";
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
};


