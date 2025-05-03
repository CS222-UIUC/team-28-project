import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#f4511e' },
            headerTintColor: '#fff',
          }}
        >
          {/* These routes will use Stack headers by default */}
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="signup/index" options={{ headerShown: false }} />

          {/* The tabs layout will manage its own headers */}
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
        </Stack>
      </ProtectedRoute>
    </AuthProvider>
  );
}
