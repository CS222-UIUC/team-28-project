import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getTodosByDate } from '../api/todo';

export default function TodayTaskSummary() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getTodosByDate(today)
      .then(data => setCount(data.length))
      .catch(() => setCount(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ margin: 10 }} />;
  }

  if (count === null) {
    return <Text style={styles.text}>⚠️ Failed to load today's tasks.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🎯 You have {count} task{count === 1 ? '' : 's'} today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    margin: 10,
  },
  text: {
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '600',
    textAlign: 'center',
  },
});
