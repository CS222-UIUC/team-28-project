import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Platform } from 'react-native';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log('ProtectedRoute - Current session:', session);
    console.log('ProtectedRoute - Current segments:', segments);

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    const isRoot = segments.length === 0 || segments[0] === 'index';

    // Handle root path
    if (isRoot) {
      if (!session) {
        console.log('No session at root, redirecting to login');
        if (Platform.OS === 'web') {
          window.location.href = '/login';
        } else {
          router.replace('/login');
        }
        return;
      } else {
        console.log('Has session at root, redirecting to chat');
        if (Platform.OS === 'web') {
          window.location.href = '/tabs/chat';
        } else {
          router.replace('/tabs/chat');
        }
        return;
      }
    }

    // Handle other paths
    if (!session && !inAuthGroup) {
      console.log('No session, redirecting to login');
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
    } else if (session && inAuthGroup) {
      console.log('Has session, redirecting to chat');
      if (Platform.OS === 'web') {
        window.location.href = '/tabs/chat';
      } else {
        router.replace('/tabs/chat');
      }
    }
  }, [session, loading, segments]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
} 