// app/login/index.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        Alert.alert('Login failed', error.message);
        return;
      }
      if (Platform.OS === 'web') {
        window.location.href = '/tabs/chat';
      } else {
        router.push('/tabs/chat');
      }
    } catch (error) {
      console.error('Login error:', error);
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
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
                <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={18} color="#fff" />
                <Text style={styles.rememberMeText}> Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Forgot password?', 'Password reset coming soon!')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/signup')}
              disabled={loading}
            >
              <Text style={styles.registerText}>Don't have an account? <Text style={{ color: '#b3c6ff', textDecorationLine: 'underline' }}>Register</Text></Text>
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#fff',
    fontSize: 15,
  },
  forgotText: {
    color: '#fff',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: '500',
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
