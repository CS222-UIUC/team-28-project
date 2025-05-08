import { TaskEvent } from './types';
import { authorizedFetch } from '../utils/authfetch';
import mockData from '../../assets/mock_data.json';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export type NLPTaskResponse =
  | { task: TaskEvent; extracted_info?: any }
  | { extracted: any; missingFields: string[]; message: string };

type MockData = {
  [date: string]: TaskEvent[];
};

/**
 * Fetch todos for a given date.
 * Assumes the backend returns: { events: TaskEvent[] }
 */
export const getTodosByDate = async (date: string): Promise<TaskEvent[]> => {
  // For development, use mock data
  console.log('Fetching tasks for date:', date);
  console.log('Available mock data:', mockData);
  
  // Always use mock data for now to ensure it works
  return (mockData as MockData)[date] || [];
  
  // Comment out the real API call for now
  // const response = await authorizedFetch(`${BASE_URL}/calendar/todos?date=${date}`);
  // return response.json();
};

/**
 * Save a new task to the calendar.
 */
export const saveTask = async (task: TaskEvent): Promise<TaskEvent> => {
  const response = await authorizedFetch(`${BASE_URL}/calendar/save_task`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
  return response.json();
};

/**
 * Delete a task from the calendar.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await authorizedFetch(`${BASE_URL}/calendar/delete_task/${taskId}`, {
    method: 'DELETE',
  });
};

/**
 * Create a task from natural language text
 */
export const createTaskFromText = async (text: string, userId: string): Promise<NLPTaskResponse> => {
  const response = await authorizedFetch(`${BASE_URL}/tasks/nlp`, {
    method: 'POST',
    body: JSON.stringify({ text, user_id: userId }),
  });
  return response.json();
}; 