import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// These should be in a .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yqaxgrgxkwrmtukyyacs.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYXhncmd4a3dybXR1a3l5YWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NTI5MjEsImV4cCI6MjA2MDQyODkyMX0.HmgFnGy2XrnCfy3lOIWx0krb_1Y-2OSboJfilp6_2To';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
}); 