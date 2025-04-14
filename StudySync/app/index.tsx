import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        router.replace('/tabs/chat'); // ✅ Default tab after login
      } else {
        router.replace('/login');     // 🔐 Not logged in
      }
    };
    checkAuth();
  }, []);

  return null;
}
