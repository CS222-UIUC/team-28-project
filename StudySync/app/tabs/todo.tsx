import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getTodosByDate, TaskEvent } from '../../api/todo'

export default function TodoScreen() {
  const [todos, setTodos] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0]; // '2025-05-01'

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📅 Tasks for Today ({todayStr})</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : todos.length === 0 ? (
        <Text style={styles.empty}>No tasks scheduled for today.</Text>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(_, i) => i.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>• {item.task}</Text>
              {item.time && <Text style={styles.meta}>🕒 {item.time}</Text>}
              {item.locations?.length > 0 && (
                <Text style={styles.meta}>📍 {item.locations.join(', ')}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  item: { marginBottom: 12, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 14, color: '#6b7280' },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#9ca3af' },
});
