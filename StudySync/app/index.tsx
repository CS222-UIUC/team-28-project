// app/index.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to My Calendar App</Text>
      <Button 
        title="Go to Login" 
        onPress={() => router.push('/login')}
      />
    </View>
  );
}
