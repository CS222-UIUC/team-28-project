// utils/authorizedFetch.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper for fetch() that automatically attaches the saved auth token.
 * Use this for any request that requires user authentication.
 */
export async function authorizedFetch(url: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('authToken');

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
