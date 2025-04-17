import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client ID from credentials.json
const GOOGLE_WEB_CLIENT_ID = "70522798885-alrv7qtb62qegfiqsj2pkegu5cdm1fq5.apps.googleusercontent.com";
const EXPO_CLIENT_ID = "70522798885-alrv7qtb62qegfiqsj2pkegu5cdm1fq5.apps.googleusercontent.com";

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: EXPO_CLIENT_ID,
    iosClientId: EXPO_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    responseType: "id_token",
    scopes: ['profile', 'email']
  });

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { id_token } = result.params;
        
        // Send the ID token to your backend
        const response = await fetch('http://localhost:3000/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: id_token,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Google sign-in failed');
        }

        // Store the authentication token
        await AsyncStorage.setItem('authToken', data.token);
        
        // Store user data
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        return { success: true, data };
      }
      
      return { success: false, error: 'Google sign-in was cancelled or failed' };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message || 'Something went wrong' };
    }
  };

  return {
    request,
    handleGoogleSignIn,
  };
}; 