import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
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
  );
}
