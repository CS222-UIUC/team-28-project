import { User } from './types';
import { authorizedFetch } from '../utils/authfetch';

export const getCurrentUser = async (): Promise<User> => {
  const response = await authorizedFetch('/auth/me');
  return response.json();
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await authorizedFetch('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
  return response.json();
}; 