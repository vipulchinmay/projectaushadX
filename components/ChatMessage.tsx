import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={[styles.sender, isUser ? styles.userSender : styles.botSender]}>
          {isUser ? 'You' : 'HealthBot'}
        </Text>
        <Text style={[styles.content, isUser ? styles.userContent : styles.botContent]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#4361EE',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sender: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  userSender: {
    color: '#E2E8F0',
  },
  botSender: {
    color: '#2D3748',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  userContent: {
    color: '#FFFFFF',
  },
  botContent: {
    color: '#2D3748',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#E2E8F0',
  },
  botTimestamp: {
    color: '#718096',
  },
});

export default ChatMessage;