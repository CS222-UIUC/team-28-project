import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export type TaskEntity = {
  task?: string;
  date?: string;
  time?: string;
  end_time?: string;
  participants?: string[];
  locations?: string[];
};

type Props = {
  initial: TaskEntity;
  onChange: (updated: TaskEntity) => void;
};

export default function TaskEditor({ initial, onChange }: Props) {
  const [task, setTask] = useState(initial.task || '');
  const [participants, setParticipants] = useState((initial.participants ?? []).join(', '));
  const [date, setDate] = useState(initial.date || '');
  const [time, setTime] = useState(initial.time || '');
  const [endTime, setEndTime] = useState(initial.end_time || '');
  const [locations, setLocations] = useState((initial.locations ?? []).join(', '));

  // Whenever any field changes, notify parent
  useEffect(() => {
    onChange({
      task,
      date,
      time,
      end_time: endTime,
      participants: participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p),
      locations: locations
        .split(',')
        .map(l => l.trim())
        .filter(l => l),
    });
  }, [task, participants, date, time, endTime, locations]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📝 Task</Text>
      <TextInput value={task} onChangeText={setTask} style={styles.input} />

      <Text style={styles.label}>👥 Participants (comma-separated)</Text>
      <TextInput value={participants} onChangeText={setParticipants} style={styles.input} />

      <Text style={styles.label}>📅 Date (YYYY-MM-DD)</Text>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      <Text style={styles.label}>🕒 Start Time (HH:MM)</Text>
      <TextInput value={time} onChangeText={setTime} style={styles.input} />

      <Text style={styles.label}>🕓 End Time (optional)</Text>
      <TextInput value={endTime} onChangeText={setEndTime} style={styles.input} />

      <Text style={styles.label}>📍 Locations (comma-separated)</Text>
      <TextInput value={locations} onChangeText={setLocations} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  label: { fontWeight: '600', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
});
