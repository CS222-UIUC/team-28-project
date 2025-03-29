import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
      }}
    />
  );
}
