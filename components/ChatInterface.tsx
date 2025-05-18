import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '@/context/ChatContext';

const ChatInterface: React.FC = () => {
  const { messages, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Health Assistant</h2>
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="text-blue-100 hover:text-white text-sm"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="bg-blue-100 rounded-full p-6 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Welcome to Your Health Assistant</h3>
            <p className="text-gray-600 max-w-md">
              Ask me anything about your health, and I'll provide personalized guidance based on your health profile.
            </p>
            <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-1">Try asking:</p>
              <ul className="space-y-1 list-disc list-inside text-left">
                <li>"I have a headache, what should I do?"</li>
                <li>"What's in my health profile?"</li>
                <li>"How can I improve my sleep?"</li>
                <li>"What should I eat for better energy?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-100 border-t">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatInterface;