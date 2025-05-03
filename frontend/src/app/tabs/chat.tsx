import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { createTaskFromText } from '../../api/todo';
import { useAuth } from '../../context/AuthContext';

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const handleSend = async () => {
    if (!input.trim() || !session?.user?.id) return;

    // Add user message
    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(true);
    setInput('');

    try {
      console.log('Sending to NLP API:', userMessage.text, session.user.id);
      const response: any = await createTaskFromText(userMessage.text, session.user.id);
      console.log('NLP API response:', response);
      if (response && (response.extracted || response.extracted_info)) {
        const extracted = response.extracted || response.extracted_info;
        setMessages(prev => [
          ...prev,
          {
            text: `I found these details:\n${buildExtractedMessage(extracted, response.missingFields || [])}`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      } else {
        console.log('No extracted info found in response:', response);
        setMessages(prev => [
          ...prev,
          {
            text: "I couldn't find any details in your message. Could you please provide the task details?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          text: "I couldn't find any details in your message. Could you please provide the task details?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to build a message showing extracted fields
  function buildExtractedMessage(extracted: any, missingFields: string[]) {
    let msg = '';
    msg += `\n- Task: "${extracted.task || '(missing)'}"`;
    msg += `\n- Date: ${extracted.date || '(missing)'}`;
    msg += `\n- Time: ${extracted.time || '(missing)'}`;
    msg += `\n- Participants: ${extracted.participants?.join(', ') || 'None'}`;
    msg += `\n- Locations: ${extracted.locations?.join(', ') || 'None'}`;
    return msg;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Chat with Task Assistant</Text>
      <Text style={styles.subheader}>Type your task in natural language</Text>
      
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.systemMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.systemMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your task here..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  systemMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  systemMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
});
