import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const navItems = [
    { name: 'Chat', route: 'chat', icon: 'chatbubble-ellipses' as const },
    { name: 'To-Do', route: 'todo', icon: 'checkmark-done' as const },
    { name: 'Calendar', route: 'calendar', icon: 'calendar' as const },
  ];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#181A20', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24 }}>
      {navItems.map(item => (
        <TouchableOpacity
          key={item.name}
          onPress={() => router.replace(`./${item.route}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 32,
            backgroundColor: pathname.endsWith(item.route) ? '#6a11cb' : '#23242a',
            borderRadius: 18,
            paddingVertical: 8,
            paddingHorizontal: 18,
            overflow: 'hidden',
          }}
        >
          { !pathname.endsWith(item.route) && (
            <View style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0,0,0,0.35)',
              borderRadius: 18,
            }} />
          )}
          <Ionicons name={item.icon} size={28} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{item.name}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={handleLogout} style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: 24, backgroundColor: '#23242a' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 24 }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <TopNavBar />, // Custom header
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="todo" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
}
