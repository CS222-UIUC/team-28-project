import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    // Basic email format validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      console.log('Attempting signup with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Error', error.message);
        return;
      }
      // Insert into custom users table if signup is successful
      if (data.user) {
        const { id } = data.user;
        const { error: userInsertError } = await supabase
          .from('users')
          .insert([
            { id, email }
          ]);
        if (userInsertError) {
          console.error('Error inserting into users table:', userInsertError);
        }
      }
      console.log('Signup successful:', data);
      Alert.alert('Success', 'Account created successfully! Please check your email for verification.');
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/mountain-silhouette.jpg')}
      style={styles.purpleBackground}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.centeredContainer}>
          <BlurView intensity={60} tint="dark" style={styles.glassCard}>
            <Text style={styles.title}>StudySync</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                placeholderTextColor="#fff"
              />
              <Ionicons name="mail-outline" size={22} color="#fff" style={styles.inputIconRight} />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                placeholderTextColor="#fff"
              />
              <Ionicons name="lock-closed-outline" size={22} color="#fff" style={styles.inputIconRight} />
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/login')}
              disabled={loading}
            >
              <Text style={styles.registerText}>Already have an account? <Text style={{ color: '#b3c6ff', textDecorationLine: 'underline' }}>Login</Text></Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  purpleBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    width: 440,
    padding: 40,
    borderRadius: 28,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    marginBottom: 20,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  input: {
    flex: 1,
    height: 54,
    color: '#fff',
    fontSize: 18,
    backgroundColor: 'transparent',
    outline: 'none',
  },
  inputIconRight: {
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#6a11cb',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    color: '#e0e0ff',
    fontSize: 16,
    textAlign: 'center',
  },
});
