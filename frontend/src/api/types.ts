export type TaskEvent = {
  task: string;
  participants: string[];
  date: string;
  time: string | null;
  end_time: string | null;
  locations: string[];
};

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

export type ChatMessage = {
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
}; 