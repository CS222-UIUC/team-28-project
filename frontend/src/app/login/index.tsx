// app/login/index.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.0.151:3000/login', { //when implementing, use your machine ip address to replace with the ip address here
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }
      await AsyncStorage.setItem('authToken', data.token);
  
      console.log('Login successful, token:', data.token);
  
      // Navigate to your home screen
      router.push('/tabs/chat');
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Your Calendar</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      
      <Button title="Login" onPress={handleLogin} />
      <Button title="Don't have an account? Sign up" onPress={() => router.push('/signup')}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 4,
  },
});