import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import TaskEditor, { TaskEntity } from '../../components/TaskEditor';
import { authorizedFetch } from '../../utils/authfetch'; // 确保你有这个
import TodayTaskSummary from '../../components/TodayTaskSummary';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const [taskJson, setTaskJson] = useState<TaskEntity | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: input }]);

    try {
      const res = await fetch('http://localhost:8080/api/nlp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { type: 'bot', text: `Extracted "${data.task}" on ${data.date} at ${data.time}` },
      ]);

      // 设置 JSON 数据用于编辑
      setTaskJson(data);

    } catch {
      setMessages(prev => [...prev, { type: 'bot', text: '⚠️ Error reaching the server.' }]);
    }

    setInput('');
  };

  const handleSave = async () => {
    if (!taskJson) return;
    try {
      const res = await authorizedFetch('http://localhost:8080/calendar/save_task', {
        method: 'POST',
        body: JSON.stringify(taskJson),
      });
      if (res.ok) {
        alert('✅ Saved to database!');
      } else {
        alert('❌ Failed to save.');
      }
    } catch (e) {
      console.error(e);
      alert('❌ Network error while saving.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ListHeaderComponent={<TodayTaskSummary />}
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Text
              style={[
                styles.message,
                item.type === 'user' ? styles.user : styles.bot,
              ]}
            >
              {item.text}
            </Text>
          )}
        />
        {taskJson && (
          <View>
            <TaskEditor initial={taskJson} onChange={setTaskJson} />
            <Button title="Save to Database" onPress={handleSave} />
            
          </View>
        )}
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your task..."
        />
        <Button title="Send" onPress={sendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
  },
  user: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  bot: {
    backgroundColor: '#EEE',
    alignSelf: 'flex-start',
  },
});
