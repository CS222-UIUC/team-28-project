// utils/authorizedFetch.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

type CustomHeaders = {
  'Content-Type': string;
  'Authorization'?: string;
  [key: string]: string | undefined;
};

/**
 * Wrapper for fetch() that automatically attaches the saved auth token.
 * Use this for any request that requires user authentication.
 */
export async function authorizedFetch(url: string, options: RequestInit = {}) {
  try {
    const token = await AsyncStorage.getItem('authToken');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('Error in authorizedFetch:', error);
    throw error;
  }
}
