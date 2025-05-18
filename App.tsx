import React, { useState } from 'react';
import { Heart, MessageSquare, Menu, X } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import HealthProfile from '@/components/HealthProfile';
import { HealthProvider } from '@/context/HealthContext';
import { ChatProvider } from '@/context/ChatContext';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <HealthProvider>
      <ChatProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 md:p-6">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-800">HealthMate</h1>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-blue-800"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Sidebar/Navigation */}
            <nav className={`
              ${isMobileMenuOpen ? 'flex' : 'hidden'} 
              md:flex flex-row md:flex-col bg-white rounded-xl shadow-md p-4 md:w-64
            `}>
              <div className="hidden md:block mb-6">
                <h1 className="text-2xl font-bold text-blue-800">HealthMate</h1>
                <p className="text-sm text-gray-600">Your Personal Health Assistant</p>
              </div>
              
              <div className="flex flex-row md:flex-col gap-2 flex-1">
                <button 
                  onClick={() => {
                    setActiveTab('chat');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg text-left transition-all
                    ${activeTab === 'chat' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  <MessageSquare size={20} />
                  <span>Chat</span>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg text-left transition-all
                    ${activeTab === 'profile' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  <Heart size={20} />
                  <span>Health Profile</span>
                </button>
              </div>
              
              <div className="hidden md:block mt-auto pt-6 border-t text-xs text-gray-500">
                <p>Your data is stored locally and never shared.</p>
              </div>
            </nav>
            
            {/* Main Content Area */}
            <main className="flex-1">
              <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
                {activeTab === 'chat' ? (
                  <ChatInterface />
                ) : (
                  <HealthProfile />
                )}
              </div>
            </main>
          </div>
        </div>
      </ChatProvider>
    </HealthProvider>
  );
}

export default App;