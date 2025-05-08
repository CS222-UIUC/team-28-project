import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTodosByDate, TaskEvent } from '../../api/todo'

const CARD_PURPLE = '#6a11cb';
const CARD_PURPLE_LIGHT = '#b794f4';

function formatTodayDate(date: Date) {
  const months = ['Jan ', 'Feb ', 'Mar ', 'Apr', 'May ', 'Jun ', 'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec '];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${date.getDate()} ${months[date.getMonth()]}${date.getFullYear()}, ${days[date.getDay()]}`;
}

export default function TodoScreen() {
  const [todos, setTodos] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');
  const formattedToday = formatTodayDate(today);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodosByDate(todayStr);
      setTodos(data);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
    setRefreshing(false);
  };

  const filteredTodos = todos.filter(t =>
    t.task.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (idx: number) => {
    setTodos(prev => prev.filter((_, i) => i !== idx));
    if (selectedIdx === idx) setSelectedIdx(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.todayLabel}>Today</Text>
      <Text style={styles.todayDate}>{formattedToday}</Text>
      <TextInput
        style={[styles.searchBar, { fontSize: 24, fontWeight: 'bold' }]}
        placeholder="Search"
        placeholderTextColor="#bbb"
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : filteredTodos.length === 0 ? (
        <Text style={styles.empty}>No tasks scheduled for today.</Text>
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={(_, i) => i.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => {
            const isSelected = selectedIdx === index;
            const people = item.participants?.length ? `(${item.participants.join(', ')})` : '';
            const time = item.time ? ` @ ${item.time}` : '';
            const cardText = `${item.task}${people}${time}`;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: isSelected ? CARD_PURPLE_LIGHT : CARD_PURPLE }]}
                onPress={() => setSelectedIdx(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardText}>{cardText}</Text>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingVertical: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  searchBar: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#eee',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: CARD_PURPLE,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 24, fontWeight: 'bold', color: '#9ca3af' },
  todayLabel: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 0,
  },
  todayDate: {
    fontSize: 16,
    color: '#bdbdbd',
    marginBottom: 16,
    marginTop: 2,
  },
});
