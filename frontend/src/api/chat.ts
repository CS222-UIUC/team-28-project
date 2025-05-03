import { ChatMessage } from './types';
import { authorizedFetch } from '../utils/authfetch';

export const sendMessage = async (message: string): Promise<ChatMessage> => {
  const response = await authorizedFetch('/chat/send', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  return response.json();
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  const response = await authorizedFetch('/chat/history');
  return response.json();
}; 