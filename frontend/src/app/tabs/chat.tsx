import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { createTaskFromText } from '../../api/todo';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type TaskState = {
  task: string | null;
  date: string | null;
  time: string | null;
  participants: string[];
  locations: string[];
  currentMissingField: string | null;
};

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const [taskState, setTaskState] = useState<TaskState>({
    task: null,
    date: null,
    time: null,
    participants: [],
    locations: [],
    currentMissingField: null,
  });

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
      // If we're asking for a specific field, update that field
      if (taskState.currentMissingField) {
        // Process the response through NLP to extract entities
        const response: any = await createTaskFromText(input, session.user.id);
        const extracted = response.extracted || response.extracted_info;
        
        const updatedState = { ...taskState };
        switch (taskState.currentMissingField) {
          case 'task':
            updatedState.task = extracted.task || input;
            break;
          case 'date':
            updatedState.date = extracted.date || input;
            break;
          case 'time':
            updatedState.time = extracted.time || input;
            break;
          case 'participants':
            if (extracted.participants?.length) {
              updatedState.participants = [...updatedState.participants, ...extracted.participants];
            } else {
              updatedState.participants = [...updatedState.participants, input];
            }
            break;
          case 'locations':
            if (extracted.locations?.length) {
              updatedState.locations = [...updatedState.locations, ...extracted.locations];
            } else {
              updatedState.locations = [...updatedState.locations, input];
            }
            break;
        }
        setTaskState(updatedState);
        
        // Find next missing field
        const nextMissingField = findNextMissingField(updatedState);
        setTaskState(prev => ({ ...prev, currentMissingField: nextMissingField }));
        
        // Add system response
        if (nextMissingField) {
          setMessages(prev => [
            ...prev,
            {
              text: getFieldPrompt(nextMissingField),
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        } else {
          // All fields are filled, show summary
          setMessages(prev => [
            ...prev,
            {
              text: `Great! Here's your complete task:${buildExtractedMessage(updatedState)}`,
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        // Initial task processing
        console.log('Sending to NLP API:', userMessage.text, session.user.id);
        const response: any = await createTaskFromText(userMessage.text, session.user.id);
        console.log('NLP API response:', response);
        
        if (response && (response.extracted || response.extracted_info)) {
          const extracted = response.extracted || response.extracted_info;
          const missingFields = response.missingFields || [];
          
          // Update task state with extracted information
          setTaskState({
            task: extracted.task || null,
            date: extracted.date || null,
            time: extracted.time || null,
            participants: extracted.participants || [],
            locations: extracted.locations || [],
            currentMissingField: missingFields[0] || null,
          });
          
          let messageText = '';
          const foundInfo = buildExtractedMessage(extracted);
          if (foundInfo) {
            messageText = `I found these details:${foundInfo}`;
          }
          
          // If there are missing fields, ask for the first one
          if (missingFields.length > 0) {
            if (messageText) messageText += '\n\n';
            messageText += getFieldPrompt(missingFields[0]);
          }
          
          setMessages(prev => [
            ...prev,
            {
              text: messageText || "I couldn't find any details. What is the task?",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        } else {
          console.log('No extracted info found in response:', response);
          setMessages(prev => [
            ...prev,
            {
              text: "I couldn't find any details. What is the task?",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          text: "I couldn't find any details. What is the task?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setTaskState({
      task: null,
      date: null,
      time: null,
      participants: [],
      locations: [],
      currentMissingField: null,
    });
  };

  // Helper to find the next missing field
  function findNextMissingField(state: TaskState): string | null {
    if (!state.task) return 'task';
    if (!state.date) return 'date';
    if (!state.time) return 'time';
    if (state.participants.length === 0) return 'participants';
    if (state.locations.length === 0) return 'locations';
    return null;
  }

  // Helper to get prompt for a specific field
  function getFieldPrompt(field: string): string {
    switch (field) {
      case 'task':
        return 'What would you like to do?';
      case 'date':
        return 'What date is this for?';
      case 'time':
        return 'What time would you like to schedule this for?';
      case 'participants':
        return 'Who would you like to include?';
      case 'locations':
        return 'Where would you like to meet?';
      default:
        return '';
    }
  }

  // Helper to build a message showing extracted fields
  function buildExtractedMessage(extracted: any) {
    let msg = '';
    if (extracted.task) msg += `\n- Task: "${extracted.task}"`;
    if (extracted.date) msg += `\n- Date: ${extracted.date}`;
    if (extracted.time) msg += `\n- Time: ${extracted.time}`;
    if (extracted.participants?.length) msg += `\n- Participants: ${extracted.participants.join(', ')}`;
    if (extracted.locations?.length) msg += `\n- Locations: ${extracted.locations.join(', ')}`;
    return msg;
  }

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.logo} />
          <Text style={styles.welcomeTitle}>Hi, I'm StudySync.</Text>
          <Text style={styles.welcomeSubtitle}>What are you up to?</Text>
        </View>
      ) : (
        <>
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
          <View style={styles.newChatBarBottom}>
            <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.newChatText}>New chat</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    backgroundColor: '#181A20',
    padding: 0,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 24,
    paddingHorizontal: 18,
  },
  messageBubble: {
    padding: 21,
    borderRadius: 27,
    marginBottom: 15,
    maxWidth: '92%',
  },
  userMessage: {
    backgroundColor: '#6a11cb',
    alignSelf: 'flex-end',
    borderTopRightRadius: 9,
  },
  systemMessage: {
    backgroundColor: '#23242a',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 9,
  },
  messageText: {
    fontSize: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  systemMessageText: {
    color: '#e0e0e0',
  },
  timestamp: {
    fontSize: 18,
    color: '#888',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23242a',
    borderRadius: 36,
    padding: 15,
    margin: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 24,
    paddingHorizontal: 21,
    maxHeight: 150,
    color: '#fff',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  sendButton: {
    backgroundColor: '#6a11cb',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#444',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 12,
    color: '#b3b3b3',
    fontSize: 24,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: 36,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 27,
    color: '#b3b3b3',
    textAlign: 'center',
  },
  newChatBar: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  newChatBarBottom: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a11cb',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  newChatText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
