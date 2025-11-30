import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Agent, Message, ChatSession } from './types';
import { AGENTS } from './constants';
import { Search, Monitor, Terminal, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string>('session-1');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'New Research Project',
      messages: [],
      createdAt: new Date(),
    }
  ]);

  // Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Session',
      messages: [],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Update title based on first user message if it's "New Session"
        let title = s.title;
        if (s.title === 'New Session' && messages.length > 0) {
           const firstUserMsg = messages.find(m => m.role === 'user');
           if (firstUserMsg) {
             title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
           }
        }
        return { ...s, messages, title };
      }
      return s;
    }));
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${darkMode ? 'bg-adk-bg text-adk-text' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar 
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <main className="flex-1 flex flex-col h-full relative transition-all duration-300">
        <header className="h-14 border-b border-adk-border flex items-center justify-between px-6 bg-adk-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-adk-card rounded-md mr-2">
                <Monitor className="w-5 h-5 text-adk-textMuted" />
              </button>
            )}
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5 text-adk-accent" />
              <span>Orchestrator Control</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-1 text-xs text-adk-textMuted bg-adk-card px-3 py-1.5 rounded-full border border-adk-border">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>System Online</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <ChatInterface 
            session={currentSession}
            onUpdateMessages={(msgs) => updateSessionMessages(currentSession.id, msgs)}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
