import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { addMessage } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage(input.trim(), 'user');
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea as user types
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white rounded-lg shadow-lg p-3 transition-all duration-300 hover:shadow-xl focus-within:shadow-xl border border-gray-200"
    >
      <div className="flex items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your health question here..."
          className="flex-grow resize-none min-h-[20px] max-h-[120px] px-4 py-2 rounded-lg focus:outline-none"
          rows={1}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`ml-2 px-4 py-2 rounded-lg ${
            input.trim() 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transition-colors duration-200 flex items-center justify-center`}
        >
          <span>Send</span>
        </button>
      </div>
    </form>
  );
};

export default ChatInput;