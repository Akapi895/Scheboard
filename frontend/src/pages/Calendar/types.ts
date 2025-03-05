// types.ts
export interface Task {
    task_id: number;
    task_name: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    estimated_time: number;
    due_date: string;
    task_type: string;
    parent_task_id: number | null;
    // user_id: number;
  }
  
 export interface ApiTask {
    task_name: string;
    task_type: string;
    description: string;
    due_date: string;
    priority: string;
    estimated_time: number;
    status: string;
    category: string;
    parent_task_id: number | null;
  }