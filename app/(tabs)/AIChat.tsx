import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useLanguage } from '@/components/LanguageContext';
import translations from '@/components/translation';

// Replace with your Gemini API key
const GEMINI_API_KEY = 'AIzaSyB91pjFVJq3NbLfU0sV4dQPnkl3DQSCqRo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your AushadX AI assistant. I can help you with medical questions, general health advice, or just have a friendly conversation. What's on your mind today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const { language } = useLanguage();
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const t = (key) => translations[language]?.[key] || key;

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Enhanced conversation context management
  const updateConversationContext = (userMessage, botResponse) => {
    const newContext = {
      user: userMessage,
      bot: botResponse,
      timestamp: new Date(),
    };
    
    setConversationContext(prev => {
      const updated = [...prev, newContext];
      // Keep last 5 exchanges for context
      return updated.slice(-5);
    });
  };

  // Enhanced natural language processing
  const analyzeMessage = (message) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Detect message type and intent
    const analysis = {
      type: 'general',
      intent: 'conversation',
      entities: [],
      sentiment: 'neutral',
      medicalRelevance: 0,
    };

    // Medical keywords with weights
    const medicalKeywords = {
      symptoms: ['pain', 'ache', 'hurt', 'fever', 'cough', 'headache', 'nausea', 'dizzy', 'tired', 'fatigue', 'swelling', 'rash', 'itching'],
      conditions: ['diabetes', 'hypertension', 'asthma', 'arthritis', 'migraine', 'depression', 'anxiety', 'insomnia', 'allergy'],
      treatments: ['medicine', 'medication', 'treatment', 'therapy', 'surgery', 'exercise', 'diet', 'prescription'],
      body_parts: ['head', 'chest', 'stomach', 'back', 'leg', 'arm', 'heart', 'lung', 'kidney', 'liver'],
      general_health: ['health', 'wellness', 'fitness', 'nutrition', 'sleep', 'stress', 'weight', 'blood pressure']
    };

    // Calculate medical relevance score
    let medicalScore = 0;
    Object.values(medicalKeywords).forEach(categoryWords => {
      categoryWords.forEach(word => {
        if (lowerMessage.includes(word)) {
          medicalScore += 1;
          analysis.entities.push(word);
        }
      });
    });

    analysis.medicalRelevance = Math.min(medicalScore / 3, 1); // Normalize to 0-1

    // Detect question patterns
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who', 'can', 'should', 'will', 'is', 'are', 'do', 'does'];
    const hasQuestionWord = questionWords.some(word => lowerMessage.startsWith(word));
    const hasQuestionMark = message.includes('?');
    
    if (hasQuestionWord || hasQuestionMark) {
      analysis.intent = 'question';
    }

    // Detect greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you'];
    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
      analysis.intent = 'greeting';
    }

    // Detect sentiment
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'pleased', 'thank'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worried', 'concerned', 'scared', 'pain', 'hurt', 'sick'];
    
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) analysis.sentiment = 'positive';
    else if (negativeCount > positiveCount) analysis.sentiment = 'negative';

    return analysis;
  };

  // Enhanced response generation
  const generateResponse = async (userMessage, analysis) => {
    try {
      // Handle different types of conversations
      if (analysis.intent === 'greeting') {
        return generateGreetingResponse(analysis.sentiment);
      }

      if (analysis.medicalRelevance > 0.3) {
        return generateMedicalResponse(userMessage, analysis);
      }

      return generateGeneralResponse(userMessage, analysis);

    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm having trouble processing that right now. Could you try rephrasing your question?";
    }
  };

  const generateGreetingResponse = (sentiment) => {
    const greetings = [
      "Hello there! I'm doing well, thank you for asking. How can I assist you today?",
      "Hi! Great to hear from you. What would you like to talk about?",
      "Hey! I'm here and ready to help. What's on your mind?",
      "Good to see you! How are you feeling today? Is there anything I can help you with?"
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const generateMedicalResponse = (message, analysis) => {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced medical responses with more natural language
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return "I understand you're dealing with head pain. Headaches can have various causes - from stress and dehydration to eye strain or lack of sleep. For mild headaches, try resting in a quiet, dark room, staying hydrated, and gentle neck stretches. If headaches are severe, frequent, or accompanied by other symptoms like vision changes or nausea, it's important to consult a healthcare professional. Have you noticed any patterns with your headaches?";
    }
    
    if (lowerMessage.includes('cold') || lowerMessage.includes('flu') || lowerMessage.includes('fever')) {
      return "It sounds like you might be dealing with cold or flu symptoms. These viral infections are common and usually resolve on their own with proper care. Focus on getting plenty of rest, staying well-hydrated, and eating nourishing foods. Over-the-counter medications can help manage symptoms. If your fever is very high (over 103°F/39.4°C) or if symptoms worsen after improving, please seek medical attention. How long have you been feeling unwell?";
    }

    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return "I hear that you're feeling stressed or anxious - that's completely understandable, and you're not alone in feeling this way. Stress and anxiety are common experiences, especially in today's world. Some helpful techniques include deep breathing exercises, regular physical activity, maintaining a consistent sleep schedule, and connecting with supportive people in your life. If these feelings are overwhelming or interfering with your daily life, consider speaking with a mental health professional. What's been causing you the most stress lately?";
    }

    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      return "Sleep issues can really affect how we feel and function. Good sleep hygiene is crucial for overall health. Try establishing a consistent bedtime routine, avoiding screens before bed, keeping your bedroom cool and dark, and limiting caffeine in the afternoon. Regular exercise can also improve sleep quality, but avoid vigorous activity close to bedtime. If sleep problems persist for more than a few weeks, it might be worth discussing with a healthcare provider. How has your sleep been recently?";
    }

    // More comprehensive medical responses...
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('weight')) {
      return "Nutrition plays a vital role in our overall health and wellbeing. A balanced approach focusing on whole foods - plenty of vegetables, fruits, lean proteins, and whole grains - usually works best. Rather than restrictive diets, sustainable lifestyle changes tend to be more effective long-term. Everyone's nutritional needs are different based on their age, activity level, and health conditions. If you have specific health goals or concerns, a registered dietitian can provide personalized guidance. What aspects of nutrition are you most interested in?";
    }

    // Generic medical response for other medical queries
    return "Thank you for sharing your health concern with me. While I can provide general health information, it's important to remember that everyone's situation is unique. For specific medical advice, diagnosis, or treatment recommendations, please consult with a qualified healthcare professional who can properly evaluate your individual circumstances. Is there any general health information I can help clarify for you?";
  };

  const generateGeneralResponse = (message, analysis) => {
    const lowerMessage = message.toLowerCase();

    // Handle common conversational topics
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
      return "Thank you for asking! I'm functioning well and ready to help. I enjoy our conversations and learning about different topics. How are you doing today?";
    }

    if (lowerMessage.includes('what can you do') || lowerMessage.includes('what are your capabilities')) {
      return "I can help with a variety of things! I'm particularly knowledgeable about health and medical topics, but I can also have general conversations, answer questions on various subjects, help with problem-solving, or just chat about whatever interests you. What would you like to explore today?";
    }

    if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
      return "You're very welcome! I'm glad I could help. Is there anything else you'd like to discuss or any other questions I can answer for you?";
    }

    if (lowerMessage.includes('weather')) {
      return "I don't have access to current weather data, but I'd be happy to discuss general weather-related health topics, like how weather changes can affect our mood, or tips for staying healthy in different seasons. What weather-related topic interests you?";
    }

    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      return "Here's a light-hearted one for you: Why did the doctor carry a red pen? In case they needed to draw blood! 😄 I hope that brought at least a small smile to your face. Laughter really can be good medicine sometimes!";
    }

    // Context-aware responses
    if (conversationContext.length > 0) {
      const lastContext = conversationContext[conversationContext.length - 1];
      if (lowerMessage.includes('more about') || lowerMessage.includes('tell me more')) {
        return "I'd be happy to elaborate on what we were discussing! Could you be more specific about which part you'd like me to expand on?";
      }
    }

    // Default conversational response
    const responses = [
      "That's interesting! Tell me more about what you're thinking.",
      "I appreciate you sharing that with me. What would you like to explore further?",
      "That's a good point. How do you feel about that topic?",
      "I find that perspective intriguing. What led you to think about this?",
      "Thank you for bringing that up. Is there a particular aspect you'd like to discuss more?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Enhanced message processing
  const sendMessageToGemini = async (userMessage) => {
    try {
      setIsLoading(true);
      setTypingIndicator(true);
      
      // Analyze the message
      const analysis = analyzeMessage(userMessage);
      
      // Simulate processing time with typing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Simulate realistic response time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Generate contextual response
      const response = await generateResponse(userMessage, analysis);
      
      // Update conversation context
      updateConversationContext(userMessage, response);
      
      return response;

    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize, but I'm having some technical difficulties right now. Please try again in a moment.";
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
      typingAnimation.stopAnimation();
    }
  };

  // Enhanced message handling
  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Get AI response
    const aiResponse = await sendMessageToGemini(userMessage.text);

    // Add AI response to chat
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    
    // Read out the AI response
    speakMessage(aiResponse);
  };

  // Enhanced text-to-speech with better controls
  const speakMessage = (message) => {
    if (isSpeaking) {
      Speech.stop();
    }
    
    setIsSpeaking(true);
    
    // Clean message for better speech synthesis
    const cleanMessage = message.replace(/[😄🙂😊]/g, '').trim();
    
    Speech.speak(cleanMessage, {
      language: language === 'hi' ? 'hi-IN' : 'en-US',
      pitch: 1.0,
      rate: 0.85,
      volume: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  // Enhanced voice input with better sample queries
  const handleVoiceInput = async (recordingUri) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sampleQueries = [
      // Medical queries
      "I've been having headaches lately, what could be causing them?",
      "How can I improve my sleep quality?",
      "What are some natural ways to reduce stress?",
      "I'm feeling anxious about my health, can you help?",
      "What should I eat for better nutrition?",
      "How much exercise do I need each week?",
      "I have a persistent cough, should I be concerned?",
      "What are the symptoms of dehydration?",
      "How can I boost my immune system?",
      "I'm having trouble concentrating, any suggestions?",
      
      // Conversational queries
      "How are you doing today?",
      "What can you help me with?",
      "I'm feeling a bit down, can we chat?",
      "Tell me something interesting about health",
      "What's the best way to stay motivated?",
      "I'm bored, what should we talk about?",
      "Can you tell me a joke?",
      "What do you think about mental health?",
      "How important is work-life balance?",
      "What makes a person healthy and happy?"
    ];
    
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    
    const userMessage = {
      id: Date.now().toString(),
      text: randomQuery,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    const aiResponse = await sendMessageToGemini(randomQuery);
    
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
    
    speakMessage(aiResponse);
  };

  // Voice recording functions (unchanged)
  const startRecording = async () => {
    try {
      if (isSpeaking) {
        stopSpeaking();
      }
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingObject.startAsync();

      setRecording(recordingObject);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      handleVoiceInput(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Processing Error', 'There was an error processing your voice input. Please try again.');
      setRecording(null);
    }
  };

  const clearChat = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the chat history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: () => {
            setMessages([
              {
                id: '1',
                text: "Hello! I'm your AushadX AI assistant. I can help you with medical questions, general health advice, or just have a friendly conversation. What's on your mind today?",
                sender: 'bot',
                timestamp: new Date(),
              },
            ]);
            setConversationContext([]);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={['#121212', '#1E1E1E', '#252525']} style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AushadX AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {isSpeaking ? 'Speaking...' : typingIndicator ? 'Typing...' : 'Online'}
            </Text>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.messageContainer}>
              <TouchableOpacity 
                activeOpacity={item.sender === 'bot' ? 0.7 : 1}
                onPress={() => item.sender === 'bot' && speakMessage(item.text)}
              >
                <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
                  <Text style={styles.messageText}>{item.text}</Text>
                  <View style={styles.messageFooter}>
                    <Text style={styles.timestamp}>
                      {formatTime(item.timestamp)}
                    </Text>
                    {item.sender === 'bot' && (
                      <TouchableOpacity 
                        style={styles.speakButton}
                        onPress={() => speakMessage(item.text)}
                      >
                        <Ionicons name="volume-medium-outline" size={14} color="rgba(255,255,255,0.6)" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {typingIndicator && (
          <Animated.View style={[styles.typingIndicator, { opacity: typingAnimation }]}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
            <Text style={styles.typingText}>AushadX is thinking...</Text>
          </Animated.View>
        )}

        {isSpeaking && (
          <TouchableOpacity style={styles.stopSpeakingButton} onPress={stopSpeaking}>
            <Ionicons name="stop-circle" size={20} color="#FF4444" />
            <Text style={styles.stopSpeakingText}>Stop Speaking</Text>
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
              style={[styles.voiceButton, recording && styles.recordingButton]}
              disabled={isLoading}
            >
              <Ionicons name={recording ? 'stop-circle' : 'mic'} size={22} color="white" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about health or just chat..."
              placeholderTextColor="#9e9e9e"
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              editable={!isLoading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  gradientBackground: { flex: 1, width: '100%' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
  headerSubtitle: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.6)', 
    marginTop: 2 
  },
  backButton: { padding: 8 },
  clearButton: { padding: 8 },
  messageList: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
  messageContainer: {
    marginBottom: 12,
  },
  messageBubble: { 
    maxWidth: '85%', 
    padding: 14, 
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#4466EE',
    borderBottomRightRadius: 4,
  },
  botMessage: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#2C2C2E',
    borderBottomLeftRadius: 4,
  },
  messageText: { 
    color: 'white', 
    fontSize: 16, 
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  speakButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(68,102,238,0.2)',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(44,44,46,0.8)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4466EE',
    marginHorizontal: 2,
  },
  typingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  stopSpeakingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  stopSpeakingText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  inputContainer: { 
    width: '100%', 
    marginTop: 'auto', 
    padding: 16,
    backgroundColor: 'rgba(18,18,18,0.9)',
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    backgroundColor: '#2C2C2E', 
    borderRadius: 24, 
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  input: { 
    flex: 1, 
    color: 'white', 
    fontSize: 16, 
    marginHorizontal: 12,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: { 
    padding: 10,
    backgroundColor: '#4466EE',
    borderRadius: 20,
    marginLeft: 4,
  },
  disabledButton: { opacity: 0.5 },
  voiceButton: { 
    padding: 10, 
    backgroundColor: '#4466EE', 
    borderRadius: 20, 
    marginRight: 4,
  },
  recordingButton: { backgroundColor: '#FF4444' },
});