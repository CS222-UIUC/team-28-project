import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#f4511e' },
            headerTintColor: '#fff',
            ...(Platform.OS === 'web' && {
              headerShown: true,
              headerStyle: {
                backgroundColor: '#f4511e',
                height: 60,
              },
            }),
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              ...(Platform.OS === 'web' && {
                path: '/login',
              }),
            }} 
          />
          <Stack.Screen 
            name="signup" 
            options={{ 
              headerShown: false,
              ...(Platform.OS === 'web' && {
                path: '/signup',
              }),
            }} 
          />
          <Stack.Screen 
            name="tabs" 
            options={{ 
              headerShown: false,
              ...(Platform.OS === 'web' && {
                path: '/tabs',
              }),
            }} 
          />
        </Stack>
      </ProtectedRoute>
    </AuthProvider>
  );
}
