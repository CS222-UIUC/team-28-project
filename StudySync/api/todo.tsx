// api/todo.ts

import { authorizedFetch } from '../utils/authfetch';

/**
 * Represents a single task entity.
 */
export type TaskEvent = {
  task: string;
  participants: string[];
  date: string;
  time: string | null;
  end_time: string | null;
  locations: string[];
};

/**
 * Fetch todos for a given date.
 * Assumes the backend returns: { events: TaskEvent[] }
 */
export async function getTodosByDate(date: string): Promise<TaskEvent[]> {
  const res = await authorizedFetch(`http://localhost:8000/calendar/todos?date=${date}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch todos for ${date}`);
  }

  const data = await res.json();
  return data.events || [];
}
