import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { nanoid } from 'nanoid/non-secure';

const GEMINI_API_KEY = 'AIzaSyDobWJf_1kvufQeiNbnHu3Qd2NR1k3dZTw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const ChatContext = createContext({
  messages: [],
  addMessage: async () => {},
  clearChat: () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const loadMessages = async () => {
    try {
      const savedMessages = await SecureStore.getItemAsync('chatMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async (messageData) => {
    try {
      await SecureStore.setItemAsync('chatMessages', JSON.stringify(messageData));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Gemini API call
  const fetchGeminiResponse = async (userMessage) => {
    try {
      const prompt = `You are AushadX, a helpful and knowledgeable medical assistant. Answer the following user query with accurate, clear, and concise medical or health information. If the question is outside the medical or health domain, politely inform the user that you can only answer medical or health-related questions.

User: ${userMessage}
AushadX:`;

      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "I'm sorry, I couldn't find an answer. Please try rephrasing your question or consult a healthcare professional for more details."
      );
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  };

  // Make addMessage async
  const addMessage = async (content, sender) => {
    const newMessage = {
      id: nanoid(),
      content,
      sender,
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (sender === 'user') {
      // Get Gemini response
      const botResponse = await fetchGeminiResponse(content);

      const botMessage = {
        id: nanoid(),
        content: botResponse,
        sender: 'bot',
        timestamp: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};
